import { NetworkGuard } from "@/app/components/network-guard";
import { WalletConnect } from "@/app/components/wallet-connect";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background aurora-bg">
      {/* Subtle grid pattern in dashboard bg */}
      <div className="fixed inset-0 grid-pattern opacity-15 pointer-events-none z-0" />

      <nav className="border-b border-border/30 bg-surface/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <img src="/logo.png" alt="VeriHealth Logo" className="h-7 w-7 sm:h-8 sm:w-8 transition-transform group-hover:scale-110 drop-shadow-[0_0_8px_rgba(47,191,159,0.5)]" />
            <span className="hidden md:inline text-xl font-bold tracking-tight">VeriHealth</span>
          </Link>

          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar">
            {[
              { href: "/patient", label: "Patient" },
              { href: "/issuer", label: "Issuer" },
              { href: "/verifier", label: "Verifier" },
            ].map((nav) => (
              <Link key={nav.href} href={nav.href}
                className="text-xs sm:text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-raised/60 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200">
                {nav.label}
              </Link>
            ))}
            <div className="ml-1 sm:ml-3 shrink-0">
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <NetworkGuard>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
          {children}
        </main>
      </NetworkGuard>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
