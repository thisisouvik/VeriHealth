"use client";

import { useState } from "react";
import { connectWallet } from "@/lib/chain-provider";
import { deployVeriHealth } from "@/lib/deploy";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Rocket, CheckCircle2, Copy, Loader2, AlertTriangle } from "lucide-react";
import Image from "next/image";

type DeployState = "idle" | "connecting" | "deploying" | "done" | "error";

export default function DeployPage() {
  const [state, setState] = useState<DeployState>("idle");
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDeploy = async () => {
    try {
      setState("connecting");
      toast.info("Connecting to 1 AM Wallet...");
      const wallet = await connectWallet();

      setState("deploying");
      toast.info("Deploying contract to PREPROD... This may take a minute.", {
        duration: 60000,
      });

      const result = await deployVeriHealth(wallet);
      setContractAddress(result.contractAddress);
      setState("done");
      toast.success("Contract deployed!", {
        description: `Address: ${result.contractAddress.slice(0, 20)}...`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Deployment failed";
      setErrorMessage(message);
      setState("error");
      toast.error("Deployment failed", { description: message });
    }
  };

  const copyAddress = () => {
    if (!contractAddress) return;
    navigator.clipboard.writeText(contractAddress);
    toast.success("Address copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="glass-card rounded-2xl p-8 max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="VeriHealth" width={36} height={36} className="rounded-lg" />
          <div>
            <h1 className="text-xl font-bold text-text-primary">Deploy VeriHealth Contract</h1>
            <p className="text-sm text-text-muted">Midnight PREPROD Network</p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="bg-surface-raised rounded-xl p-4 space-y-3 text-sm">
          <Step
            done={["connecting", "deploying", "done"].includes(state)}
            active={state === "connecting"}
            label="Connect 1 AM Wallet"
          />
          <Step
            done={["deploying", "done"].includes(state)}
            active={state === "deploying"}
            label="Generate ZK Proof & Deploy Contract"
          />
          <Step
            done={state === "done"}
            active={false}
            label="Contract Live on PREPROD"
          />
        </div>

        {/* Contract address result */}
        {state === "done" && contractAddress && (
          <div className="bg-accent-verified/10 border border-accent-verified/25 rounded-xl p-4">
            <p className="text-xs text-accent-verified font-semibold uppercase tracking-wider mb-2">
              ✓ Contract Deployed
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-text-primary break-all flex-1">
                {contractAddress}
              </code>
              <button onClick={copyAddress} className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <Copy className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </div>
            <p className="text-xs text-text-muted mt-3">
              Copy this address and add it to your <code className="bg-black/30 px-1 rounded">.env</code> as{" "}
              <code className="bg-black/30 px-1 rounded">NEXT_PUBLIC_CONTRACT_ADDRESS</code>,
              then restart the dev server.
            </p>
          </div>
        )}

        {/* Error display */}
        {state === "error" && errorMessage && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-400 mb-1">Deployment failed</p>
              <p className="text-xs text-text-muted">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Action button */}
        {state !== "done" && (
          <Button
            onClick={handleDeploy}
            disabled={state === "connecting" || state === "deploying"}
            className="w-full btn-glow h-12 bg-accent-verified hover:bg-accent-verified/90 text-background font-bold rounded-xl"
          >
            {state === "connecting" && <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting Wallet...</>}
            {state === "deploying" && <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deploying Contract...</>}
            {(state === "idle" || state === "error") && <><Rocket className="w-4 h-4 mr-2" /> Deploy to PREPROD</>}
          </Button>
        )}

        {state === "done" && (
          <div className="flex items-center gap-2 text-accent-verified text-sm font-semibold justify-center">
            <CheckCircle2 className="w-4 h-4" />
            Deployment complete!
          </div>
        )}

        <p className="text-xs text-text-muted text-center">
          Make sure your 1 AM Wallet is installed, unlocked, and set to <strong>PREPROD</strong> network before deploying.
        </p>
      </div>
    </div>
  );
}

function Step({
  done,
  active,
  label,
}: {
  done: boolean;
  active: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          done
            ? "bg-accent-verified"
            : active
            ? "bg-accent-info animate-pulse"
            : "bg-surface-elevated border border-border"
        }`}
      >
        {done && <CheckCircle2 className="w-3 h-3 text-background" />}
        {active && <Loader2 className="w-3 h-3 text-background animate-spin" />}
      </div>
      <span
        className={`text-sm ${
          done ? "text-accent-verified" : active ? "text-text-primary" : "text-text-muted"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
