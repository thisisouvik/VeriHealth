/**
 * VeriHealth Smart Contract Deployment
 *
 * Deploys the compiled verihealth.compact contract to the Midnight PREPROD network
 * using the 1 AM Wallet's DApp Connector API v4. All network configuration is sourced
 * from the wallet itself — nothing is hardcoded.
 *
 * This module is designed to run in the browser via the /deploy page.
 */

import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { deployContract } from "@midnight-ntwrk/midnight-js-contracts";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { ZKConfigProvider, type ZKIR, type ProverKey, type VerifierKey } from "@midnight-ntwrk/midnight-js-types";
import { Contract } from "../contracts/artifacts/contract/index.js";

export type DeployResult = {
  contractAddress: string;
};

/**
 * A ZKConfigProvider that delegates key loading to the wallet's Proof Station.
 * The wallet's getProvingProvider already wraps the KeyMaterialProvider interface,
 * so for deployContract we build a thin ZKConfigProvider over it.
 *
 * For our VeriHealth contract the artifacts are served from /contracts/artifacts/.
 * The compact compiler outputs keys at e.g. contract/issue_credential.pk etc.
 */
class WalletDelegatedZKConfigProvider extends ZKConfigProvider<string> {
  constructor(private readonly baseUrl: string) {
    super();
  }

  private async fetchBytes(path: string): Promise<Uint8Array> {
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) throw new Error(`Failed to fetch ZK artifact: ${path} (${res.status})`);
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  }

  async getZKIR(circuitId: string): Promise<ZKIR> {
    return this.fetchBytes(`/contracts/artifacts/${circuitId}.zkir`) as unknown as ZKIR;
  }

  async getProverKey(circuitId: string): Promise<ProverKey> {
    return this.fetchBytes(`/contracts/artifacts/${circuitId}.pk`) as unknown as ProverKey;
  }

  async getVerifierKey(circuitId: string): Promise<VerifierKey> {
    return this.fetchBytes(`/contracts/artifacts/${circuitId}.vk`) as unknown as VerifierKey;
  }
}

/**
 * Deploys the VeriHealth contract using the connected 1 AM Wallet.
 *
 * Steps:
 * 1. Set network to PREPROD globally
 * 2. Read indexer/ws endpoints from the wallet (no hardcoding)
 * 3. Build all required providers (public data, ZK config, proof, private state, wallet, midnight)
 * 4. Call deployContract from the Midnight JS SDK
 * 5. Return the deployed contract address
 */
export async function deployVeriHealth(
  connectedWallet: ConnectedAPI
): Promise<DeployResult> {
  // 1. Set network globally
  setNetworkId("preprod");

  // 2. Get endpoints from wallet configuration
  const config = await connectedWallet.getConfiguration();
  const { indexerUri, indexerWsUri, substrateNodeUri } = config;

  // 3. Build providers
  const publicDataProvider = indexerPublicDataProvider(indexerUri, indexerWsUri);

  const zkConfigProvider = new WalletDelegatedZKConfigProvider(
    typeof window !== "undefined" ? window.location.origin : ""
  );

  // Get proving provider from the wallet (delegates proof gen to 1AM Proof Station)
  const provingProvider = await connectedWallet.getProvingProvider(
    zkConfigProvider.asKeyMaterialProvider()
  );

  // Private state provider — stored locally in browser IndexedDB via LevelDB
  const walletAddr = (await connectedWallet.getUnshieldedAddress()).unshieldedAddress;
  const privateStateProv = levelPrivateStateProvider({
    accountId: walletAddr,
    privateStoragePasswordProvider: async () => "VeriHealth-PREPROD-2025",
  });

  // Wallet provider — uses the connected wallet API to balance transactions
  const walletProvider = {
    coinPublicKey: async () => {
      const { unshieldedAddress } = await connectedWallet.getUnshieldedAddress();
      return unshieldedAddress;
    },
    balanceTx: async (
      tx: string,
      _newCoins: unknown
    ): Promise<string> => {
      // The 1AM wallet balances the transaction internally
      const { tx: balanced } = await connectedWallet.makeTransfer([], { payFees: true });
      return balanced;
    },
  };

  // Midnight provider — submits signed transactions to the network
  const midnightProvider = {
    submitTx: (tx: string) => connectedWallet.submitTransaction(tx),
  };

  // 4. Deploy using the Midnight JS SDK
  const compiledContract = new Contract({});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deployed = await deployContract(
    {
      publicDataProvider,
      zkConfigProvider,
      proofProvider: provingProvider as unknown as Parameters<typeof deployContract>[0]["proofProvider"],
      privateStateProvider: privateStateProv as unknown as Parameters<typeof deployContract>[0]["privateStateProvider"],
      walletProvider: walletProvider as unknown as Parameters<typeof deployContract>[0]["walletProvider"],
      midnightProvider: midnightProvider as unknown as Parameters<typeof deployContract>[0]["midnightProvider"],
    },
    {
      contract: compiledContract,
      // No private state / witnesses needed for this contract
    } as unknown as Parameters<typeof deployContract>[1]
  );

  // 5. Return the address
  return {
    contractAddress: String(deployed.deployTxData.public.contractAddress),
  };
}
