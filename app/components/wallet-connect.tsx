"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { connectWallet } from "@/lib/chain-provider";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

export function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const api = await connectWallet();
      
      // In Midnight SDK, you might need to query the state API for the address
      // For the UI mockup in the hackathon, we can just show it connected.
      setAddress("Connected");
      toast.success("Wallet connected successfully to PREPROD");
    } catch (err: any) {
      toast.error(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  if (address) {
    return (
      <Button variant="outline" className="gap-2">
        <Wallet className="w-4 h-4" />
        <span className="font-mono">{address}</span>
      </Button>
    );
  }

  return (
    <Button onClick={handleConnect} disabled={loading} className="gap-2">
      <Wallet className="w-4 h-4" />
      {loading ? "Connecting..." : "Connect Lace"}
    </Button>
  );
}
