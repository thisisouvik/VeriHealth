"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Zap, QrCode, CheckCircle2, XCircle, ArrowRight, Loader2, Scan, Link as LinkIcon, History, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type VerifResult = { status: "valid" | "invalid"; fact?: string; issuer?: string; reason?: string; ts?: string } | null;

function VerifierContent() {
  const searchParams = useSearchParams();
  const patientKey = searchParams.get("patientKey");
  const credType = searchParams.get("credType");
  const proofParam = searchParams.get("proof"); // from mock proof generation

  const [selectedFact, setSelectedFact] = useState("Work Clearance");
  const [result, setResult] = useState<VerifResult>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  
  // Scanner state
  const [scannerMode, setScannerMode] = useState<"qr" | "link">("link");
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Fetch History
    fetch("/api/verifier/history").then(r => r.json()).then(d => {
      if (d.history) setHistory(d.history);
    });
  }, []);

  useEffect(() => {
    if (patientKey && credType) {
      verifyCredential(patientKey, credType);
    } else if (proofParam) {
      // Mock verification of a proof param
      verifyCredential("mn_addr_preprod1...", "Proof Presentation");
    }
  }, [patientKey, credType, proofParam]);

  const verifyCredential = async (key: string, type: string) => {
    setLoading(true);
    setScannerMode("link"); // force switch to results view
    try {
      const res = await fetch(`/api/verifier/check?patientKey=${key}&credType=${encodeURIComponent(type)}`);
      const data = await res.json();
      setResult(data);
      if (data.status === "valid") {
        toast.success("Cryptographic Proof Verified!");
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
    const requestId = Math.random().toString(36).substring(2, 15);
    const proofUrl = `${window.location.origin}/verifier?proof=${requestId}&fact=${encodeURIComponent(selectedFact)}`;
    navigator.clipboard.writeText(proofUrl);
    toast.success("Proof request link generated!", { description: "Copied to clipboard. Send this to the patient." });
  };

  const simulateScan = () => {
    setIsScanning(true);
    toast.info("Scanning for ZK Proof QR code...");
    setTimeout(() => {
      setIsScanning(false);
      // Simulate reading a QR code that triggers verification
      verifyCredential("mn_addr_preprod1cwtsm6mjm0ygeu4a8lankwhurgenf...", "Vaccination Status");
    }, 3000);
  };

  const facts = ["Work Clearance", "Vaccination Status", "Lab Value Threshold", "Prescription Eligibility"];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-accent-pending text-xs font-mono tracking-widest uppercase">Verifier Portal</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Verify a Health Fact</h1>
          <p className="text-text-muted">Request a ZK proof from a patient. You see only the mathematical result.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted bg-surface-elevated border border-border/60 rounded-xl px-3 py-2 shadow-sm">
          <Building2 className="w-3.5 h-3.5 text-accent-pending" />
          <span className="opacity-60 uppercase tracking-widest">Active Org:</span>
          <span className="text-text-primary">Acme Corp</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Left Column: Request & Scanner */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-6 border border-border/40 hover:border-accent-info/20 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-accent-info/10 border border-accent-info/20 flex items-center justify-center flex-shrink-0">
                  <LinkIcon className="w-5 h-5 text-accent-info" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Build a Proof Request</h2>
                  <p className="text-sm text-text-muted">Generate a challenge link for the patient.</p>
                </div>
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
              <Zap className="w-4 h-4 mr-2" /> Copy Request Link <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* QR Scanner Simulation */}
          <div className="glass-card rounded-2xl p-6 border border-border/40">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-11 h-11 rounded-xl bg-text-primary/5 border border-border/50 flex items-center justify-center flex-shrink-0">
                <Scan className="w-5 h-5 text-text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">In-Person Verification</h2>
                <p className="text-sm text-text-muted">Scan a patient's generated proof QR code.</p>
              </div>
            </div>
            
            <div className="relative aspect-video bg-background/50 rounded-xl border-2 border-dashed border-border/60 overflow-hidden flex flex-col items-center justify-center group cursor-pointer" onClick={simulateScan}>
              {isScanning ? (
                <>
                  <div className="absolute inset-0 bg-accent-info/5"></div>
                  <div className="w-full h-1 bg-accent-info/50 absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                  <Loader2 className="w-8 h-8 text-accent-info animate-spin mb-2 relative z-10" />
                  <p className="text-sm text-accent-info font-mono relative z-10">Searching for ZK Proof...</p>
                </>
              ) : (
                <>
                  <QrCode className="w-10 h-10 text-text-muted/40 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-text-muted">Click to simulate scanning</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Verification Results & History */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-6 flex flex-col min-h-[350px]">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-accent-verified/10 border border-accent-verified/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-accent-verified" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Verification Terminal</h2>
                <p className="text-sm text-text-muted">Live ZK circuit verification results.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-border/40 rounded-xl bg-surface/30">
                <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-accent-pending/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-accent-pending border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                </div>
                <p className="text-sm text-text-muted font-mono animate-pulse">Running verifier circuit on-chain...</p>
              </div>
            ) : result ? (
              <div className={`rounded-xl p-5 border flex-1 animate-in zoom-in-95 ${
                result.status === "valid"
                  ? "bg-accent-verified/5 border-accent-verified/25 shadow-[0_0_30px_rgba(46,204,113,0.05)]"
                  : "bg-accent-revoked/5 border-accent-revoked/25 shadow-[0_0_30px_rgba(255,71,87,0.05)]"
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  {result.status === "valid"
                    ? <CheckCircle2 className="w-8 h-8 text-accent-verified" />
                    : <XCircle className="w-8 h-8 text-accent-revoked" />
                  }
                  <span className={`text-2xl font-extrabold tracking-tight ${result.status === "valid" ? "text-accent-verified" : "text-accent-revoked"}`}>
                    {result.status === "valid" ? "VALID PROOF" : "INVALID PROOF"}
                  </span>
                  <Badge className={`ml-auto rounded-full text-[10px] font-mono px-3 py-1 ${
                    result.status === "valid" ? "bg-accent-verified/10 text-accent-verified border-accent-verified/25 border" : "bg-accent-revoked/10 text-accent-revoked border-accent-revoked/25 border"
                  }`}>
                    ON-CHAIN VERIFIED
                  </Badge>
                </div>
                
                <div className="space-y-3 text-sm bg-background/50 rounded-lg p-4 border border-border/40">
                  <div className="flex justify-between items-center pb-2 border-b border-border/40">
                    <span className="text-text-muted">Fact verified</span>
                    <span className="font-semibold text-text-primary">{result.fact || credType}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/40">
                    <span className="text-text-muted">Issuer Identity</span>
                    <span className="font-semibold text-accent-info">{result.issuer || "Unknown"}</span>
                  </div>
                  {result.status === "invalid" && result.reason && (
                    <div className="flex justify-between items-center pb-2 border-b border-border/40">
                      <span className="text-text-muted">Reason</span>
                      <span className="font-semibold text-accent-revoked">{result.reason}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pb-2 border-b border-border/40">
                    <span className="text-text-muted">Data Revealed</span>
                    <Badge variant="outline" className="text-accent-verified border-accent-verified/30 text-[10px]">Zero Bytes</Badge>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-text-muted">Verified at</span>
                    <span className="font-mono text-xs">{result.ts}</span>
                  </div>
                </div>

                <Button variant="ghost" className="w-full mt-6" onClick={() => setResult(null)}>
                  Clear Terminal
                </Button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border border-border/40 rounded-xl border-dashed bg-surface/30">
                <QrCode className="w-10 h-10 text-text-muted/30 mb-3" />
                <p className="text-sm text-text-muted text-center px-6">Waiting for patient to provide a Zero-Knowledge Proof...</p>
              </div>
            )}
          </div>

          {/* History Dashboard */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-text-muted" />
              <h2 className="font-bold text-sm text-text-muted uppercase tracking-wider">Recent Verifications</h2>
            </div>
            
            <div className="space-y-3">
              {history.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-background/50 hover:bg-surface/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{log.fact}</p>
                    <p className="text-xs text-text-muted font-mono mt-0.5 truncate max-w-[120px] sm:max-w-[200px]">
                      {log.patient}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {log.status === "valid" ? (
                      <Badge className="bg-accent-verified/10 text-accent-verified border-accent-verified/20 text-[10px]">Valid</Badge>
                    ) : (
                      <Badge className="bg-accent-revoked/10 text-accent-revoked border-accent-revoked/20 text-[10px]">Invalid</Badge>
                    )}
                    <span className="text-[10px] text-text-muted font-mono">
                      {new Date(log.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifierDashboard() {
  return (
    <Suspense fallback={<div className="p-10 text-center animate-pulse">Loading Terminal...</div>}>
      <VerifierContent />
    </Suspense>
  );
}
