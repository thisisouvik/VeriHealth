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
    const { Contract } = await import("../../../../contracts/artifacts/contract/index.js");
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

    const fs = await import("fs/promises");
    const path = await import("path");
    const zkConfigProvider = new (class extends ZKConfigProvider<string> {
      async getVerifierKey(circuitId: string) {
        const filePath = path.join(process.cwd(), "contracts", "artifacts", "keys", `${circuitId}.verifier`);
        const buf = await fs.readFile(filePath);
        return new Uint8Array(buf) as any;
      }
      async getProverKey(circuitId: string) {
        const filePath = path.join(process.cwd(), "contracts", "artifacts", "keys", `${circuitId}.prover`);
        const buf = await fs.readFile(filePath);
        return new Uint8Array(buf) as any;
      }
      async getZKIR(circuitId: string) {
        const filePath = path.join(process.cwd(), "contracts", "artifacts", "zkir", `${circuitId}.zkir`);
        const buf = await fs.readFile(filePath);
        return new Uint8Array(buf) as any;
      }
    })();

    // 6. Proof provider (server-side HTTP call to prover)
    const proofProvider = httpClientProofProvider(PROVER_URI, zkConfigProvider as any);

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
    const { createUnprovenCallTx } = await import("@midnight-ntwrk/midnight-js-contracts");

    const contract = new Contract({});
    const compiledContract = CompiledContract.withVacantWitnesses(
      CompiledContract.make("verihealth", Contract as never) as never
    ) as never;
    
    const { sampleEncryptionPublicKey } = await import("@midnight-ntwrk/midnight-js-protocol/ledger");
    const coinPublicKey = body.coinPublicKey as never;
    const contractAddress = body.contractAddress;
    const issuerKeyStr = body.issuerPublicKey;

    if (!coinPublicKey || !contractAddress || !issuerKeyStr) {
      throw new Error("Missing required fields in request body");
    }
    const encPublicKey = sampleEncryptionPublicKey(1) as never;

    // Convert string to 32 bytes for the smart contract arg
    const crypto = await import("crypto");
    // We assume the issuerPublicKey is just a string, we hash it to fit 32 bytes
    const issuerHash = new Uint8Array(crypto.createHash("sha256").update(issuerKeyStr).digest());

    const unprovenTx = await createUnprovenCallTx(
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
        contractAddress,
        circuitId: "register_issuer",
        args: [issuerHash]
      } as never
    );

    console.log("Proving register_issuer transaction...");
    const provenTx = await proofProvider.proveTx(unprovenTx.private.unprovenTx);
    const provenTxHex = Buffer.from(provenTx.serialize()).toString("hex");

    return NextResponse.json({
      success: true,
      message: "Proved register_issuer tx created.",
      provenTxHex,
    });
  } catch (error: any) {
    console.error("Contract call failed:", error);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
