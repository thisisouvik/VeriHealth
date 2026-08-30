"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Building2, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { getWalletAPI, getWalletAddress } from "@/lib/chain-provider";

export default function IssuerRegistration() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ orgName: "", orgEmail: "", licenseNumber: "", website: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const address = await getWalletAddress();
      const res = await fetch("/api/issuer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      setSubmitted(true);
      toast.success("Application submitted!");
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-accent-pending/10 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="w-8 h-8 text-accent-pending" />
        </div>
        <h2 className="text-2xl font-bold">Application Pending</h2>
        <p className="text-text-muted max-w-md">
          Your application to become a VeriHealth Issuer has been submitted. The network administrators will review your application shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Become an Issuer</h1>
        <p className="text-text-muted">Register your medical institution to issue verifiable health credentials.</p>
      </div>
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4 rounded-2xl">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">Organization Name</label>
            <Input required value={form.orgName} onChange={e => setForm({...form, orgName: e.target.value})} placeholder="General Hospital" className="bg-background/50 h-11" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">Organization Email</label>
            <Input required type="email" value={form.orgEmail} onChange={e => setForm({...form, orgEmail: e.target.value})} placeholder="admin@hospital.com" className="bg-background/50 h-11" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">Medical License Number</label>
            <Input required value={form.licenseNumber} onChange={e => setForm({...form, licenseNumber: e.target.value})} placeholder="LIC-12345678" className="bg-background/50 h-11" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 block">Website</label>
            <Input value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://hospital.com" className="bg-background/50 h-11" />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full btn-glow bg-accent-info hover:bg-accent-info/90 text-white font-bold h-11 mt-4">
          {loading ? "Submitting..." : "Submit Application"} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </div>
  );
}
