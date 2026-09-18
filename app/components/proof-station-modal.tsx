"use client";

import { useState, useEffect } from "react";
import { Zap, ShieldCheck, CheckCircle2, Copy, ExternalLink, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      // Simulate ZK circuit execution
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setStep(2);
            
            // Mock generated proof URL
            const reqId = Math.random().toString(36).substring(2, 10);
            setProofUrl(`${window.location.origin}/verify?proof=${reqId}`);
            
            // In a real app, this is where we'd hit /api/audit to log the generation
            fetch("/api/patient/log", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                actionType: "proof_generated", 
                credentialTypeId: credential?.credentialTypeId 
              })
            }).catch(console.error);
            
            return 100;
          }
          // Random jumps for realism
          return p + Math.floor(Math.random() * 15) + 5;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isOpen, step]);

  const handleStart = () => {
    setStep(1);
    setProgress(0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(proofUrl);
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
      <DialogContent className="sm:max-w-md bg-surface border-border/40 shadow-2xl">
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
                > Initializing Compact circuit...<br/>
                > Loading local private witness...<br/>
                > Ready for execution.
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
                  Computing snark... this never sends your data to the network.
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

              <Button variant="outline" className="w-full" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

