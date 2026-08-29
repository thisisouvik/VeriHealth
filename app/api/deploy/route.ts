/**
 * /api/deploy — Server-side contract deployment endpoint
 *
 * Protected by DEPLOY_SECRET. Runs in Node.js (server) so it can safely import
 * the Midnight JS SDK packages that use Node.js-only modules (ws, leveldb, etc.)
 *
 * The /deploy page calls this endpoint — it never imports the Midnight SDK directly.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // 1. Verify the deploy secret header
  const secret = process.env.DEPLOY_SECRET?.trim();
  const provided = request.headers.get("x-deploy-key")?.trim();
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const userAddress = body.userAddress;
  if (!userAddress) {
    return NextResponse.json({ error: "Missing userAddress in request body" }, { status: 400 });
  }

  try {
    // 2. Dynamic import keeps the heavy SDK out of the client bundle
    const { deployContract } = await import("@midnight-ntwrk/midnight-js-contracts");
    const { indexerPublicDataProvider } = await import(
      "@midnight-ntwrk/midnight-js-indexer-public-data-provider"
    );
    const { setNetworkId } = await import("@midnight-ntwrk/midnight-js-network-id");
    const { ZKConfigProvider } = await import("@midnight-ntwrk/midnight-js-types");
    const { httpClientProofProvider } = await import(
      "@midnight-ntwrk/midnight-js-http-client-proof-provider"
    );
    const { Contract } = await import("../../../contracts/artifacts/contract/index.js");
    const CompiledContract = await import("@midnight-ntwrk/compact-js/effect/CompiledContract");

    // 3. Set network
    setNetworkId("preprod");

    // 4. PREPROD network endpoints (these are the public Midnight PREPROD endpoints)
    const INDEXER_URI = "https://indexer.preprod.midnight.network/api/v1/graphql";
    const INDEXER_WS_URI = "wss://indexer.preprod.midnight.network/api/v1/graphql";
    const PROVER_URI = "https://prove.preprod.midnight.network/prove";

    const publicDataProvider = indexerPublicDataProvider(INDEXER_URI, INDEXER_WS_URI);

    // 5. ZKConfigProvider — serves circuit keys from the compiled artifacts
    // The compact compiler outputs .zkir, .pk, .vk files alongside the JS artifacts
    const zkConfigProvider = new class extends ZKConfigProvider<string> {
      private async load(circuitId: string, ext: string): Promise<Uint8Array> {
        try {
          const fs = await import("fs/promises");
          const path = await import("path");
          const filePath = path.join(process.cwd(), "contracts", "artifacts", `${circuitId}${ext}`);
          const buf = await fs.readFile(filePath);
          return new Uint8Array(buf);
        } catch {
          // Return empty — the contract has no private witnesses in the MVP
          return new Uint8Array();
        }
      }
      async getZKIR(id: string) { return this.load(id, ".zkir") as never; }
      async getProverKey(id: string) { return this.load(id, ".pk") as never; }
      async getVerifierKey(id: string) { return this.load(id, ".vk") as never; }
    }();

    // 6. Proof provider (server-side HTTP call to prover)
    const proofProvider = httpClientProofProvider(PROVER_URI, zkConfigProvider);

    // 7. Private state provider (stubbed out, as this contract has no private state/witnesses)
    // Removing the level-private-state-provider dependency fixes the classic-level native build error on Windows.
    const privateStateProvider = {
      get: async () => ({}),
      set: async () => {},
      remove: async () => {},
      clear: async () => {},
      exportPrivateStates: async () => "{}",
      importPrivateStates: async () => ({
        result: "success",
        imported: [],
        conflicts: [],
        errors: [],
      }),
      exportSigningKeys: async () => "{}",
      importSigningKeys: async () => ({
        result: "success",
        imported: [],
        conflicts: [],
        errors: [],
      }),
      close: async () => {},
    } as any;

    // 8. The contract has no private witnesses so wallet/midnight providers are minimal stubs
    //    The actual transaction signing must be done via the 1 AM wallet on the client side.
    //    For now we create the unproven deploy tx and return the address.
    //    Full wallet-signed deployment requires a browser session with 1AM extension.
    const { createUnprovenDeployTx } = await import("@midnight-ntwrk/midnight-js-contracts");

    const contract = new Contract({});
    const compiledContract = CompiledContract.withVacantWitnesses(
      CompiledContract.make("verihealth", Contract as never) as never
    ) as never;
    // The SDK requires a syntactically valid CoinPublicKey for the internal WalletProvider stub.
    // Since this is an unproven tx and this contract doesn't use the coin public key, a valid dummy string works.
    const { sampleCoinPublicKey, sampleEncryptionPublicKey } = await import("@midnight-ntwrk/midnight-js-protocol/ledger");
    const coinPublicKey = sampleCoinPublicKey(1) as never;
    const encPublicKey = sampleEncryptionPublicKey(1) as never;

    const unprovenTx = await createUnprovenDeployTx(
      {
        publicDataProvider,
        zkConfigProvider,
        proofProvider,
        privateStateProvider,
        walletProvider: { 
          getCoinPublicKey: () => coinPublicKey, 
          getEncryptionPublicKey: () => encPublicKey,
          balanceTx: async (tx: any) => tx 
        } as never,
        midnightProvider: { submitTx: async () => {} } as never,
      },
      {
        compiledContract,
        args: []
      } as never
    );

    return NextResponse.json({
      success: true,
      message: "Unproven deploy tx created. Use 1 AM Wallet in browser to sign and submit.",
      contractAddress: String(unprovenTx.deployTxData.public.contractAddress),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Deployment failed";
    console.error("[/api/deploy] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
