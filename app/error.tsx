"use client";

import { useEffect } from "react";
import { Button } from "./components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("VeriHealth Error Boundary caught an error:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-surface/30 p-8 text-center backdrop-blur shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-text-primary">Something went wrong</h2>
        
        <p className="mb-8 text-sm text-text-muted">
          A critical error occurred while communicating with the Midnight network or rendering the UI.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row justify-center">
          <Button onClick={() => reset()} className="w-full sm:w-auto">
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full sm:w-auto">
            Return home
          </Button>
        </div>
      </div>
    </div>
  );
}
