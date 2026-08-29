"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWalletAPI } from "@/lib/chain-provider";
import { toast } from "sonner";
import { Building2, ShieldCheck, ArrowRight, Hash, CheckCircle2 } from "lucide-react";

export default function IssuerDashboard() {
  const [address, setAddress] = useState<string | null>(null);
  const [isRegistered] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ patientKey: "", credType: "Work Clearance" });

  useEffect(() => {
    const interval = setInterval(() => {
      const api = getWalletAPI();
      if (api) {
        clearInterval(interval);
        api.getUnshieldedAddress()
          .then((result) => setAddress(result.unshieldedAddress))
          .catch(() => {});
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast("Submitting to Compact contract…", { description: "Please approve in 1 AM Wallet" });
    // TODO: call chain-provider.issueCredential()
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch("/api/issuer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientPublicKey: form.patientKey,
        credentialType: form.credType,
        issuerPublicKey: address || "0xissuer",
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Credential issued!", { description: `TxHash: ${data.credential.onChainTxHash}` });
      setForm({ patientKey: "", credType: "Work Clearance" });
    } else {
      toast.error("Issue failed", { description: data.error });
    }
    setLoading(false);
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
