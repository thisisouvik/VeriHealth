import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, ArrowRight, Lock, Zap, Building2 } from "lucide-react";
import { ProofVisualizer } from "@/app/components/proof-visualizer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background aurora-bg">

      {/* === NAVIGATION === */}
      <nav className="border-b border-border/30 bg-surface/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Shield className="h-6 w-6 text-accent-verified" />
              <div className="absolute inset-0 text-accent-verified blur-sm opacity-50">
                <Shield className="h-6 w-6" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">VeriHealth</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/patient">
              <Button variant="ghost" className="text-text-muted hover:text-text-primary hover:bg-surface-raised/60 rounded-lg">Patient</Button>
            </Link>
            <Link href="/issuer">
              <Button variant="ghost" className="text-text-muted hover:text-text-primary hover:bg-surface-raised/60 rounded-lg">Issuer</Button>
            </Link>
            <Link href="/verifier">
              <Button variant="ghost" className="text-text-muted hover:text-text-primary hover:bg-surface-raised/60 rounded-lg">Verifier</Button>
            </Link>
          </div>
          <Link href="/patient">
            <Button className="btn-glow bg-accent-verified hover:bg-accent-verified/90 text-background font-semibold rounded-xl px-5 h-10">
              Launch App <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* === HERO — split layout === */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        {/* Radial fade at edges */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(8,14,26,0.95) 100%)"
        }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — Text */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="inline-flex items-center gap-2 bg-accent-verified/10 border border-accent-verified/30 text-accent-verified px-3 py-1.5 rounded-full text-xs font-mono tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-verified animate-pulse" />
                  LIVE · MIDNIGHT PREPROD NETWORK
                </Badge>

                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05]">
                  Prove the fact.
                  <br />
                  <span className="text-glow-teal" style={{ color: "var(--accent-verified)" }}>
                    Never share
                  </span>
                  <br />
                  the record.
                </h1>
              </div>

              <p className="text-lg text-text-muted leading-relaxed max-w-xl">
                Zero-knowledge health credentials on Midnight. Hospitals issue signed facts to your wallet. You prove what needs proving — without revealing anything else. Verifiers get cryptographic certainty, not your medical history.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <Link href="/patient">
                  <Button size="lg" className="btn-glow h-12 px-8 bg-accent-verified hover:bg-accent-verified/90 text-background font-bold rounded-xl text-base shadow-lg shadow-accent-verified/20">
                    Start as Patient
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/verifier">
                  <Button size="lg" variant="outline" className="btn-glow h-12 px-8 border-border/70 hover:border-accent-info/50 hover:bg-accent-info/5 rounded-xl text-base">
                    Verify a Credential
                  </Button>
                </Link>
              </div>

              {/* Trust stats */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-border/40">
                {[
                  { label: "Zero Data Exposed", icon: "🔒" },
                  { label: "On-Chain Verified", icon: "⛓️" },
                  { label: "PREPROD Live", icon: "🌐" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-sm text-text-muted">
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — animated proof visualizer */}
            <div className="flex justify-center lg:justify-end">
              <ProofVisualizer />
            </div>
          </div>
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-3">
            <p className="text-accent-verified text-sm font-mono tracking-widest uppercase">The Protocol</p>
            <h2 className="text-4xl font-bold tracking-tight">Three actors. One cryptographic truth.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Building2,
                iconColor: "text-accent-info",
                iconBg: "bg-accent-info/10 border-accent-info/20",
                title: "Hospital Issues",
                desc: "A verified institution signs and delivers a credential to your 1 AM Wallet. The institution stays off-chain — only the cryptographic commitment is recorded on Midnight.",
              },
              {
                step: "02",
                icon: Lock,
                iconColor: "text-accent-pending",
                iconBg: "bg-accent-pending/10 border-accent-pending/20",
                title: "Patient Proves",
                desc: "Your device runs a Compact ZK circuit locally. The proof mathematically confirms the fact without ever sending your raw medical data anywhere.",
              },
              {
                step: "03",
                icon: Zap,
                iconColor: "text-accent-verified",
                iconBg: "bg-accent-verified/10 border-accent-verified/20",
                title: "Verifier Confirms",
                desc: "An employer, insurer, or pharmacy checks the on-chain proof in milliseconds. They see exactly one bit of information: valid or invalid.",
              },
            ].map((item, i) => (
              <div key={i} className="glass-card glass-card-hover rounded-2xl p-8 relative group">
                <div className="absolute top-6 right-6 font-mono text-5xl font-black text-text-muted/8 group-hover:text-text-muted/12 transition-colors select-none">
                  {item.step}
                </div>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-6 ${item.iconBg}`}>
                  <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES STRIP === */}
      <section className="py-16 border-y border-border/30 bg-surface/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "ZK Proof Generation", sub: "Compact circuits on Midnight" },
              { label: "Issuer Registry", sub: "On-chain institutional trust" },
              { label: "Revocation & Expiry", sub: "Live nullifier enforcement" },
              { label: "Range Proofs", sub: "Prove thresholds, not values" },
            ].map((f) => (
              <div key={f.label} className="text-center space-y-1">
                <div className="text-sm font-semibold text-text-primary">{f.label}</div>
                <div className="text-xs text-text-muted">{f.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === TRUST & PRIVACY FAQ === */}
      <section className="py-28">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <p className="text-accent-info text-sm font-mono tracking-widest uppercase">Trust Architecture</p>
            <h2 className="text-4xl font-bold tracking-tight">Built for sceptics</h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {[
              {
                q: `What does "zero-knowledge" mean here?`,
                a: `It means you can prove a mathematical statement about your data (e.g. "my lab result is above 50") without revealing the data itself. The verifier gets absolute cryptographic certainty. No trust in VeriHealth required.`,
              },
              {
                q: "Who holds the medical records?",
                a: "You do. VeriHealth does not store patient records. Your credentials live entirely in your local 1 AM Wallet. Even if our servers were compromised, there is nothing to steal.",
              },
              {
                q: "How do verifiers trust the proof?",
                a: "VeriHealth maintains an on-chain registry of verified issuers on Midnight PREPROD. Every proof is cryptographically tied to an active, non-revoked issuer in this registry. You can verify it yourself on the block explorer.",
              },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass-card rounded-xl px-6 border-border/30 overflow-hidden">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-text-muted leading-relaxed pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="border-t border-border/30 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent-verified" />
            <span className="font-bold">VeriHealth</span>
            <span className="text-text-muted text-sm">— Proving health. Protecting privacy.</span>
          </div>
          <div className="text-xs font-mono text-text-muted text-center">
            Network: <span className="text-accent-verified">PREPROD</span>
            &nbsp;·&nbsp;
            Contract: <span className="text-text-muted/60">{process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "Deploying soon..."}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
