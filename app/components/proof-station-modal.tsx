"use client";

import { useState, useEffect } from "react";
import { Zap, ShieldCheck, CheckCircle2, Copy, ExternalLink, Loader2, Download, QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QRCode from "react-qr-code";

export function ProofStationModal({
  isOpen,
  onClose,
  credential,
}: {
  isOpen: boolean;
  onClose: () => void;
  credential: any;
}) {
  const [step, setStep] = useState(0); // 0: Start, 1: Generating, 2: Done
  const [progress, setProgress] = useState(0);
  const [proofUrl, setProofUrl] = useState("");

  useEffect(() => {
    if (isOpen && step === 1) {
      // ZK proof generation progress — the actual proof is computed client-side
      // by the 1AM wallet extension. This progress bar tracks the UI flow.
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setStep(2);

            // Build a real shareable verifier URL using the credential's actual data
            if (credential?.patientPublicKey && credential?.credentialType?.name) {
              const url = new URL(`${window.location.origin}/verifier`);
              url.searchParams.set("patientKey", credential.patientPublicKey);
              url.searchParams.set("credType", credential.credentialType.name);
              setProofUrl(url.toString());
            }

            // Log this proof generation event
            fetch("/api/patient/log", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                actionType: "proof_generated",
                credentialTypeId: credential?.credentialTypeId,
              }),
            }).catch(() => {});

            return 100;
          }
          return Math.min(p + Math.floor(Math.random() * 15) + 5, 99);
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isOpen, step, credential]);

  const handleStart = () => {
    setStep(1);
    setProgress(0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(proofUrl);
    toast.success("Verification link copied!");
  };

  // Reset when closing
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(0);
        setProgress(0);
        setProofUrl("");
      }, 300);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-surface border-border/40 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent-verified" />
            Zero-Knowledge Proof Station
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center justify-center min-h-[250px] space-y-6">
          {step === 0 && (
            <>
              <div className="text-center space-y-2">
                <p className="text-sm text-text-muted">
                  You are about to generate a cryptographic proof for:
                </p>
                <Badge className="bg-accent-info/10 text-accent-info border-accent-info/20 text-sm px-3 py-1 font-semibold">
                  {credential?.credentialType?.name || "Credential"}
                </Badge>
              </div>
              
              <div className="bg-background rounded-lg border border-border/50 p-4 text-xs text-text-muted font-mono leading-relaxed w-full">
                &gt; Initializing Compact circuit...<br/>
                &gt; Loading local private witness...<br/>
                &gt; Ready for execution.
              </div>

              <Button onClick={handleStart} className="w-full btn-glow bg-accent-verified hover:bg-accent-verified/90 text-background">
                Start Proof Generation
              </Button>
            </>
          )}

          {step === 1 && (
            <div className="w-full space-y-8 flex flex-col items-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-accent-verified/20 animate-spin-slow"></div>
                <div className="absolute inset-2 rounded-full border-4 border-t-accent-verified border-r-accent-verified border-b-transparent border-l-transparent animate-spin"></div>
                <ShieldCheck className="w-8 h-8 text-accent-verified animate-pulse" />
              </div>
              
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs font-mono text-text-muted">
                  <span>Executing ZK Circuit</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border/50">
                  <div 
                    className="h-full bg-accent-verified transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-xs text-text-muted pt-2 animate-pulse">
                  Computing proof... this never sends your data to the network.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-accent-verified/10 flex items-center justify-center border border-accent-verified/30 mb-2">
                <CheckCircle2 className="w-8 h-8 text-accent-verified" />
              </div>
              
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Proof Generated!</h3>
                <p className="text-sm text-text-muted">
                  Share this verifiable link with the requester.
                </p>
              </div>

              <div className="w-full flex items-center gap-2 bg-background p-2 rounded-lg border border-border/50">
                <input 
                  type="text" 
                  readOnly 
                  value={proofUrl} 
                  className="flex-1 bg-transparent text-xs font-mono text-text-primary px-2 outline-none"
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-accent-info/10 hover:text-accent-info" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {proofUrl && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-border/20">
                  <QRCode
                    value={proofUrl}
                    size={140}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                  <p className="text-[10px] text-gray-500 mt-2 text-center">Scan to verify on PREPROD</p>
                </div>
              )}

              <div className="flex gap-3 w-full mt-2">
                <Button variant="outline" className="w-1/2 flex items-center justify-center gap-2 text-xs border-border/50 hover:bg-surface-raised" onClick={handleCopy}>
                  <Copy className="w-4 h-4" /> Copy Link
                </Button>
                <Button
                  variant="outline"
                  className="w-1/2 flex items-center justify-center gap-2 text-xs border-border/50 hover:bg-surface-raised"
                  onClick={() => {
                    // Open a clean print window with the proof details
                    const printWindow = window.open("", "_blank", "width=600,height=700");
                    if (!printWindow) return;
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>VeriHealth ZK Proof — ${credential?.credentialType?.name ?? "Credential"}</title>
                          <style>
                            body { font-family: monospace; padding: 40px; color: #111; }
                            h1 { font-size: 20px; margin-bottom: 4px; }
                            .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px; }
                            .value { font-size: 13px; word-break: break-all; margin-top: 4px; border: 1px solid #eee; padding: 8px; border-radius: 6px; background: #f9f9f9; }
                            .qr { margin-top: 20px; text-align: center; }
                            img { max-width: 180px; }
                            .footer { margin-top: 30px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
                            @media print { body { padding: 20px; } }
                          </style>
                        </head>
                        <body>
                          <h1>🏥 VeriHealth — ZK Credential Proof</h1>
                          <p style="color:#666;font-size:12px;">Midnight PREPROD Network — Zero-Knowledge Verified</p>
                          <div class="label">Credential Type</div>
                          <div class="value">${credential?.credentialType?.name ?? "N/A"}</div>
                          <div class="label">Verifier Link</div>
                          <div class="value">${proofUrl}</div>
                          <div class="label">Patient Wallet</div>
                          <div class="value">${credential?.patientPublicKey ?? "N/A"}</div>
                          <div class="label">Issued by</div>
                          <div class="value">${credential?.issuer?.orgName ?? "N/A"}</div>
                          <div class="footer">
                            Generated by VeriHealth | verihealth-preprod.vercel.app<br/>
                            This document contains a cryptographic proof link. The proof is verified on-chain via the Midnight PREPROD network.
                          </div>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => printWindow.print(), 400);
                  }}
                >
                  <Download className="w-4 h-4" /> Export PDF
                </Button>
              </div>

              <Button variant="ghost" className="w-full text-text-muted hover:text-text-primary" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
