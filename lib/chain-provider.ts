"use client";

import type { InitialAPI, ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";

// Singleton for the connected wallet API
let connectedAPI: ConnectedAPI | null = null;

/**
 * Discovers and connects to the 1 AM Wallet injected into window.midnight.
 * Uses the DApp Connector API v4 — `.connect(networkId)` — NOT the old `.enable()`.
 */
export async function connectWallet(): Promise<ConnectedAPI> {
  if (connectedAPI) return connectedAPI;

  if (typeof window === "undefined") {
    throw new Error("Window not found. Must be called in a browser context.");
  }

  const midnight = (window as unknown as { midnight?: Record<string, InitialAPI> }).midnight;
  const hasEthereum = !!(window as any).ethereum;

  if (!midnight || Object.keys(midnight).length === 0) {
    if (hasEthereum) {
      throw new Error("MetaMask won't work here. Please install the 1AM Wallet extension for the Midnight Network.");
    }
    throw new Error(
      "1 AM Wallet not found. Please install the 1AM Wallet extension and refresh the page."
    );
  }

  // Enumerate all injected wallet providers (UUID-keyed)
  const providers = Object.values(midnight);

  // Prefer the 1AM wallet, fall back to first found
  const wallet =
    providers.find(
      (p) =>
        p.rdns?.toLowerCase().includes("am") ||
        p.name?.toLowerCase().includes("1am") ||
        p.name?.toLowerCase().includes("midnight")
    ) ?? providers[0];

  if (!wallet) {
    throw new Error("No Midnight wallet provider found.");
  }

  // Connect using the network — PREPROD for this project
  let api;
  try {
    if (typeof wallet.connect === "function") {
      api = await wallet.connect("preprod");
    } else if (typeof (wallet as any).enable === "function") {
      api = await (wallet as any).enable();
    } else {
      throw new Error("Wallet provider does not support connect() or enable()");
    }
  } catch (error: any) {
    if (error.message?.includes("network") || error.message?.includes("preprod")) {
      throw new Error("Please switch your 1AM wallet to the PREPROD network.");
    }
    throw new Error(error.message || "Failed to connect to wallet.");
  }
  
  connectedAPI = api;
  return api;
}

/**
 * Returns the current connected wallet API, or null if not yet connected.
 */
export function getWalletAPI(): ConnectedAPI | null {
  return connectedAPI;
}

/**
 * Gets the configuration (indexer, prover, substrate URLs) from the wallet.
 * Always use these endpoints — never statically embed network URLs.
 */
export async function getWalletConfiguration() {
  try {
    const api = connectedAPI ?? (await connectWallet());
    return await api.getConfiguration();
  } catch (error) {
    connectedAPI = null;
    const api = await connectWallet();
    return await api.getConfiguration();
  }
}

/**
 * Gets the unshielded (public) address of the connected wallet.
 * Returns the Bech32m-formatted address string.
 */
export async function getWalletAddress(): Promise<string> {
  try {
    const api = connectedAPI ?? (await connectWallet());
    const result = await api.getUnshieldedAddress();
    return result.unshieldedAddress;
  } catch (error) {
    // If wallet was disconnected or channel closed, clear cache and retry once
    connectedAPI = null;
    const api = await connectWallet();
    const result = await api.getUnshieldedAddress();
    return result.unshieldedAddress;
  }
}

/**
 * Disconnects the wallet by clearing the local singleton.
 */
export function disconnectWallet() {
  connectedAPI = null;
}




