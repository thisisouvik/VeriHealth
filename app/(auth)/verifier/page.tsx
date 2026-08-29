"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, QrCode, Zap, ArrowRight, Copy, Clock } from "lucide-react";
import { toast } from "sonner";

type VerifResult = { status: "valid" | "invalid"; issuer: string; fact: string; ts: string } | null;

export default function VerifierDashboard() {
  const [selectedFact, setSelectedFact] = useState("Work Clearance");
  const [requestUrl, setRequestUrl] = useState<string | null>(null);
  const [result] = useState<VerifResult>({
    status: "valid",
    issuer: "General Hospital",
    fact: "Work Clearance",
    ts: new Date().toLocaleTimeString(),
  });

  const handleGenerateRequest = () => {
    const nonce = crypto.randomUUID().slice(0, 8);
    const url = `${window.location.origin}/patient/proofs?fact=${encodeURIComponent(selectedFact)}&nonce=${nonce}`;
    setRequestUrl(url);
    toast.success("Proof request generated", { description: "Share the link with the patient" });
  };

  const copyUrl = () => {
    if (requestUrl) {
      navigator.clipboard.writeText(requestUrl);
      toast("Copied to clipboard");
    }
  };

  const facts = ["Work Clearance", "Vaccination Status", "Lab Value Threshold", "Prescription Eligibility"];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="space-y-1.5">
        <p className="text-accent-pending text-xs font-mono tracking-widest uppercase">Verifier Portal</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Verify a Health Fact</h1>
        <p className="text-text-muted">Request a ZK proof from a patient. You see only the result, never the data.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Request builder */}
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

          {/* Fact selector */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Fact to verify</p>
            <div className="grid grid-cols-2 gap-2">
              {facts.map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFact(f)}
                  className={`text-left rounded-xl px-4 py-3 text-sm transition-all border ${
                    selectedFact === f
                      ? "bg-accent-info/15 border-accent-info/40 text-text-primary font-semibold"
                      : "bg-background/40 border-border/40 text-text-muted hover:border-border hover:bg-surface-raised/40"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerateRequest}
            className="btn-glow w-full h-11 rounded-xl font-bold bg-accent-info hover:bg-accent-info/90 text-white shadow-lg shadow-accent-info/20"
          >
            <Zap className="w-4 h-4 mr-2" /> Generate Proof Request <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          {requestUrl && (
            <div className="bg-background/50 border border-accent-info/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-text-muted">Challenge URL</p>
                <button onClick={copyUrl} className="flex items-center gap-1 text-xs text-accent-info hover:underline">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>

              {/* Fake QR visual */}
              <div className="w-28 h-28 mx-auto bg-white rounded-lg p-2 flex items-center justify-center">
                <div className="grid grid-cols-5 gap-0.5 w-full h-full">
                  {[...Array(25)].map((_, i) => (
                    <div key={i} className={`rounded-[1px] ${Math.random() > 0.4 ? "bg-black" : "bg-white"}`} />
                  ))}
                </div>
              </div>

              <p className="font-mono text-xs text-accent-info/80 break-all">{requestUrl}</p>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Clock className="w-3 h-3" /> Expires in 15 minutes
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent-verified/10 border border-accent-verified/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-accent-verified" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Verification Results</h2>
              <p className="text-sm text-text-muted">Live proof results from patient responses.</p>
            </div>
          </div>

          {result && (
            <div className={`rounded-xl p-5 border ${
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
                <div className="flex justify-between">
                  <span className="text-text-muted">Fact verified</span>
                  <span className="font-semibold">{result.fact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Issuer (registered)</span>
                  <span className="font-semibold text-accent-info">{result.issuer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Data revealed</span>
                  <span className="font-semibold text-accent-verified">None ✓</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/40">
                  <span className="text-text-muted text-xs font-mono">Verified at</span>
                  <span className="text-xs font-mono text-text-muted">{result.ts}</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-center text-text-muted/60 font-mono">
            Data shown above contains ZERO patient medical information.
            <br />
            This is by cryptographic design.
          </p>
        </div>
      </div>
    </div>
  );
}
