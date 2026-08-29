"use client";

import { useEffect, useState } from "react";

// We keep a simple singleton or export functions
let walletAPI: any = null;

export async function connectWallet(): Promise<any> {
  if (walletAPI) return walletAPI;

  if (typeof window === "undefined") throw new Error("Window not found");
  
  // @ts-ignore
  const midnight = (window as any).midnight;
  if (!midnight) {
    throw new Error("1 AM Wallet with Midnight not found. Please install the extension.");
  }

  // Find 1 AM connector or fallback to generic
  const providers = Object.keys(midnight);
  if (providers.length === 0) {
    throw new Error("No Midnight wallet providers found.");
  }
  
  let providerKey = providers.find(p => p.toLowerCase().includes('am')) || providers[0];
  const provider = midnight[providerKey];
  
  if (!provider) {
    throw new Error("1 AM Wallet provider not found");
  }

  // Request connection
  const api = await provider.enable();
  walletAPI = api;
  
  return api;
}

export function getWalletAPI(): any {
  return walletAPI;
}
