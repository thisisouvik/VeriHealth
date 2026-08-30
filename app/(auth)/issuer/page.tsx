"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWalletAPI } from "@/lib/chain-provider";
import { toast } from "sonner";
import { Building2, ShieldCheck, ArrowRight, Hash, CheckCircle2, Clock } from "lucide-react";

export default function IssuerDashboard() {
  const [address, setAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>("loading");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ patientKey: "", credType: "Work Clearance" });

  const isRegistered = status === "APPROVED";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const api = getWalletAPI();
        if (!api) {
          setStatus("disconnected");
          return;
        }
        const result = await api.getUnshieldedAddress();
        setAddress(result.unshieldedAddress);
        
        const res = await fetch(`/api/issuer/status?address=${result.unshieldedAddress}`);
        if (!res.ok) {
           if (res.status === 404) {
             window.location.href = "/issuer/register";
             return;
           }
           setStatus("error");
           return;
        }
        const data = await res.json();
        setStatus(data.status);
      } catch (e) {
        setStatus("disconnected");
      }
    };
    
    checkAuth();
    const interval = setInterval(checkAuth, 3000);
    return () => clearInterval(interval);
  }, []);

  if (status === "loading" || status === "disconnected") {
    return <div className="p-10 text-center animate-pulse text-text-muted">Waiting for wallet connection...</div>;
  }

  if (status === "PENDING") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-accent-pending/10 rounded-full flex items-center justify-center mb-2">
          <Clock className="w-8 h-8 text-accent-pending" />
        </div>
        <h2 className="text-2xl font-bold">Application Under Review</h2>
        <p className="text-text-muted max-w-md">
          Your issuer registration is currently pending admin approval. You will be able to issue credentials once approved.
        </p>
      </div>
    );
  }

  if (status !== "APPROVED") {
    return <div className="p-10 text-center text-red-500">Access Denied</div>;
  }

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast.info("Generating ZK proofs...", { description: "This takes about 30 seconds..." });

    try {
      const api = getWalletAPI();
      if (!api) throw new Error("1 AM Wallet not connected");

      // Bypassing getShieldedAddresses() because of 1 AM Wallet cache sync issues.
      // Our smart contract doesn't transfer tokens, so we don't need a real shielded coin key here.
      
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error("Contract address not configured in .env");

      // 1. Generate and prove the transaction on the backend
      const res = await fetch("/api/contract/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientPublicKey: form.patientKey,
          coinPublicKey: address, // Using unshielded address to satisfy the SDK's bech32 string requirement
          contractAddress: contractAddress,
          issuerPublicKey: address || "0xissuer",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.provenTxHex) {
        throw new Error(data.error ?? "Failed to generate transaction");
      }

      toast.info("Please sign the transaction in your 1 AM Wallet...", { duration: 60000 });

      // 2. Balance and sign in 1 AM Wallet
      const balanced = await api.balanceUnsealedTransaction(data.provenTxHex);
      
      toast.info("Submitting transaction to network...", { duration: 60000 });
      
      // 3. Submit to the network
      await api.submitTransaction(balanced.tx);

      // 4. Save to the DB once successfully submitted
      const dbRes = await fetch("/api/issuer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientPublicKey: form.patientKey,
          credentialType: form.credType,
          issuerPublicKey: address || "0xissuer",
        }),
      });
      const dbData = await dbRes.json();
      
      if (dbData.success) {
        toast.success("Credential officially issued on-chain!", { description: `Saved to registry.` });
        setForm({ patientKey: "", credType: "Work Clearance" });
      } else {
        throw new Error(dbData.error);
      }
    } catch (err: any) {
      toast.error("Issue failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-accent-info text-xs font-mono tracking-widest uppercase">Issuer Portal</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Issue Credentials</h1>
          <p className="text-text-muted">Sign and deliver verifiable medical facts to patient wallets.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">

        {/* Registry Status */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-accent-info/10 border border-accent-info/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent-info" />
            </div>
            <Badge className={`${isRegistered ? "bg-accent-verified/10 border-accent-verified/25 text-accent-verified" : "bg-accent-pending/10 border-accent-pending/25 text-accent-pending"} border rounded-full text-xs font-semibold px-3`}>
              {isRegistered ? "Registry Active" : "Pending Approval"}
            </Badge>
          </div>
          <div>
            <h2 className="text-lg font-bold">Registry Status</h2>
            <p className="text-sm text-text-muted mt-1">On-chain issuer verification status for your organization.</p>
          </div>
          {address && (
            <div className="bg-background/50 rounded-xl p-3 space-y-2">
              <p className="text-xs text-text-muted font-mono">Connected Issuer</p>
              <p className="text-xs font-mono text-text-primary break-all">{address}</p>
            </div>
          )}
          {isRegistered && (
            <div className="flex items-center gap-2 text-xs text-accent-verified">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-mono">On-chain registry entry confirmed</span>
            </div>
          )}
        </div>

        {/* Issue form */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-11 h-11 rounded-xl bg-accent-verified/10 border border-accent-verified/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-accent-verified" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Issue Credential</h2>
              <p className="text-sm text-text-muted">The commitment hash is written to Midnight PREPROD.</p>
            </div>
          </div>

          <form onSubmit={handleIssue} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-text-muted" />
                Patient Public Key
              </label>
              <Input
                placeholder="0x…"
                value={form.patientKey}
                onChange={e => setForm(f => ({ ...f, patientKey: e.target.value }))}
                required
                className="bg-background/60 border-border/60 font-mono text-sm h-11 rounded-xl focus:border-accent-verified/50 focus:ring-accent-verified/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Credential Type</label>
              <select
                value={form.credType}
                onChange={e => setForm(f => ({ ...f, credType: e.target.value }))}
                className="flex h-11 w-full items-center rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm text-text-primary focus:border-accent-verified/50 outline-none"
              >
                <option>Work Clearance</option>
                <option>Vaccination Status</option>
                <option>Lab Value (Range Proof)</option>
                <option>Prescription Eligibility</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={!isRegistered || loading}
              className="btn-glow w-full h-11 rounded-xl font-bold bg-accent-verified hover:bg-accent-verified/90 text-background shadow-lg shadow-accent-verified/20"
            >
              {loading ? "Signing…" : (
                <><ShieldCheck className="w-4 h-4 mr-2" />Issue & Sign on PREPROD <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
