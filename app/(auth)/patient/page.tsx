"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Copy, Zap, Activity, FileText, ShieldCheck, Clock, AlertTriangle, Fingerprint, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getWalletAPI } from "@/lib/chain-provider";
import { ProofStationModal } from "@/app/components/proof-station-modal";

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-5 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="shimmer h-6 w-24 rounded-full" />
        <div className="shimmer h-8 w-8 rounded-lg" />
      </div>
      <div className="space-y-3 mt-4">
        <div className="shimmer h-4 w-full rounded" />
        <div className="shimmer h-4 w-3/4 rounded" />
        <div className="shimmer h-4 w-1/2 rounded" />
      </div>
      <div className="shimmer h-10 w-full rounded-xl mt-4" />
    </div>
  );
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  VALID:    { label: "Valid",         icon: ShieldCheck,    color: "text-accent-verified", bg: "bg-accent-verified/10", border: "border-accent-verified/25" },
  EXPIRING: { label: "Expiring Soon", icon: Clock,          color: "text-accent-pending",  bg: "bg-accent-pending/10",  border: "border-accent-pending/25"  },
  REVOKED:  { label: "Revoked",       icon: AlertTriangle,  color: "text-accent-revoked",  bg: "bg-accent-revoked/10",  border: "border-accent-revoked/25"  },
};

export default function PatientDashboard() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletDetected, setWalletDetected] = useState(true);
  
  // Proof Modal State
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedCred, setSelectedCred] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).midnight) {
      setWalletDetected(false);
      setLoading(false);
      return;
    }

    const interval = setInterval(() => {
      const api = getWalletAPI();
      if (api) {
        clearInterval(interval);
        api.getUnshieldedAddress().then((result) => {
          setAddress(result.unshieldedAddress);
          
          // Fetch Credentials
          fetch(`/api/credentials?pubKey=${result.unshieldedAddress}`)
            .then(r => r.json())
            .then(d => { if (d.credentials) setCredentials(d.credentials); })
            .finally(() => setLoading(false));

          // Fetch Audit Logs
          fetch(`/api/patient/audit?pubKey=${result.unshieldedAddress}`)
            .then(r => r.json())
            .then(d => { if (d.logs) setLogs(d.logs); });

        }).catch(() => setLoading(false));
      }
    }, 1000);
    
    // If wallet never connects, stop loading after 4s
    const timeout = setTimeout(() => setLoading(false), 4000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const expiringCount = credentials.filter(c => c.status === "EXPIRING").length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

      {/* Expiry Alert */}
      {expiringCount > 0 && (
        <Alert className="bg-accent-pending/10 border-accent-pending/30 text-accent-pending">
          <Clock className="h-5 w-5 !text-accent-pending" />
          <AlertTitle className="font-bold">Credentials Expiring</AlertTitle>
          <AlertDescription>
            You have {expiringCount} credential(s) expiring within the next 30 days. Contact your issuer to renew.
          </AlertDescription>
        </Alert>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-accent-verified text-xs font-mono tracking-widest uppercase">Patient Portal</p>
          <h1 className="text-3xl font-extrabold tracking-tight">My Credentials</h1>
          <p className="text-text-muted">Your verified health facts — metadata only, no clinical values stored here.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-surface/60 border border-border/40 rounded-xl px-4 py-2">
            <Activity className="w-3.5 h-3.5 text-accent-verified" />
            Midnight PREPROD
          </div>
          {address && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted bg-surface-elevated border border-border/60 rounded-xl px-3 py-1.5 shadow-sm">
              <span className="opacity-60 uppercase tracking-widest">Address:</span>
              <span className="text-text-primary break-all max-w-[200px] sm:max-w-xs md:max-w-md truncate select-all">{address}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  toast.success("Address copied to clipboard!");
                }}
                className="ml-1 p-1.5 hover:bg-surface rounded-md transition-colors text-text-muted hover:text-text-primary"
                title="Copy Address"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Credentials Grid */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !walletDetected ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-6">
          <ShieldCheck className="w-16 h-16 text-text-muted/40 mx-auto" />
          <div>
            <h3 className="text-xl font-bold">1 AM Wallet Not Detected</h3>
            <p className="text-text-muted mt-2 max-w-md mx-auto">
              To view and manage your zero-knowledge health credentials, you must install and connect the 1 AM Wallet browser extension.
            </p>
          </div>
          <Button onClick={() => window.open("https://midnight.network/", "_blank")} className="btn-glow bg-accent-info hover:bg-accent-info/90 text-background">
            Install Wallet
          </Button>
        </div>
      ) : credentials.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4">
          <FileText className="w-10 h-10 text-text-muted/40 mx-auto" />
          <p className="text-text-muted">No credentials found for this address. <br/>Ensure your hospital/lab has issued a credential to you.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {credentials.map((cred) => {
            const cfg = statusConfig[cred.status] || statusConfig.VALID;
            const StatusIcon = cfg.icon;
            return (
              <div key={cred.id} className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col gap-5 border border-border/30">
                {/* Status + icon */}
                <div className="flex justify-between items-start">
                  <Badge className={`${cfg.bg} ${cfg.border} ${cfg.color} border text-xs font-semibold px-3 py-1 rounded-full`}>
                    <StatusIcon className="w-3 h-3 mr-1.5 inline-block" />
                    {cfg.label}
                  </Badge>
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} ${cfg.border} border flex items-center justify-center`}>
                    <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                </div>

                {/* Credential info */}
                <div>
                  <h3 className="text-lg font-bold text-text-primary">{cred.credentialType.name}</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between text-text-muted">
                      <span>Issuer</span>
                      <span className="text-text-primary font-medium">{cred.issuer.orgName}</span>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Issued</span>
                      <span className="font-mono text-xs">{new Date(cred.issueDate).toLocaleDateString()}</span>
                    </div>
                    {cred.expiryDate && (
                      <div className="flex justify-between text-text-muted">
                        <span>Expires</span>
                        <span className={`font-mono text-xs ${cred.status === 'EXPIRING' ? 'text-accent-pending font-bold' : ''}`}>
                          {new Date(cred.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedCred(cred);
                    setIsProofModalOpen(true);
                  }}
                  className="w-full btn-glow rounded-xl font-semibold h-10 mt-auto transition-all"
                  variant={cred.status === "REVOKED" ? "outline" : "default"}
                  disabled={cred.status === "REVOKED"}
                  style={cred.status !== "REVOKED" ? {
                    background: "var(--accent-verified)",
                    color: "var(--background)",
                  } : {}}
                >
                  {cred.status === "REVOKED" ? "Revoked" : (
                    <>Generate ZK Proof <ArrowRight className="ml-1.5 w-3.5 h-3.5" /></>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Disclosure Log (Audit History) */}
      <div className="space-y-6 pt-10 border-t border-border/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Fingerprint className="w-6 h-6 text-accent-info" /> Disclosure Log
            </h2>
            <p className="text-sm text-text-muted mt-1">Record of when you generated or shared cryptographic proofs.</p>
          </div>
          <Badge variant="outline" className="text-xs font-mono text-text-muted border-border/50 hidden sm:inline-flex">
            Audit Trail
          </Badge>
        </div>
        
        <div className="glass-card rounded-2xl overflow-hidden border border-border/30">
          {logs.length === 0 ? (
            <div className="p-8 text-sm text-text-muted text-center flex flex-col items-center gap-3">
              <CalendarDays className="w-8 h-8 opacity-20" />
              Proof activity will appear here after your first verification.
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {logs.map((log) => (
                <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent-info/10 flex items-center justify-center border border-accent-info/20">
                      {log.actionType === "proof_verified" ? (
                        <ShieldCheck className="w-5 h-5 text-accent-verified" />
                      ) : (
                        <Zap className="w-5 h-5 text-accent-info" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm capitalize">
                        {log.actionType.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {log.verifier ? `Shared with: ${log.verifier}` : "Local generation"}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    {log.result === "VALID" && (
                      <Badge className="bg-accent-verified/10 text-accent-verified border-accent-verified/20 text-[10px]">
                        VERIFIED ON-CHAIN
                      </Badge>
                    )}
                    <span className="text-xs font-mono text-text-muted">
                      {new Date(log.timestamp).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProofStationModal 
        isOpen={isProofModalOpen} 
        onClose={() => setIsProofModalOpen(false)} 
        credential={selectedCred} 
      />
    </div>
  );
}



