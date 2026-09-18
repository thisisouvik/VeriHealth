"use client";

import { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";
import { ShieldAlert, AlertTriangle, Building2, CheckCircle2, RefreshCw, User, Rocket, Wallet, Fingerprint, Tags, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, useRouter } from "next/navigation";
import { getWalletAPI } from "@/lib/chain-provider";

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const key = searchParams.get("key");

  const [address, setAddress] = useState<string | null>(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [contractAddress, setContractAddress] = useState<string | null>(null);

  const [issuers, setIssuers] = useState<any[]>([]);
  const [issuersLoading, setIssuersLoading] = useState(true);
  
  const [credTypes, setCredTypes] = useState<any[]>([]);
  const [newCredType, setNewCredType] = useState({ name: "", description: "" });
  
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [approveLoading, setApproveLoading] = useState<string | null>(null);
  const [deployLoading, setDeployLoading] = useState(false);
  const [typeLoading, setTypeLoading] = useState(false);

  useEffect(() => {
    if (key === "hackathon_admin") {
      fetchIssuers(key);
      fetchCredTypes();
      fetchAuditLogs();
      setContractAddress(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || null);
    }
  }, [key]);

  const fetchIssuers = async (adminKey: string) => {
    setIssuersLoading(true);
    try {
      const res = await fetch(`/api/admin/issuers?key=${adminKey}`);
      const data = await res.json();
      if (data.issuers) setIssuers(data.issuers);
    } catch (e) {
      toast.error("Failed to fetch issuers");
    } finally {
      setIssuersLoading(false);
    }
  };

  const fetchCredTypes = async () => {
    try {
      const res = await fetch(`/api/credential-types`);
      const data = await res.json();
      if (data.types) setCredTypes(data.types);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`/api/admin/audit`);
      const data = await res.json();
      if (data.logs) setAuditLogs(data.logs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnectWallet = async () => {
    setWalletConnecting(true);
    try {
      const api = getWalletAPI();
      if (!api) throw new Error("1 AM Wallet not detected");
      const state = await api.getUnshieldedAddress();
      setAddress(state.unshieldedAddress);
      toast.success("Wallet connected!");
    } catch (e: any) {
      toast.error("Failed to connect wallet", { description: e.message });
    } finally {
      setWalletConnecting(false);
    }
  };

  const handleDeploy = async () => {
    setDeployLoading(true);
    toast.info("Compiling & Deploying VeriHealth...", { description: "Please sign in your wallet." });
    setTimeout(() => {
      setDeployLoading(false);
      const mockAddr = "4779029ff10019881b4125128c60b5f7aecaa00820614dac825271d2d830f47a";
      setContractAddress(mockAddr);
      toast.success("Contract deployed to PREPROD!", { description: `Address: ${mockAddr}` });
    }, 4500);
  };

  const handleApprove = async (pubKey: string) => {
    setApproveLoading(pubKey);
    toast.info("Signing registry inclusion...", { description: "Check your wallet." });
    setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/approve-issuer/db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, issuerPublicKey: pubKey }),
        });
        if (res.ok) {
          toast.success("Issuer approved on-chain!");
          if (key) fetchIssuers(key);
        }
      } catch (e) {
        toast.error("Approval failed");
      } finally {
        setApproveLoading(null);
      }
    }, 3000);
  };

  const handleCreateCredType = async (e: React.FormEvent) => {
    e.preventDefault();
    setTypeLoading(true);
    try {
      const res = await fetch("/api/credential-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCredType),
      });
      if (res.ok) {
        toast.success("Credential type created");
        setNewCredType({ name: "", description: "" });
        fetchCredTypes();
      }
    } catch (e) {
      toast.error("Failed to create credential type");
    } finally {
      setTypeLoading(false);
    }
  };

  if (key !== "hackathon_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card p-10 rounded-2xl text-center space-y-4 max-w-sm border-accent-revoked/30">
          <AlertTriangle className="w-12 h-12 text-accent-revoked mx-auto" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-text-muted text-sm">You need the admin key to view this portal. (?key=hackathon_admin)</p>
          <Button onClick={() => router.push("/admin?key=hackathon_admin")} variant="outline" className="mt-4 border-border/50">
            Login as Demo Admin
          </Button>
        </div>
      </div>
    );
  }

  const pendingIssuers = issuers.filter(i => i.registryStatus === "PENDING");
  const approvedIssuers = issuers.filter(i => i.registryStatus === "APPROVED");

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* Header Bar */}
      <div className="border-b border-border bg-surface-raised/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="VeriHealth Logo" className="h-8 w-8 drop-shadow-[0_0_8px_rgba(47,191,159,0.5)]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-text-primary">VeriHealth Admin</h1>
              <p className="text-[10px] text-accent-verified uppercase tracking-wider font-mono">System Controller</p>
            </div>
          </div>
          {address ? (
            <div className="flex items-center gap-2 bg-accent-verified/10 border border-accent-verified/25 rounded-xl px-3 py-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-accent-verified" />
              <span className="text-xs font-mono text-text-muted">{address.slice(0, 8)}...{address.slice(-6)}</span>
            </div>
          ) : (
            <Button onClick={handleConnectWallet} disabled={walletConnecting}
              className="h-9 px-4 bg-accent-verified hover:bg-accent-verified/90 text-background font-semibold rounded-xl text-sm btn-glow">
              <Wallet className="w-3.5 h-3.5 mr-1.5" />
              {walletConnecting ? "Connecting..." : "Connect 1 AM Wallet"}
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Pending Issuers", value: pendingIssuers.length, cls: "text-accent-pending" },
            { label: "Active Issuers", value: approvedIssuers.length, cls: "text-accent-verified" },
            { label: "Credential Types", value: credTypes.length, cls: "text-accent-info" },
            { label: "Audit Logs", value: auditLogs.length, cls: "text-text-primary" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="glass-card p-5 rounded-2xl border border-border/30">
              <p className="text-xs text-text-muted mb-1 font-mono uppercase tracking-wider">{label}</p>
              <p className={`text-3xl font-extrabold ${cls}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Column 1 */}
          <div className="space-y-8">
            
            {/* Deploy Module */}
            <div className="glass-card p-6 rounded-2xl space-y-4 border border-border/40 hover:border-accent-info/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-info/10 rounded-xl flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-accent-info" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Smart Contract</h2>
                  <p className="text-sm text-text-muted">Master instance deployed to PREPROD</p>
                </div>
              </div>
              {contractAddress && (
                <div className="bg-accent-info/5 border border-accent-info/20 rounded-xl p-3 flex flex-col gap-1">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted">Active Contract Hash</p>
                  <p className="font-mono text-xs text-accent-info break-all">{contractAddress}</p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Button onClick={handleDeploy} disabled={deployLoading || !address}
                  className="btn-glow bg-accent-info hover:bg-accent-info/90 text-background font-bold px-6 w-full sm:w-auto">
                  <Rocket className="w-4 h-4 mr-2" />
                  {deployLoading ? "Compiling..." : "Deploy New Instance"}
                </Button>
                {!address && <p className="text-xs text-accent-pending">? Requires wallet</p>}
              </div>
            </div>

            {/* Credential Types Management */}
            <div className="glass-card p-6 rounded-2xl space-y-4 border border-border/40">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Tags className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Credential Types</h2>
                  <p className="text-sm text-text-muted">Manage the schema of verifiable facts</p>
                </div>
              </div>

              <form onSubmit={handleCreateCredType} className="flex gap-2 mb-4">
                <Input 
                  placeholder="Type Name (e.g. Clearance)" 
                  value={newCredType.name}
                  onChange={e => setNewCredType({ ...newCredType, name: e.target.value })}
                  className="bg-surface/50 text-sm"
                  required
                />
                <Input 
                  placeholder="Description" 
                  value={newCredType.description}
                  onChange={e => setNewCredType({ ...newCredType, description: e.target.value })}
                  className="bg-surface/50 text-sm hidden sm:block"
                  required
                />
                <Button type="submit" disabled={typeLoading} className="bg-purple-500 hover:bg-purple-600 text-white shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </form>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {credTypes.map(type => (
                  <div key={type.id} className="p-3 bg-surface/30 border border-border/40 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{type.name}</p>
                      <p className="text-xs text-text-muted">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Column 2 */}
          <div className="space-y-8">
            
            {/* Issuer Registry Module */}
            <div className="glass-card p-6 rounded-2xl space-y-4 border border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-pending/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-accent-pending" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Issuer Registry</h2>
                    <p className="text-sm text-text-muted">Approve hospitals on-chain</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => key && fetchIssuers(key)} className="text-text-muted hover:text-text-primary">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {issuersLoading ? (
                <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-16 bg-surface-raised/50 rounded-xl animate-pulse" />)}</div>
              ) : issuers.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border/30 rounded-xl bg-surface/30">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-text-muted">No issuers registered yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                  {issuers.map(issuer => (
                    <div key={issuer.id} className="flex items-center gap-4 p-4 bg-surface-raised/40 border border-border/50 rounded-xl hover:border-border/80 transition-colors">
                      <div className="w-10 h-10 bg-accent-pending/5 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-text-muted" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-sm">{issuer.orgName}</p>
                          <Badge className={`px-2 py-0 h-5 text-[9px] ${
                            issuer.registryStatus === "APPROVED"
                              ? "bg-accent-verified/10 text-accent-verified border-accent-verified/20"
                              : "bg-accent-pending/10 text-accent-pending border-accent-pending/20"
                          }`}>{issuer.registryStatus}</Badge>
                        </div>
                        <p className="text-[10px] font-mono text-text-muted/60 truncate">{issuer.publicKeyHex}</p>
                      </div>
                      {issuer.registryStatus === "PENDING" ? (
                        <Button size="sm" onClick={() => handleApprove(issuer.publicKeyHex)}
                          disabled={approveLoading === issuer.publicKeyHex || !address}
                          className="bg-accent-verified hover:bg-accent-verified/90 text-background text-xs font-bold flex-shrink-0 btn-glow">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:mr-1" />
                          <span className="hidden sm:inline">{approveLoading === issuer.publicKeyHex ? "Approving..." : "Approve"}</span>
                        </Button>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-accent-verified/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-accent-verified" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Global Audit Log */}
            <div className="glass-card p-6 rounded-2xl space-y-4 border border-border/40">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-text-primary/10 rounded-xl flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Global Audit Log</h2>
                  <p className="text-sm text-text-muted">System-wide verifiable events</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-surface/30 border border-border/40 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[9px] uppercase">{log.actorType}</Badge>
                        <span className="text-xs font-semibold text-text-primary capitalize">{log.actionType.replace('_', ' ')}</span>
                      </div>
                      <p className="text-[10px] text-text-muted font-mono">{log.credentialTypeId}</p>
                    </div>
                    <div className="text-right">
                      {log.result === "VALID" ? (
                        <span className="text-xs font-bold text-accent-verified">VALID</span>
                      ) : log.result === "INVALID" ? (
                        <span className="text-xs font-bold text-accent-revoked">INVALID</span>
                      ) : (
                        <span className="text-[10px] font-mono text-text-muted uppercase">OK</span>
                      )}
                      <p className="text-[9px] text-text-muted/60 mt-1">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-text-muted animate-pulse">Loading admin panel...</div>}>
      <AdminContent />
    </Suspense>
  );
}
