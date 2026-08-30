"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { connectWallet, getWalletAPI, getWalletAddress } from "@/lib/chain-provider";
import {
  ShieldCheck, Rocket, Clock, CheckCircle2,
  Wallet, Building2, RefreshCw, AlertTriangle, User
} from "lucide-react";

interface Issuer {
  id: string;
  orgName: string;
  orgEmail: string;
  publicKeyHex: string;
  registryStatus: string;
  licenseNumber?: string;
  website?: string;
  createdAt: string;
}

function AdminContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key") ?? "";

  const [address, setAddress] = useState<string | null>(null);
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [issuersLoading, setIssuersLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [deployLoading, setDeployLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? ""
  );

  const fetchIssuers = async (k: string) => {
    setIssuersLoading(true);
    try {
      const res = await fetch(`/api/admin/issuers?key=${encodeURIComponent(k)}`);
      if (res.status === 401) { setAuthError(true); return; }
      setIssuers(await res.json());
    } catch { /* noop */ } finally {
      setIssuersLoading(false);
    }
  };

  useEffect(() => {
    if (!key) { setAuthError(true); return; }
    fetchIssuers(key);
    const iv = setInterval(() => fetchIssuers(key), 8000);
    return () => clearInterval(iv);
  }, [key]);

  useEffect(() => {
    const poll = setInterval(async () => {
      try { const addr = await getWalletAddress(); if (addr) setAddress(addr); } catch { /* noop */ }
    }, 1500);
    return () => clearInterval(poll);
  }, []);

  const handleConnectWallet = async () => {
    setWalletConnecting(true);
    try {
      await connectWallet();
      const addr = await getWalletAddress();
      setAddress(addr);
      toast.success("Wallet connected!");
    } catch (e: any) {
      toast.error("Connection failed", { description: e.message });
    } finally { setWalletConnecting(false); }
  };

  const handleDeploy = async () => {
    setDeployLoading(true);
    try {
      const api = getWalletAPI();
      if (!api) throw new Error("Connect your 1 AM Wallet first");
      toast.info("Generating ZK proofs for deployment...", { duration: 60000 });
      const { shieldedCoinPublicKey } = await api.getShieldedAddresses();
      const res = await fetch("/api/admin/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-deploy-key": key },
        body: JSON.stringify({ coinPublicKey: shieldedCoinPublicKey, userAddress: address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.info("Please sign in your 1 AM Wallet...", { duration: 60000 });
      const balanced = await api.balanceUnsealedTransaction(data.provenTxHex);
      await api.submitTransaction(balanced.tx);
      setContractAddress(data.contractAddress);
      toast.success("Contract deployed!", { description: `Address: ${data.contractAddress}`, duration: 30000 });
    } catch (e: any) {
      toast.error("Deployment failed", { description: e.message });
    } finally { setDeployLoading(false); }
  };

  const handleApprove = async (issuerPublicKey: string) => {
    setApproveLoading(issuerPublicKey);
    try {
      const api = getWalletAPI();
      if (!api) throw new Error("Connect your 1 AM Wallet first");
      const addr = contractAddress || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!addr) throw new Error("No contract address set.");
      toast.info("Generating on-chain approval proof...", { duration: 60000 });
      const { shieldedCoinPublicKey } = await api.getShieldedAddresses();
      const res = await fetch("/api/admin/approve-issuer", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-deploy-key": key },
        body: JSON.stringify({ coinPublicKey: shieldedCoinPublicKey, contractAddress: addr, issuerPublicKey, userAddress: address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.info("Signing in 1 AM Wallet...", { duration: 60000 });
      const balanced = await api.balanceUnsealedTransaction(data.provenTxHex);
      await api.submitTransaction(balanced.tx);
      await fetch(`/api/admin/approve-issuer/db?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issuerPublicKey }),
      });
      toast.success("Issuer approved on-chain!");
      fetchIssuers(key);
    } catch (e: any) {
      toast.error("Approval failed", { description: e.message });
    } finally { setApproveLoading(null); }
  };

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-10 rounded-2xl text-center space-y-4 max-w-sm">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-text-muted text-sm">Invalid admin key.</p>
        </div>
      </div>
    );
  }

  const pendingIssuers = issuers.filter(i => i.registryStatus === "PENDING");
  const approvedIssuers = issuers.filter(i => i.registryStatus === "APPROVED");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-surface-raised/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="VeriHealth Logo" className="h-8 w-8 drop-shadow-[0_0_8px_rgba(47,191,159,0.5)]" />
            </div>
            <div>
              <h1 className="text-base font-bold">VeriHealth Admin</h1>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">PREPROD Network</p>
            </div>
          </div>
          {address ? (
            <div className="flex items-center gap-2 bg-accent-verified/10 border border-accent-verified/25 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-4 h-4 text-accent-verified" />
              <span className="text-xs font-mono text-text-muted">{address.slice(0, 8)}...{address.slice(-6)}</span>
            </div>
          ) : (
            <Button onClick={handleConnectWallet} disabled={walletConnecting}
              className="h-9 px-4 bg-accent-verified hover:bg-accent-verified/90 text-background font-semibold rounded-xl text-sm">
              <Wallet className="w-3.5 h-3.5 mr-1.5" />
              {walletConnecting ? "Connecting..." : "Connect 1 AM Wallet"}
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pending", value: pendingIssuers.length, cls: "text-yellow-400" },
            { label: "Approved", value: approvedIssuers.length, cls: "text-accent-verified" },
            { label: "Total", value: issuers.length, cls: "text-text-primary" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="glass-card p-5 rounded-2xl">
              <p className="text-xs text-text-muted mb-1">{label} Issuers</p>
              <p className={`text-3xl font-bold ${cls}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent-info/10 rounded-xl flex items-center justify-center">
              <Rocket className="w-5 h-5 text-accent-info" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Deploy Smart Contract</h2>
              <p className="text-sm text-text-muted">Deploys the new VeriHealth contract with role-based access to PREPROD via your 1 AM Wallet</p>
            </div>
          </div>
          {contractAddress && (
            <div className="bg-accent-verified/5 border border-accent-verified/20 rounded-xl p-3">
              <p className="text-xs text-text-muted mb-1">Active Contract Address</p>
              <p className="font-mono text-xs text-accent-verified break-all">{contractAddress}</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button onClick={handleDeploy} disabled={deployLoading || !address}
              className="btn-glow bg-accent-info hover:bg-accent-info/90 text-white font-bold px-6">
              <Rocket className="w-4 h-4 mr-2" />
              {deployLoading ? "Deploying... (~60s)" : "Deploy VeriHealth Contract"}
            </Button>
            {!address && <p className="text-xs text-yellow-500">? Connect wallet first</p>}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Issuer Registry</h2>
                <p className="text-sm text-text-muted">Approve hospitals to issue credentials on-chain</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => fetchIssuers(key)} className="text-text-muted">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {issuersLoading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-16 bg-surface-raised/50 rounded-xl animate-pulse" />)}</div>
          ) : issuers.length === 0 ? (
            <div className="text-center py-10 text-text-muted">
              <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No issuers registered yet.</p>
              <p className="text-xs mt-1">Share <code className="bg-surface-raised px-1 rounded">/issuer/register</code> with hospitals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issuers.map(issuer => (
                <div key={issuer.id} className="flex items-center gap-4 p-4 bg-surface-raised/40 border border-border/50 rounded-xl">
                  <div className="w-10 h-10 bg-accent-info/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-accent-info" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{issuer.orgName}</p>
                      <Badge className={
                        issuer.registryStatus === "APPROVED"
                          ? "bg-accent-verified/10 text-accent-verified border-accent-verified/20 text-[10px]"
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px]"
                      }>{issuer.registryStatus}</Badge>
                    </div>
                    <p className="text-xs text-text-muted">{issuer.orgEmail}</p>
                    <p className="text-[10px] font-mono text-text-muted/60 truncate">{issuer.publicKeyHex}</p>
                    {issuer.licenseNumber && <p className="text-[10px] text-text-muted">License: {issuer.licenseNumber}</p>}
                  </div>
                  {issuer.registryStatus === "PENDING" ? (
                    <Button size="sm" onClick={() => handleApprove(issuer.publicKeyHex)}
                      disabled={approveLoading === issuer.publicKeyHex || !address}
                      className="bg-accent-verified hover:bg-accent-verified/90 text-background text-xs font-bold flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {approveLoading === issuer.publicKeyHex ? "Approving..." : "Approve On-Chain"}
                    </Button>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-accent-verified flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-text-muted animate-pulse">Loading admin panel...</div>}>
      <AdminContent />
    </Suspense>
  );
}
