"use client";

import { useState, useEffect } from "react";

const redactedRows = [
  { width: "80%", delay: 0 },
  { width: "95%", delay: 0.1 },
  { width: "60%", delay: 0.2 },
  { width: "88%", delay: 0.3 },
  { width: "45%", delay: 0.15 },
];

const fields = [
  { label: "Patient ID",  width: "80%", value: "████████████",         revealed: "PAT-2026-0471",   color: "text-accent-info"      },
  { label: "Diagnosis",   width: "95%", value: "████████████████",     revealed: "REDACTED",         color: "text-text-muted"       },
  { label: "Lab Value",   width: "60%", value: "████████",             revealed: "68.4 mmol/L",      color: "text-accent-pending"   },
  { label: "Cleared",     width: "88%", value: "████",                 revealed: "YES ✓",            color: "text-accent-verified"  },
  { label: "Issued By",   width: "45%", value: "████████████████████", revealed: "General Hospital", color: "text-accent-info"      },
];

export function ProofVisualizer() {
  const [stage, setStage] = useState<"redacted" | "proving" | "verified">("redacted");
  const [revealIndex, setRevealIndex] = useState(-1);

  useEffect(() => {
    const cycle = () => {
      setStage("redacted");
      setRevealIndex(-1);

      setTimeout(() => setStage("proving"), 2500);

      setTimeout(() => {
        setStage("verified");
        let i = 0;
        const revealInterval = setInterval(() => {
          setRevealIndex(i);
          i++;
          if (i >= fields.length) clearInterval(revealInterval);
        }, 200);
      }, 4500);

      setTimeout(() => cycle(), 9000);
    };

    cycle();
    return () => {};
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Glow orbs behind card */}
      <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-accent-verified/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-accent-info/10 blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="glass-card rounded-2xl p-6 relative z-10 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-revoked/80" />
            <div className="w-3 h-3 rounded-full bg-accent-pending/80" />
            <div className="w-3 h-3 rounded-full bg-accent-verified/80" />
          </div>
          <span className="text-xs font-mono text-text-muted tracking-widest uppercase">Medical Record</span>
          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
            stage === "proving" ? "bg-accent-pending animate-pulse" :
            stage === "verified" ? "bg-accent-verified" : "bg-text-muted/30"
          }`} />
        </div>

        {/* Field rows */}
        <div className="space-y-3">
          {fields.map((field, i) => {
            const isRevealed = stage === "verified" && revealIndex >= i;
            const show = field.revealed !== "REDACTED";
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-20 flex-shrink-0 font-mono">{field.label}</span>
                <div className="relative flex-1 h-7 rounded overflow-hidden">
                  {/* Redacted bar */}
                  <div
                    className={`absolute inset-0 rounded transition-all duration-700 ${
                      isRevealed && show ? "opacity-0" : "opacity-100"
                    }`}
                    style={{ background: "rgba(237,239,245,0.08)" }}
                  >
                    <div className="h-full rounded" style={{ width: field.width, background: "rgba(237,239,245,0.15)" }} />
                  </div>
                  {/* Revealed text */}
                  {isRevealed && (
                    <div className={`absolute inset-0 flex items-center px-2 text-xs font-mono ${field.color} animate-redact-reveal`}>
                      {field.revealed}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status footer */}
        <div className={`mt-6 rounded-xl p-3 text-center transition-all duration-700 ${
          stage === "verified"
            ? "bg-accent-verified/10 border border-accent-verified/30"
            : stage === "proving"
            ? "bg-accent-pending/10 border border-accent-pending/20"
            : "bg-surface-raised/50 border border-border/40"
        }`}>
          {stage === "redacted" && (
            <span className="text-xs font-mono text-text-muted tracking-widest">AWAITING VERIFICATION REQUEST</span>
          )}
          {stage === "proving" && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-pending animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-accent-pending animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-accent-pending animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-xs font-mono text-accent-pending tracking-widest ml-1">GENERATING ZK PROOF</span>
            </div>
          )}
          {stage === "verified" && (
            <div className="flex items-center justify-center gap-2 animate-seal-stamp">
              <svg className="w-4 h-4 text-accent-verified" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-mono text-accent-verified tracking-widest font-bold">VERIFIED ON PREPROD</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="particle absolute rounded-full pointer-events-none"
          style={{
            width: `${3 + (i % 3)}px`,
            height: `${3 + (i % 3)}px`,
            background: i % 2 === 0 ? "rgba(47,191,159,0.6)" : "rgba(91,141,239,0.5)",
            top: `${15 + i * 12}%`,
            left: `${(i % 2 === 0) ? -12 : 108}%`,
            "--duration": `${6 + i * 1.5}s`,
            "--delay": `${i * 0.8}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
