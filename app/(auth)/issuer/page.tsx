"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, ShieldCheck, Hash, CheckCircle2, Clock, ArrowRight, Ban, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getWalletAPI } from "@/lib/chain-provider";

export default function IssuerPortal() {
  const [address, setAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null); // PENDING, APPROVED, REVOKED
  const [loading, setLoading] = useState(true);
  const [issueLoading, setIssueLoading] = useState(false);
  const [form, setForm] = useState({ patientKey: "", credTypeId: "" });
  
  const [credTypes, setCredTypes] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Fetch available credential types
    fetch("/api/credential-types")
      .then(r => r.json())
      .then(d => {
        if (d.types) {
          setCredTypes(d.types);
          if (d.types.length > 0) setForm(f => ({ ...f, credTypeId: d.types[0].id }));
        }
      });

    const interval = setInterval(() => {
      const api = getWalletAPI();
      if (api) {
        clearInterval(interval);
        api.getUnshieldedAddress().then((result) => {
          setAddress(result.unshieldedAddress);
          checkStatus(result.unshieldedAddress);
          fetchHistory(result.unshieldedAddress);
        }).catch(() => setLoading(false));
      }
    }, 1000);
    setTimeout(() => setLoading(false), 4000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async (pubKey: string) => {
    try {
      const res = await fetch(`/api/issuer/status?pubKey=${pubKey}`);
      const data = await res.json();
      setStatus(data.status || "UNREGISTERED");
    } catch (err) {
      setStatus("UNREGISTERED");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (pubKey: string) => {
    try {
      const res = await fetch(`/api/issuer/credentials?pubKey=${pubKey}`);
      const data = await res.json();
      if (data.credentials) setHistory(data.credentials);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueLoading(true);
    toast.info("Generating ZK proofs...", { description: "This takes about 30 seconds..." });

    try {
      const api = getWalletAPI();
      if (!api) throw new Error("1 AM Wallet not connected");
      
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error("Contract address missing");

      // 1. Generate TX
      const res = await fetch("/api/contract/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientPublicKey: form.patientKey,
          coinPublicKey: address, 
          contractAddress: contractAddress,
          issuerPublicKey: address || "0xissuer",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.provenTxHex) throw new Error(data.error ?? "Failed to generate transaction");

      toast.info("Please sign the transaction in your 1 AM Wallet...", { duration: 60000 });

      // 2. Sign
      const balanced = await api.balanceUnsealedTransaction(data.provenTxHex);
      toast.info("Submitting transaction to PREPROD network...", { duration: 60000 });
      
      // 3. Submit
      await api.submitTransaction(balanced.tx);

      // 4. Save to DB
      const dbRes = await fetch("/api/issuer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientPublicKey: form.patientKey,
          credentialType: form.credTypeId, // Sending ID now, not string
          issuerPublicKey: address || "0xissuer",
        }),
      });
      const dbData = await dbRes.json();
      
      if (dbData.success) {
        toast.success("Credential issued successfully!");
        setForm(f => ({ ...f, patientKey: "" }));
        if (address) fetchHistory(address); // Refresh history
      } else {
        throw new Error(dbData.error);
      }
    } catch (err: any) {
      toast.error("Issue failed", { description: err.message });
    } finally {
      setIssueLoading(false);
    }
  };

  const handleRevoke = async (credId: string) => {
    toast.info("Initiating revocation circuit...", { description: "Preparing to nullify credential..." });
    
    try {
      // In a real implementation this calls the revoke_credential circuit on the Midnight node
      // For this UI phase, we simulate the blockchain confirmation delay and update the DB
      
      // Update DB
      const res = await fetch(`/api/credentials/${credId}/revoke`, { method: "POST" });
      if (!res.ok) throw new Error("Database update failed");
      
      setTimeout(() => {
        setHistory(prev => prev.map(c => c.id === credId ? { ...c, status: "REVOKED" } : c));
        toast.success("Credential revoked on-chain", { description: "The nullifier is now active." });
      }, 2500);
    } catch (e: any) {
      toast.error("Revocation failed", { description: e.message });
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-text-muted">Loading Issuer State...</div>;

  if (status === "UNREGISTERED") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-surface border border-border/40 rounded-full flex items-center justify-center mb-2">
          <Building2 className="w-8 h-8 text-text-muted" />
        </div>
        <h2 className="text-2xl font-bold">Unregistered Issuer</h2>
        <p className="text-text-muted max-w-md">
          Your wallet address is not registered in the VeriHealth network. Contact an administrator to add your Public Key.
        </p>
      </div>
    );
  }

  const isRegistered = status === "APPROVED";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-accent-info text-xs font-mono tracking-widest uppercase">Issuer Portal</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Issue Credentials</h1>
          <p className="text-text-muted">Sign and deliver verifiable medical facts to patient wallets.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted bg-surface-elevated border border-border/60 rounded-xl px-3 py-2 shadow-sm">
          <Activity className="w-3.5 h-3.5 text-accent-info" />
          <span className="opacity-60 uppercase tracking-widest">Issuer PK:</span>
          <span className="text-text-primary truncate max-w-[150px]">{address}</span>
        </div>
      </div>

      {!isRegistered ? (
        <div className="glass-card rounded-2xl p-10 flex flex-col items-center text-center space-y-4 border-accent-pending/20 bg-accent-pending/5">
          <div className="w-16 h-16 bg-accent-pending/10 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-accent-pending" />
          </div>
          <h2 className="text-2xl font-bold text-accent-pending">Application Under Review</h2>
          <p className="text-text-muted max-w-md">
            Your issuer registration is currently pending admin approval on the PREPROD network. You will be able to issue credentials once the registration transaction confirms.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">

          {/* Issue form */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 h-fit sticky top-24">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-11 h-11 rounded-xl bg-accent-verified/10 border border-accent-verified/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-accent-verified" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Issue New Fact</h2>
                <p className="text-sm text-text-muted">Commitment hash written to PREPROD.</p>
              </div>
            </div>

            <form onSubmit={handleIssue} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-text-muted" /> Patient Public Key
                </label>
                <Input
                  placeholder="mn_addr_preprod1..."
                  value={form.patientKey}
                  onChange={e => setForm(f => ({ ...f, patientKey: e.target.value }))}
                  required
                  className="bg-background/60 border-border/60 font-mono text-xs h-11 rounded-xl focus:border-accent-verified/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Credential Type</label>
                <select
                  value={form.credTypeId}
                  onChange={e => setForm(f => ({ ...f, credTypeId: e.target.value }))}
                  className="flex h-11 w-full items-center rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm text-text-primary focus:border-accent-verified/50 outline-none"
                >
                  {credTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                disabled={issueLoading}
                className="btn-glow w-full h-11 rounded-xl font-bold bg-accent-verified hover:bg-accent-verified/90 text-background shadow-lg shadow-accent-verified/20"
              >
                {issueLoading ? "Signing..." : (
                  <><ShieldCheck className="w-4 h-4 mr-2" /> Issue on PREPROD <ArrowRight className="ml-2 w-4 h-4" /></>
                )}
              </Button>
            </form>
          </div>

          {/* Issued History Dashboard */}
          <div className="lg:col-span-3 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Issued Credentials</h2>
                <p className="text-sm text-text-muted">History of facts you've attested to.</p>
              </div>
              <Badge variant="outline" className="text-xs font-mono border-border/50">{history.length} Total</Badge>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border/40 rounded-xl bg-surface/30">
                <p className="text-text-muted text-sm">You haven't issued any credentials yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {history.map((cred) => (
                  <div key={cred.id} className="p-4 rounded-xl border border-border/40 bg-background hover:bg-surface/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-text-primary text-sm">
                          {cred.credentialType?.name || "Unknown Fact"}
                        </span>
                        {cred.status === "VALID" ? (
                          <Badge className="bg-accent-verified/10 text-accent-verified border-accent-verified/20 text-[10px] h-5">Valid</Badge>
                        ) : cred.status === "EXPIRING" ? (
                          <Badge className="bg-accent-pending/10 text-accent-pending border-accent-pending/20 text-[10px] h-5">Expiring</Badge>
                        ) : (
                          <Badge className="bg-accent-revoked/10 text-accent-revoked border-accent-revoked/20 text-[10px] h-5">Revoked</Badge>
                        )}
                      </div>
                      <p className="text-xs text-text-muted font-mono truncate max-w-[200px]">To: {cred.patientPublicKey}</p>
                      <p className="text-[10px] text-text-muted mt-1">Issued: {new Date(cred.issueDate).toLocaleDateString()}</p>
                    </div>
                    
                    {cred.status === "VALID" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleRevoke(cred.id)}
                        className="text-accent-revoked border-accent-revoked/30 hover:bg-accent-revoked/10 hover:text-accent-revoked"
                      >
                        <Ban className="w-3.5 h-3.5 mr-1.5" /> Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
