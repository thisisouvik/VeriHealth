"use client";

import { Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Rocket, CheckCircle2, Copy, Loader2, AlertTriangle, Lock } from "lucide-react";
import Image from "next/image";
import { WalletConnect } from "@/app/components/wallet-connect";
import { useSearchParams } from "next/navigation";

function DeployContent() {
  const [state, setState] = useState<DeployState>("idle");
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const deployKey = searchParams.get("key");

  useEffect(() => {
    if (!deployKey) setState("unauthorized");
  }, [deployKey]);

  const handleDeploy = async () => {
    if (!deployKey) { setState("unauthorized"); return; }
    try {
      setState("deploying");
      toast.info("Deploying contract to PREPROD...", { duration: 60000 });
      
      const { getWalletAPI } = await import("@/lib/chain-provider");
      const api = getWalletAPI();
      if (!api) throw new Error("1 AM Wallet not connected. Please connect it first.");
      
      const { unshieldedAddress } = await api.getUnshieldedAddress();
      const { shieldedCoinPublicKey } = await api.getShieldedAddresses();

      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { 
          "x-deploy-key": deployKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userAddress: unshieldedAddress, coinPublicKey: shieldedCoinPublicKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Deployment failed");

      if (data.provenTxHex) {
        toast.info("Please sign the transaction in your 1 AM Wallet...", { duration: 60000 });
        const balanced = await api.balanceUnsealedTransaction(data.provenTxHex);
        toast.info("Submitting transaction to network...", { duration: 60000 });
        await api.submitTransaction(balanced.tx);
      }

      setContractAddress(data.contractAddress);
      setState("done");
      toast.success("Contract deployed!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deployment failed";
      setErrorMessage(msg);
      setState("error");
      toast.error("Deployment failed", { description: msg });
    }
  };

  const copyAddress = () => {
    if (!contractAddress) return;
    navigator.clipboard.writeText(contractAddress);
    toast.success("Copied!");
  };

  if (state === "unauthorized") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card rounded-2xl p-10 text-center max-w-sm space-y-4">
          <Lock className="w-10 h-10 text-accent-revoked mx-auto" />
          <h1 className="text-xl font-bold text-text-primary">Access Denied</h1>
          <p className="text-sm text-text-muted">
            Navigate to{" "}
            <code className="bg-black/30 px-1 rounded text-accent-info">/deploy?key=YOUR_SECRET</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="glass-card rounded-2xl p-8 max-w-lg w-full space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="VeriHealth" width={36} height={36} className="rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-text-primary">Deploy VeriHealth Contract</h1>
              <p className="text-sm text-text-muted">Midnight PREPROD Network</p>
            </div>
          </div>
          <WalletConnect />
        </div>

        <div className="bg-surface-raised rounded-xl p-4 space-y-3 text-sm">
          <Step done={["deploying","done"].includes(state)} active={state==="deploying"} label="Compile ZK Proofs & Create Deploy Transaction" />
          <Step done={state==="done"} active={false} label="Contract Anchored on PREPROD" />
        </div>

        {state === "done" && contractAddress && (
          <div className="bg-accent-verified/10 border border-accent-verified/25 rounded-xl p-4">
            <p className="text-xs text-accent-verified font-semibold uppercase tracking-wider mb-2">✓ Contract Deployed</p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-text-primary break-all flex-1">{contractAddress}</code>
              <button onClick={copyAddress} className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded-lg">
                <Copy className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </div>
            <p className="text-xs text-text-muted mt-3">
              Add to <code className="bg-black/30 px-1 rounded">.env</code> as{" "}
              <code className="bg-black/30 px-1 rounded">NEXT_PUBLIC_CONTRACT_ADDRESS</code> and restart the server.
            </p>
          </div>
        )}

        {state === "error" && errorMessage && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-400 mb-1">Deployment failed</p>
              <p className="text-xs text-text-muted">{errorMessage}</p>
            </div>
          </div>
        )}

        {state !== "done" && (
          <Button onClick={handleDeploy} disabled={state==="deploying"}
            className="w-full btn-glow h-12 bg-accent-verified hover:bg-accent-verified/90 text-background font-bold rounded-xl">
            {state === "deploying" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Deploying...</> : <><Rocket className="w-4 h-4 mr-2"/>Deploy to PREPROD</>}
          </Button>
        )}

        {state === "done" && (
          <div className="flex items-center gap-2 text-accent-verified text-sm font-semibold justify-center">
            <CheckCircle2 className="w-4 h-4" /> Deployment complete!
          </div>
        )}

        <p className="text-xs text-text-muted text-center">
          Deploying to <strong className="text-text-primary">Midnight PREPROD</strong> network.
        </p>
      </div>
    </div>
  );
}

function Step({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${done ? "bg-accent-verified" : active ? "bg-accent-info animate-pulse" : "bg-surface-elevated border border-border"}`}>
        {done && <CheckCircle2 className="w-3 h-3 text-background" />}
        {active && <Loader2 className="w-3 h-3 text-background animate-spin" />}
      </div>
      <span className={`text-sm ${done ? "text-accent-verified" : active ? "text-text-primary" : "text-text-muted"}`}>{label}</span>
    </div>
  );
}

// Suspense boundary required because useSearchParams() reads from the URL at runtime
export default function DeployPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent-verified animate-spin" />
      </div>
    }>
      <DeployContent />
    </Suspense>
  );
}
