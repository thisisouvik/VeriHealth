"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { connectWallet, disconnectWallet, getWalletAddress } from "@/lib/chain-provider";
import { toast } from "sonner";
import { Wallet, CheckCircle2, ChevronDown, LogOut } from "lucide-react";

export function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      await connectWallet();
      const addr = await getWalletAddress();
      setAddress(addr);
      toast.success("Wallet connected", {
        description: "1 AM Wallet on PREPROD network",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Connection failed", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setAddress(null);
    setShowDropdown(false);
    toast.info("Wallet disconnected");
  };

  const shortAddress = address
    ? `${address.slice(0, 8)}...${address.slice(-6)}`
    : null;

  if (address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="flex items-center gap-2 bg-accent-verified/10 border border-accent-verified/25 rounded-xl px-3 py-2 hover:bg-accent-verified/15 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4 text-accent-verified flex-shrink-0" />
          <span className="text-xs font-mono text-accent-verified">PREPROD</span>
          <div className="w-px h-4 bg-border" />
          <span className="text-xs font-mono text-text-muted">{shortAddress}</span>
          <ChevronDown className="w-3 h-3 text-text-muted" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface-raised border border-border rounded-xl shadow-lg z-50 p-1">
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Connected via</p>
              <p className="text-xs font-semibold text-text-primary">1 AM Wallet</p>
            </div>
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading}
      className="btn-glow h-9 px-4 bg-accent-verified hover:bg-accent-verified/90 text-background font-semibold rounded-xl text-sm shadow-md shadow-accent-verified/20"
    >
      <Wallet className="w-3.5 h-3.5 mr-1.5" />
      {loading ? "Connecting..." : (
        <>
          <span className="hidden sm:inline">Connect 1 AM Wallet</span>
          <span className="sm:hidden">Connect</span>
        </>
      )}
    </Button>
  );
}
