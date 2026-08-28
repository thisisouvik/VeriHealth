import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Shield, Activity, FileText } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent-verified" />
            <span className="text-xl font-bold tracking-tight text-text-primary">VeriHealth</span>
          </div>
          <div className="flex gap-4">
            <Link href="/patient"><Button variant="ghost">Patient Portal</Button></Link>
            <Link href="/issuer"><Button variant="ghost">Issuer Portal</Button></Link>
            <Link href="/verifier"><Button variant="default">Verify a Fact</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Badge variant="outline" className="mb-6 bg-surface-raised/50 border-border text-text-muted">
            Live on Midnight PREPROD Network
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Prove the fact.<br />
            <span className="text-text-muted">Never share the record.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-text-muted mb-12">
            VeriHealth is a zero-knowledge health credential network.
            Cryptographically prove vaccination status, procedure eligibility, or lab thresholds without revealing your underlying medical data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/patient">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8">Get Started</Button>
            </Link>
            <a href="https://github.com/thisisouvik/VeriHealth" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8">View GitHub</Button>
            </a>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-surface border-border">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-accent-info/10 flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-accent-info" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Hospital Issues</h3>
                <p className="text-text-muted">A verified institution issues a signed credential to your wallet, containing your medical facts.</p>
              </CardContent>
            </Card>
            <Card className="bg-surface border-border">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-accent-pending/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-accent-pending" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Patient Proves</h3>
                <p className="text-text-muted">You generate a zero-knowledge proof locally on your device confirming the fact, hiding all other data.</p>
              </CardContent>
            </Card>
            <Card className="bg-surface border-border">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-accent-verified/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-accent-verified" />
                </div>
                <h3 className="text-xl font-bold mb-2">3. Verifier Checks</h3>
                <p className="text-text-muted">An employer or insurer verifies the proof on-chain in milliseconds. They see only the answer.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ / Trust */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Trust & Privacy</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-border">
              <AccordionTrigger>What does "zero-knowledge" mean here?</AccordionTrigger>
              <AccordionContent className="text-text-muted">
                It means you can prove a mathematical statement about your data (e.g. "my lab result is above 50") without revealing the data itself (the actual number). The verifier gets absolute cryptographic certainty that the statement is true.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-border">
              <AccordionTrigger>Who holds the medical records?</AccordionTrigger>
              <AccordionContent className="text-text-muted">
                You do. VeriHealth does not maintain a central database of patient records. The credentials live entirely in your local Lace wallet.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-border">
              <AccordionTrigger>How do verifiers trust the proof?</AccordionTrigger>
              <AccordionContent className="text-text-muted">
                VeriHealth maintains an on-chain registry of verified issuers (hospitals, labs) on the Midnight network. Every proof is cryptographically tied to an active, non-revoked issuer in this registry.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      
      <footer className="border-t border-border/40 py-12 text-center text-text-muted">
        <p>Built on the Midnight PREPROD Network.</p>
        <div className="mt-4 text-sm font-mono opacity-50">
          Contract: <span className="tracking-wider">Deploying...</span>
        </div>
      </footer>
    </div>
  );
}
