import { NetworkGuard } from "@/app/components/network-guard";
import { WalletConnect } from "@/app/components/wallet-connect";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent-verified" />
            <span className="text-xl font-bold">VeriHealth</span>
          </Link>
          <div className="flex items-center gap-4">
             <Link href="/patient" className="text-sm font-medium hover:text-accent-info">Patient</Link>
             <Link href="/issuer" className="text-sm font-medium hover:text-accent-info">Issuer</Link>
             <Link href="/verifier" className="text-sm font-medium hover:text-accent-info">Verifier</Link>
             <WalletConnect />
          </div>
        </div>
      </nav>
      <NetworkGuard>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </NetworkGuard>
      <Toaster theme="dark" />
    </div>
  );
}
