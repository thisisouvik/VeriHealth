"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, ClipboardList, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifierDashboard() {
  const [requestUrl, setRequestUrl] = useState<string | null>(null);

  const handleGenerateRequest = () => {
    // Generate a nonce and a mock URL for the patient to scan
    const nonce = Math.random().toString(36).substring(7);
    const url = `${window.location.origin}/patient/proofs?request=work-clearance&nonce=${nonce}`;
    setRequestUrl(url);
    toast.success("Proof request generated");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verifier Dashboard</h1>
        <p className="text-text-muted mt-2">Request zero-knowledge proofs from patients without seeing their data.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle>Request a Proof</CardTitle>
            <CardDescription className="text-text-muted">
              Generate a unique challenge for a patient to fulfill.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
                <label className="text-sm font-medium mb-1 block">Fact to Verify</label>
                <select className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm mb-4">
                   <option>Work Clearance</option>
                   <option>Vaccination Status</option>
                </select>
                <Button onClick={handleGenerateRequest} className="w-full gap-2">
                   <QrCode className="w-4 h-4" />
                   Generate Request Link
                </Button>
             </div>
             
             {requestUrl && (
                <div className="mt-6 p-4 border border-border rounded-lg bg-surface-raised space-y-4 text-center">
                   <p className="text-sm text-text-muted">Have the patient scan or click this link:</p>
                   <div className="p-2 bg-white w-32 h-32 mx-auto rounded-md flex items-center justify-center">
                     <QrCode className="w-24 h-24 text-black" />
                   </div>
                   <div className="font-mono text-xs break-all text-accent-info">{requestUrl}</div>
                </div>
             )}
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle>Recent Verifications</CardTitle>
            <CardDescription className="text-text-muted">
              Live results from patient proofs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/50">
               {/* Mock verification results */}
               <div className="py-4 flex justify-between items-center">
                  <div>
                     <p className="font-medium flex items-center gap-2">
                        Work Clearance <CheckCircle2 className="w-4 h-4 text-accent-verified" />
                     </p>
                     <p className="text-sm text-text-muted">Issuer: General Hospital (Verified)</p>
                  </div>
                  <Badge className="bg-accent-verified/20 text-accent-verified border-none">Valid</Badge>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
