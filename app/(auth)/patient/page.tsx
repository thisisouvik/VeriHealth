"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getWalletAPI } from "@/lib/chain-provider";

export default function PatientDashboard() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const api = getWalletAPI();
        if (!api) {
          setLoading(false);
          return;
        }
        const state = await api.state();
        const address = state.address;

        const res = await fetch(`/api/credentials?pubKey=${address}`);
        const data = await res.json();
        if (data.credentials) {
          setCredentials(data.credentials);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    // Simple poll if wallet isn't ready yet
    const interval = setInterval(() => {
       if (getWalletAPI()) {
          clearInterval(interval);
          loadData();
       }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Credentials</h1>
        <p className="text-text-muted mt-2">Manage your verified health facts without revealing underlying data.</p>
      </div>

      {loading ? (
        <div className="text-text-muted">Loading credentials...</div>
      ) : credentials.length === 0 ? (
        <Card className="bg-surface border-border">
          <CardContent className="p-8 text-center text-text-muted">
            No credentials found for your address.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {credentials.map((cred) => (
            <Card key={cred.id} className="bg-surface border-border">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  {cred.status === "VALID" && <Badge className="bg-accent-verified/20 text-accent-verified hover:bg-accent-verified/30 border-none">Valid</Badge>}
                  {cred.status === "EXPIRING" && <Badge className="bg-accent-pending/20 text-accent-pending hover:bg-accent-pending/30 border-none">Expiring Soon</Badge>}
                  {cred.status === "REVOKED" && <Badge className="bg-accent-revoked/20 text-accent-revoked hover:bg-accent-revoked/30 border-none">Revoked</Badge>}
                  <ShieldCheck className="h-4 w-4 text-accent-verified" />
                </div>
                <CardTitle className="text-xl mt-4">{cred.credentialType.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-text-muted">
                  <p>Issuer: {cred.issuer.orgName}</p>
                  <p>Issued: {new Date(cred.issueDate).toLocaleDateString()}</p>
                  {cred.expiryDate && <p>Expires: {new Date(cred.expiryDate).toLocaleDateString()}</p>}
                </div>
                <Link href={`/patient/proofs?credId=${cred.id}`}>
                  <Button className="w-full mt-6" variant="outline" disabled={cred.status === "REVOKED"}>
                    Use Credential
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TODO: Load Real Audit Log */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Disclosure Log</h2>
        <Card className="bg-surface border-border">
          <CardContent className="p-4 text-sm text-text-muted">
            Audit logs will appear here after your first proof generation.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
