"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Copy, CheckCircle2, ArrowLeft, QrCode } from "lucide-react";
import Link from "next/link";
import { getWalletAPI } from "@/lib/chain-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";

function ProofGenerator() {
  const searchParams = useSearchParams();
  const credId = searchParams.get("credId");

  const [address, setAddress] = useState<string | null>(null);
  const [credential, setCredential] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shareableLink, setShareableLink] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const api = getWalletAPI();
        if (api) {
          const result = await api.getUnshieldedAddress();
          setAddress(result.unshieldedAddress);

          // Fetch the specific credential
          const res = await fetch(`/api/credentials?pubKey=${result.unshieldedAddress}`);
          const data = await res.json();
          if (data.credentials) {
            const found = data.credentials.find((c: any) => c.id === credId);
            setCredential(found);
            
            if (found) {
              // The shareable link points to the verifier page, prefilling the patient's key and cred type
              const link = `${window.location.origin}/verifier?patientKey=${result.unshieldedAddress}&credType=${encodeURIComponent(found.credentialType.name)}`;
              setShareableLink(link);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [credId]);

  if (loading) {
    return <div className="p-10 text-center text-text-muted animate-pulse">Preparing ZK Proof...</div>;
  }

  if (!credential) {
    return (
      <div className="p-10 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-400">Credential Not Found</h2>
        <Link href="/patient">
          <Button variant="outline">Go Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <Link href="/patient" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Generate Proof</h1>
        <p className="text-text-muted">Create a secure, zero-knowledge verification link for your {credential.credentialType.name}.</p>
      </div>

      <div className="glass-card rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-border/40 pb-6">
          <div className="w-12 h-12 rounded-xl bg-accent-verified/10 border border-accent-verified/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-accent-verified" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{credential.credentialType.name}</h3>
            <p className="text-sm text-text-muted">Issued by: {credential.issuer.orgName}</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent-verified" />
            Your Secure Verification Link
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              readOnly 
              value={shareableLink || ""} 
              className="flex-1 bg-surface-elevated border border-border/60 rounded-xl px-4 text-sm font-mono text-text-muted select-all focus:outline-none focus:border-accent-verified/50"
            />
            <Button 
              onClick={() => {
                if (shareableLink) {
                  navigator.clipboard.writeText(shareableLink);
                  toast.success("Verification link copied!");
                }
              }}
              className="btn-glow bg-accent-verified hover:bg-accent-verified/90 text-background rounded-xl px-4"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-text-muted pt-2">
            Share this link with employers, schools, or authorities. It allows them to cryptographically verify your credential on the Midnight PREPROD network without accessing any of your private medical data.
          </p>
        </div>

        <div className="pt-6 flex justify-center">
          <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center p-4 shadow-sm border border-border/20">
            {shareableLink ? (
              <QRCode 
                value={shareableLink} 
                size={160}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 160 160`}
              />
            ) : (
              <QrCode className="w-full h-full text-zinc-200" />
            )}
          </div>
        </div>
        <p className="text-center text-xs text-text-muted pt-2">Or let the verifier scan this QR code</p>
      </div>
    </div>
  );
}

export default function GenerateProofPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <ProofGenerator />
    </Suspense>
  );
}
