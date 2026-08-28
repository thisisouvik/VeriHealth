"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWalletAPI } from "@/lib/chain-provider";
import { toast } from "sonner";
import { ShieldAlert, Trash2 } from "lucide-react";

export default function IssuerDashboard() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    async function loadState() {
       const api = getWalletAPI();
       if(api) {
          const st = await api.state();
          setAddress(st.address);
          // Mock checking registry status for hackathon MVP
          setIsRegistered(true);
       }
    }
    const interval = setInterval(() => {
       if (getWalletAPI()) {
          clearInterval(interval);
          loadState();
       }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    toast("Simulating credential issuance...", { description: "Calling Compact contract..." });
    
    // Hackathon mockup of issue_credential
    setTimeout(() => {
       toast.success("Credential Issued", { description: "TxHash: 0x123...abc" });
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Issuer Dashboard</h1>
        <p className="text-text-muted mt-2">Issue verifiable credentials directly to patients.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-surface border-border">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Registry Status</CardTitle>
              {isRegistered ? (
                 <Badge className="bg-accent-verified/20 text-accent-verified border-none">Active</Badge>
              ) : (
                 <Badge className="bg-accent-pending/20 text-accent-pending border-none">Pending</Badge>
              )}
            </div>
            <CardDescription className="text-text-muted">
              Only verified issuers can write credentials that pass verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="text-sm font-mono text-text-muted">
                {address ? `Connected: ${address}` : "Wallet not connected"}
             </div>
             {isRegistered && (
                <div className="text-sm">
                   On-Chain TxHash: <span className="font-mono text-accent-info">0xabcdef1234567890</span>
                </div>
             )}
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle>Issue Credential</CardTitle>
            <CardDescription className="text-text-muted">Generate a new proof constraint for a patient.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIssue} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Patient Public Key</label>
                <Input placeholder="0x..." required className="bg-background border-border font-mono" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Credential Type</label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
                   <option>Work Clearance (Binary)</option>
                   <option>Vaccination Status (Binary)</option>
                   <option>Lab Value (Range Proof)</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={!isRegistered || loading}>Issue & Sign</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* List of issued credentials would go here */}
    </div>
  );
}
