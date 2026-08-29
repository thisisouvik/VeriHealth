"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

  // In a real app, this would integrate with Midnight wallet provider
  // For the hackathon, we assume true on initial load and only show error if the provider detects a mismatch
  useEffect(() => {
    // TODO: Wire up to actual 1 AM Wallet network detection in Phase 4
    const requiredNetwork = process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK || "preprod";
    const checkNetwork = async () => {
      // Mock logic for now
    };
    checkNetwork();
  }, []);

  if (!isCorrectNetwork) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Network Mismatch</AlertTitle>
          <AlertDescription>
            Please switch your 1 AM Wallet to the PREPROD network to continue.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
