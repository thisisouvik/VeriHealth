"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, QrCode, Zap, ArrowRight, Copy, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

type VerifResult = { status: "valid" | "invalid"; issuer?: string; fact?: string; ts?: string; reason?: string } | null;

function VerifierContent() {
  const searchParams = useSearchParams();
  const patientKey = searchParams.get("patientKey");
  const credType = searchParams.get("credType");

  const [selectedFact, setSelectedFact] = useState("Work Clearance");
  const [requestUrl, setRequestUrl] = useState<string | null>(null);
  const [result, setResult] = useState<VerifResult>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patientKey && credType) {
      verifyCredential(patientKey, credType);
    }
  }, [patientKey, credType]);

  const verifyCredential = async (key: string, type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/verifier/check?patientKey=${key}&credType=${encodeURIComponent(type)}`);
      const data = await res.json();
      setResult(data);
      if (data.status === "valid") {
        toast.success("Credential verified successfully!");
      } else {
        toast.error(`Verification failed: ${data.reason}`);
      }
    } catch (err) {
      toast.error("Verification error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRequest = () => {
    // In a real app, this might generate a verifiable presentation request
    toast.info("This is a demo. To verify a real credential, generate a proof link from the Patient Portal and open it.");
  };

  const facts = ["Work Clearance", "Vaccination Status", "Lab Value Threshold", "Prescription Eligibility"];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1.5">
        <p className="text-accent-pending text-xs font-mono tracking-widest uppercase">Verifier Portal</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Verify a Health Fact</h1>
        <p className="text-text-muted">Request a ZK proof from a patient. You see only the result, never the data.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent-info/10 border border-accent-info/20 flex items-center justify-center flex-shrink-0">
              <QrCode className="w-5 h-5 text-accent-info" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Build a Proof Request</h2>
              <p className="text-sm text-text-muted">Select a fact and generate a challenge link for the patient.</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 block">Fact to verify</label>
            <div className="grid grid-cols-2 gap-3">
              {facts.map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFact(f)}
                  className={`text-sm text-left p-3 rounded-xl border transition-all ${
                    selectedFact === f 
                    ? "bg-accent-info/10 border-accent-info/40 text-accent-info shadow-[0_0_15px_rgba(56,189,248,0.1)]" 
                    : "bg-surface border-border/40 text-text-muted hover:border-border hover:text-text-primary"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGenerateRequest}
            className="w-full btn-glow bg-accent-info hover:bg-accent-info/90 text-background rounded-xl font-bold h-11"
          >
            <Zap className="w-4 h-4 mr-2" /> Generate Proof Request <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6 flex flex-col">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent-verified/10 border border-accent-verified/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-accent-verified" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Verification Results</h2>
              <p className="text-sm text-text-muted">Live proof results from patient responses.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] border border-border/40 rounded-xl bg-surface/30">
              <Loader2 className="w-8 h-8 text-accent-pending animate-spin mb-4" />
              <p className="text-sm text-text-muted animate-pulse">Verifying cryptographic proof...</p>
            </div>
          ) : result ? (
            <div className={`rounded-xl p-5 border flex-1 ${
              result.status === "valid"
                ? "bg-accent-verified/8 border-accent-verified/25"
                : "bg-accent-revoked/8 border-accent-revoked/25"
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {result.status === "valid"
                  ? <CheckCircle2 className="w-6 h-6 text-accent-verified" />
                  : <XCircle className="w-6 h-6 text-accent-revoked" />
                }
                <span className={`text-xl font-extrabold ${result.status === "valid" ? "text-accent-verified" : "text-accent-revoked"}`}>
                  {result.status === "valid" ? "VALID" : "INVALID"}
                </span>
                <Badge className={`ml-auto rounded-full text-xs font-mono ${
                  result.status === "valid" ? "bg-accent-verified/10 text-accent-verified border-accent-verified/25 border" : "bg-accent-revoked/10 text-accent-revoked border-accent-revoked/25 border"
                }`}>
                  ON-CHAIN VERIFIED
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border/40">
                  <span className="text-text-muted">Fact verified</span>
                  <span className="font-semibold text-text-primary">{result.fact || credType}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/40">
                  <span className="text-text-muted">Issuer (registered)</span>
                  <span className="font-semibold text-accent-info">{result.issuer || "Unknown"}</span>
                </div>
                {result.status === "invalid" && result.reason && (
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-text-muted">Reason</span>
                    <span className="font-semibold text-accent-revoked">{result.reason}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-border/40">
                  <span className="text-text-muted">Data revealed</span>
                  <span className="font-mono text-accent-verified text-xs">None ✓</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-text-muted">Verified at</span>
                  <span className="font-mono text-xs">{result.ts}</span>
                </div>
              </div>

              <p className="text-center text-[10px] text-text-muted uppercase tracking-widest font-mono mt-6 pt-4 border-t border-border/40">
                Data shown above contains ZERO patient medical information.<br/>This is by cryptographic design.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] border border-border/40 rounded-xl border-dashed bg-surface/30">
              <QrCode className="w-10 h-10 text-text-muted/30 mb-3" />
              <p className="text-sm text-text-muted text-center px-6">Waiting for patient to provide a Zero-Knowledge Proof...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifierDashboard() {
  return (
    <Suspense fallback={<div className="p-10 text-center animate-pulse">Loading...</div>}>
      <VerifierContent />
    </Suspense>
  );
}
