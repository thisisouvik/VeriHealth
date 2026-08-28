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
    throw new Error("Lace wallet with Midnight not found. Please install the extension.");
  }

  // Find lace or midnight connector
  const provider = midnight.lace || midnight.mnLace;
  if (!provider) {
    throw new Error("Lace provider not found");
  }

  // Request connection
  const api = await provider.enable();
  walletAPI = api;
  
  return api;
}

export function getWalletAPI(): any {
  return walletAPI;
}
