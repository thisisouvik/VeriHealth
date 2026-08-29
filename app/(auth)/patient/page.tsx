"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, AlertTriangle, FileText, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { getWalletAPI } from "@/lib/chain-provider";

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="shimmer h-5 w-24 rounded-lg" />
      <div className="shimmer h-6 w-40 rounded-lg" />
      <div className="space-y-2 pt-2">
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const api = getWalletAPI();
      if (api) {
        clearInterval(interval);
        api.state().then((st: any) => {
          fetch(`/api/credentials?pubKey=${st.address}`)
            .then(r => r.json())
            .then(d => { if (d.credentials) setCredentials(d.credentials); })
            .finally(() => setLoading(false));
        }).catch(() => setLoading(false));
      }
    }, 1000);
    // If wallet never connects, stop loading after 4s
    setTimeout(() => setLoading(false), 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-accent-verified text-xs font-mono tracking-widest uppercase">Patient Portal</p>
          <h1 className="text-3xl font-extrabold tracking-tight">My Credentials</h1>
          <p className="text-text-muted">Your verified health facts — metadata only, no clinical values stored here.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-surface/60 border border-border/40 rounded-xl px-4 py-2">
          <Activity className="w-3.5 h-3.5 text-accent-verified" />
          Midnight PREPROD
        </div>
      </div>

      {/* Credentials */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : credentials.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4">
          <FileText className="w-10 h-10 text-text-muted/40 mx-auto" />
          <p className="text-text-muted">No credentials found. Connect your 1 AM Wallet and ensure an issuer has issued a credential to your address.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {credentials.map((cred) => {
            const cfg = statusConfig[cred.status] || statusConfig.VALID;
            const StatusIcon = cfg.icon;
            return (
              <div key={cred.id} className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col gap-5">
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
                  <h3 className="text-lg font-bold">{cred.credentialType.name}</h3>
                  <div className="mt-3 space-y-1.5 text-sm">
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
                        <span className="font-mono text-xs">{new Date(cred.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {cred.onChainTxHash && (
                      <div className="flex justify-between text-text-muted pt-1 border-t border-border/40">
                        <span>TxHash</span>
                        <span className="font-mono text-xs text-accent-info truncate max-w-[120px]">{cred.onChainTxHash}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Link href={`/patient/proofs?credId=${cred.id}`} className="mt-auto">
                  <Button
                    className="w-full btn-glow rounded-xl font-semibold h-10"
                    variant={cred.status === "REVOKED" ? "outline" : "default"}
                    disabled={cred.status === "REVOKED"}
                    style={cred.status !== "REVOKED" ? {
                      background: "var(--accent-verified)",
                      color: "var(--background)",
                    } : {}}
                  >
                    {cred.status === "REVOKED" ? "Revoked" : (
                      <>Generate Proof <ArrowRight className="ml-1.5 w-3.5 h-3.5" /></>
                    )}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Disclosure log */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Disclosure Log</h2>
          <Badge variant="outline" className="text-xs font-mono text-text-muted border-border/50">Audit Trail</Badge>
        </div>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 text-sm text-text-muted text-center">
            Proof activity will appear here after your first verification.
          </div>
        </div>
      </div>
    </div>
  );
}
