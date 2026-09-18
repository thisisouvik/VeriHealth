import Link from "next/link";
import { ArrowRight, Building2, Lock, Shield, Zap, Menu, CheckCircle2, PlayCircle, Quote, Github } from "lucide-react";
import { Button } from "./components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";
import ProofVisualizer from "./components/proof-visualizer";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./components/ui/sheet";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-accent-verified/30">
      
      {/* === NAVBAR === */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-accent-verified blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img src="/logo.png" alt="VeriHealth Logo" className="h-8 w-8 relative z-10" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-text-primary to-text-muted bg-clip-text text-transparent">
              VeriHealth
            </span>
            <span className="hidden sm:inline-flex items-center rounded-full bg-accent-verified/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-accent-verified border border-accent-verified/20 ml-2">
              PREPROD
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/patient" className="text-text-muted hover:text-text-primary transition-colors hover:glow-text">For Patients</Link>
            <Link href="/issuer" className="text-text-muted hover:text-text-primary transition-colors hover:glow-text">For Institutions</Link>
            <Link href="/verifier" className="text-text-muted hover:text-text-primary transition-colors hover:glow-text">For Verifiers</Link>
            <Link href="/directory" className="text-text-muted hover:text-text-primary transition-colors hover:glow-text">User Directory</Link>
            
            <div className="h-4 w-[1px] bg-border/50 hidden lg:block"></div>
            
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="hidden lg:flex text-text-muted hover:text-text-primary">Admin</Button>
              </Link>
              <Link href="/patient">
                <Button size="sm" className="btn-glow bg-accent-verified hover:bg-accent-verified/90 text-background font-bold rounded-full px-5">
                  Connect Wallet
                </Button>
              </Link>
            </div>
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-border">
                <div className="flex flex-col gap-6 mt-8">
                  <Link href="/patient" className="text-lg font-medium text-text-primary">For Patients</Link>
                  <Link href="/issuer" className="text-lg font-medium text-text-primary">For Institutions</Link>
                  <Link href="/verifier" className="text-lg font-medium text-text-primary">For Verifiers</Link>
                  <Link href="/directory" className="text-lg font-medium text-text-primary">User Directory</Link>
                  <Link href="/admin" className="text-lg font-medium text-text-muted">Admin Panel</Link>
                  <div className="border-t border-border/40 pt-6">
                    <Link href="/patient">
                      <Button className="w-full btn-glow bg-accent-verified text-background rounded-xl">
                        Connect Wallet
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* === HERO SECTION === */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Abstract background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent-info/5 rounded-[100%] blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-verified/5 rounded-[100%] blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            {/* Left — Copy & CTA */}
            <div className="max-w-2xl space-y-8">
              <div className="inline-flex items-center rounded-full border border-accent-verified/30 bg-accent-verified/5 px-3 py-1 text-sm text-accent-verified backdrop-blur-sm shadow-[0_0_20px_rgba(46,204,113,0.1)]">
                <Shield className="mr-2 h-4 w-4" /> 
                Zero-Knowledge Medical Credentials
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.1]">
                Prove health facts.<br/>
                <span className="text-text-muted">Share zero data.</span>
              </h1>
              
              <p className="text-lg text-text-muted leading-relaxed max-w-xl">
                VeriHealth is an on-chain credential network. Hospitals issue facts. Patients prove them cryptographically using Midnight. Verifiers get absolute certainty without ever seeing a medical record.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/patient">
                  <Button size="lg" className="w-full sm:w-auto btn-glow bg-text-primary text-background hover:bg-text-primary/90 h-12 px-8 rounded-xl text-base font-bold">
                    Start as Patient
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/verifier">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto btn-glow h-12 px-8 border-border/70 hover:border-accent-info/50 hover:bg-accent-info/5 rounded-xl text-base">
                    Verify a Credential
                  </Button>
                </Link>
              </div>

              {/* Trust stats */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-border/40">
                {[
                  { label: "Zero Data Exposed", icon: "🛡️" },
                  { label: "On-Chain Verified", icon: "⛓️" },
                  { label: "PREPROD Live", icon: "🟢" },
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

      {/* === STATS BAR === */}
      <section className="py-8 border-y border-border/30 bg-surface/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center gap-8 text-center divide-x divide-border/50">
            <div className="flex-1 px-4">
              <div className="text-3xl font-extrabold text-accent-verified mb-1">72</div>
              <div className="text-xs text-text-muted font-medium uppercase tracking-wider">Beta Users</div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-3xl font-extrabold text-text-primary mb-1">3</div>
              <div className="text-xs text-text-muted font-medium uppercase tracking-wider">On-Chain Txns</div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-3xl font-extrabold text-accent-info mb-1">4</div>
              <div className="text-xs text-text-muted font-medium uppercase tracking-wider">ZK Circuits</div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-3xl font-extrabold text-accent-pending mb-1">0</div>
              <div className="text-xs text-text-muted font-medium uppercase tracking-wider">Data Breaches</div>
            </div>
          </div>
        </div>
      </section>

      {/* === DEMO VIDEO === */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">See VeriHealth in Action</h2>
            <p className="text-text-muted">Watch a full patient-to-verifier flow using the Midnight PREPROD network.</p>
          </div>
          
          <div className="relative aspect-video rounded-2xl overflow-hidden glass-card border border-border/40 shadow-2xl group flex items-center justify-center bg-surface/50">
            {/* Embedded Video Placeholder (Replaces with real iframe when clicked/in real use) */}
            <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url(/logo.png)' }}></div>
            <a href="https://youtu.be/iOvpBq-Rhko" target="_blank" rel="noopener noreferrer" className="relative z-10 flex flex-col items-center gap-4 transition-transform group-hover:scale-105">
              <div className="w-20 h-20 rounded-full bg-accent-info text-background flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.5)]">
                <PlayCircle className="w-10 h-10" />
              </div>
              <span className="font-bold text-lg text-text-primary drop-shadow-md">Play Demo (YouTube)</span>
            </a>
          </div>
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="py-24 relative">
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

      {/* === TESTIMONIALS === */}
      <section className="py-24 border-y border-border/30 bg-surface/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">What Beta Testers Say</h2>
            <p className="text-text-muted">Real feedback from our PREPROD testing cohorts.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Finally, I can prove my vaccination status without handing over a PDF that has my date of birth, home address, and full name. This is how all health apps should work.",
                role: "Patient",
                cohort: "Alpha Cohort Tester"
              },
              {
                quote: "As an HR manager, I don't want the liability of storing people's actual medical records. Seeing a green 'VALID' checkmark from the blockchain is all we legally need.",
                role: "Verifier",
                cohort: "Beta Cohort Tester"
              },
              {
                quote: "The Zero-Knowledge proof generation takes less than 30 seconds on my phone. The UI makes the cryptography completely invisible.",
                role: "Patient",
                cohort: "Gamma Cohort Tester"
              }
            ].map((t, i) => (
              <div key={i} className="glass-card p-8 rounded-2xl space-y-6 flex flex-col justify-between">
                <div>
                  <Quote className="w-8 h-8 text-accent-info/40 mb-4" />
                  <p className="text-text-primary leading-relaxed">"{t.quote}"</p>
                </div>
                <div className="pt-4 border-t border-border/40">
                  <div className="font-bold text-sm">{t.role}</div>
                  <div className="text-xs text-text-muted font-mono">{t.cohort}</div>
                </div>
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

      {/* === 4-COLUMN FOOTER === */}
      <footer className="border-t border-border/30 bg-surface/20 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Col 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="VeriHealth Logo" className="h-8 w-8 opacity-90" />
                <span className="font-bold text-lg">VeriHealth</span>
              </div>
              <p className="text-sm text-text-muted">Proving health. Protecting privacy.</p>
              <div className="inline-flex items-center gap-2 border border-accent-verified/30 bg-accent-verified/10 px-3 py-1 rounded-full text-xs text-accent-verified font-mono">
                <span className="w-2 h-2 rounded-full bg-accent-verified animate-pulse" />
                PREPROD Live
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm tracking-wider uppercase text-text-primary">Product</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><Link href="/patient" className="hover:text-accent-info transition-colors">Patient Portal</Link></li>
                <li><Link href="/issuer" className="hover:text-accent-info transition-colors">Issuer Dashboard</Link></li>
                <li><Link href="/verifier" className="hover:text-accent-info transition-colors">Verifier Portal</Link></li>
                <li><Link href="/directory" className="hover:text-accent-info transition-colors">User Directory (72)</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm tracking-wider uppercase text-text-primary">Resources</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><a href="https://github.com/thisisouvik/VeriHealth" target="_blank" rel="noreferrer" className="hover:text-accent-info transition-colors flex items-center gap-2">Source Code</a></li>
                <li><a href="https://youtu.be/iOvpBq-Rhko" target="_blank" rel="noreferrer" className="hover:text-accent-info transition-colors flex items-center gap-2"><PlayCircle className="w-4 h-4"/> Video Demo</a></li>
                <li><Link href="/docs/USAGE.md" className="hover:text-accent-info transition-colors">Documentation</Link></li>
                <li><span className="hover:text-accent-info transition-colors cursor-pointer" onClick={() => document.querySelector('button[aria-label="Send Feedback"]')?.dispatchEvent(new MouseEvent('click', {bubbles: true}))}>Feedback Loop</span></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm tracking-wider uppercase text-text-primary">Ecosystem</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><a href="https://midnight.network/" target="_blank" rel="noreferrer" className="hover:text-accent-info transition-colors">Midnight Network</a></li>
                <li><a href="https://explorer.1am.xyz/" target="_blank" rel="noreferrer" className="hover:text-accent-info transition-colors">1AM Explorer</a></li>
                <li><a href="https://chrome.google.com/webstore" target="_blank" rel="noreferrer" className="hover:text-accent-info transition-colors">1AM Wallet</a></li>
                <li><a href="https://docs.midnight.network/compact" target="_blank" rel="noreferrer" className="hover:text-accent-info transition-colors">Compact Smart Contracts</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
            <div className="flex gap-4">
              <span>© 2026 VeriHealth. All rights reserved.</span>
              <span className="hidden sm:block">|</span>
              <span className="hidden sm:block">Privacy by Design</span>
            </div>
            <div className="font-mono bg-background px-3 py-1.5 rounded-md border border-border/40">
              <span className="text-accent-verified">63+ Commits</span> | Built on Midnight
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

