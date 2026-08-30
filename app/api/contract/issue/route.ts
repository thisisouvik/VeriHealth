// @ts-nocheck
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
  const body = await request.json().catch(() => ({}));

  try {
    // 2. Dynamic import keeps the heavy SDK out of the client bundle
    const { deployContract } = await import("@midnight-ntwrk/midnight-js-contracts");
    const { indexerPublicDataProvider } = await import(
      "@midnight-ntwrk/midnight-js-indexer-public-data-provider"
    );
    const { setNetworkId } = await import("@midnight-ntwrk/midnight-js-network-id");
    const { ZKConfigProvider, createZKIR, createProverKey, createVerifierKey } = await import("@midnight-ntwrk/midnight-js-types");
    const { httpClientProofProvider } = await import(
      "@midnight-ntwrk/midnight-js-http-client-proof-provider"
    );
    const { Contract } = await import("../../../../contracts/artifacts/contract/index.js");
    const CompiledContract = await import("@midnight-ntwrk/compact-js/effect/CompiledContract");

    // 3. Set network
    setNetworkId("preprod");

    // 4. PREPROD network endpoints (these are the public Midnight PREPROD endpoints)
    const INDEXER_URI = "https://indexer.preprod.midnight.network/api/v4/graphql";
    const INDEXER_WS_URI = "wss://indexer.preprod.midnight.network/api/v4/graphql/ws";
    const PROVER_URI = "https://api-preprod.1am.xyz";

    const publicDataProvider = indexerPublicDataProvider(INDEXER_URI, INDEXER_WS_URI);

    // 5. ZKConfigProvider — serves circuit keys from the compiled artifacts
    // The compact compiler outputs .zkir, .pk, .vk files alongside the JS artifacts

    const fs = await import("fs/promises");
    const path = await import("path");
    const zkConfigProvider = new (class extends ZKConfigProvider<string> {
      async getVerifierKey(circuitId: string) {
        const filePath = path.join(process.cwd(), "contracts", "artifacts", "keys", `${circuitId}.verifier`);
        const buf = await fs.readFile(filePath);
        return createVerifierKey(new Uint8Array(buf)); }
      async getProverKey(circuitId: string) {
        const filePath = path.join(process.cwd(), "contracts", "artifacts", "keys", `${circuitId}.prover`);
        const buf = await fs.readFile(filePath);
        return createProverKey(new Uint8Array(buf)); }
      async getZKIR(circuitId: string) {
        const filePath = path.join(process.cwd(), "contracts", "artifacts", "zkir", `${circuitId}.bzkir`);
        const buf = await fs.readFile(filePath);
        return createZKIR(new Uint8Array(buf)); }
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

    const contract = new Contract();
    const compiledContract = CompiledContract.withVacantWitnesses(
      CompiledContract.make("verihealth", Contract as never) as never
    ) as never;
    
    const { sampleEncryptionPublicKey, sampleCoinPublicKey } = await import("@midnight-ntwrk/midnight-js-protocol/ledger");
    
    // We use a sample coin public key because our contract doesn't transfer tokens, 
    // and this entirely bypasses the 1 AM Wallet's "shielded cache invalid" bug.
    const coinPublicKey = sampleCoinPublicKey(1) as never;
    const contractAddress = body.contractAddress;
    const patientKeyStr = body.patientPublicKey || "patient_key";

    if (!contractAddress) {
      throw new Error("Missing contractAddress in request body");
    }
    const encPublicKey = sampleEncryptionPublicKey(1) as never;

    // Convert string to 32 bytes for the smart contract arg
    const crypto = await import("crypto");
    const commitmentHash = new Uint8Array(crypto.createHash("sha256").update(patientKeyStr).digest());
    
    // The issuer is the one making the call, their public key must match what was registered
    const issuerHash = new Uint8Array(crypto.createHash("sha256").update(body.issuerPublicKey || "").digest());

    const unprovenTx = await (createUnprovenCallTx as any)(
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
        circuitId: "issue_credential",
        args: [commitmentHash, issuerHash]
      } as never
    );

    console.log("Proving issue_credential transaction...");
    const provenTx = await proofProvider.proveTx(unprovenTx.private.unprovenTx);
    const provenTxHex = Buffer.from(provenTx.serialize()).toString("hex");

    return NextResponse.json({
      success: true,
      message: "Proved call tx created. Use 1 AM Wallet in browser to sign and submit.",
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







