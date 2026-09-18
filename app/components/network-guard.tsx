"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Wallet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [isWalletInstalled, setIsWalletInstalled] = useState(true);

  useEffect(() => {
    const requiredNetwork = process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK || "preprod";
    
    const checkNetwork = async () => {
      try {
        if (typeof window === "undefined") return;
        
        const midnight = (window as any).midnight?.mnLace;
        if (!midnight) {
          setIsWalletInstalled(false);
          return;
        }

        setIsWalletInstalled(true);
        const api = await midnight.enable();
        const networkId = await api?.networkId?.();
        
        // If network string is returned (e.g. 'Testnet', 'Preprod', 'Undeclared')
        if (networkId && networkId.toLowerCase() !== requiredNetwork.toLowerCase()) {
          setIsCorrectNetwork(false);
        } else {
          setIsCorrectNetwork(true);
        }
      } catch (error) {
        // Wallet not enabled or user rejected
        console.warn("Wallet access error or user denied", error);
      }
    };

    checkNetwork();
    
    // Poll occasionally to detect if user changed network in the extension
    const interval = setInterval(checkNetwork, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isWalletInstalled) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4 bg-background">
        <Alert className="max-w-md border-primary/20">
          <Wallet className="h-5 w-5 text-primary" />
          <AlertTitle className="text-lg">1 AM Wallet Required</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>To use VeriHealth, you must install the 1 AM Wallet browser extension.</p>
            <Button 
              className="w-full"
              onClick={() => window.open('https://midnight.network/', '_blank')}
            >
              Get 1 AM Wallet
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg">Network Mismatch</AlertTitle>
          <AlertDescription className="mt-2">
            Please open your 1 AM Wallet extension and switch to the <strong>PREPROD</strong> network to continue.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

