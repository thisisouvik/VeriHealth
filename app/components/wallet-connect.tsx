"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { connectWallet } from "@/lib/chain-provider";
import { toast } from "sonner";
import { Wallet, CheckCircle2, ChevronDown } from "lucide-react";

export function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const api = await connectWallet();
      setAddress("Connected");
      toast.success("Wallet connected", {
        description: "1 AM Wallet on PREPROD network",
        icon: "✓",
      });
    } catch (err: any) {
      toast.error("Connection failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (address) {
    return (
      <div className="flex items-center gap-2 bg-accent-verified/10 border border-accent-verified/25 rounded-xl px-3 py-2">
        <CheckCircle2 className="w-4 h-4 text-accent-verified flex-shrink-0" />
        <span className="text-xs font-mono text-accent-verified">PREPROD</span>
        <div className="w-px h-4 bg-border" />
        <span className="text-xs font-mono text-text-muted">1 AM Wallet</span>
        <ChevronDown className="w-3 h-3 text-text-muted" />
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
      {loading ? "Connecting..." : "Connect 1 AM Wallet"}
    </Button>
  );
}
