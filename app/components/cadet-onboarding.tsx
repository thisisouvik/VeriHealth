"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";

const steps = [
  {
    title: "Welcome to VeriHealth! 👋",
    content: "This is your secure portal for verifiable health credentials on the Midnight Network. We protect your privacy while making your data mathematically verifiable.",
  },
  {
    title: "1 AM Wallet Required 💳",
    content: "To interact with VeriHealth, you'll need the 1 AM Wallet browser extension connected to the PREPROD network. Look for the 'Connect Wallet' button.",
  },
  {
    title: "Choose Your Role 🎭",
    content: "Patient: Request and hold credentials.\nIssuer: Generate ZK proofs and issue credentials.\nVerifier: Scan and verify proofs without seeing private data.",
  },
  {
    title: "You're Ready for Liftoff! 🚀",
    content: "Explore the platform, check out the live Preprod Directory, and don't forget to leave us feedback using the button in the corner!",
  }
];

export function CadetOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenTour = localStorage.getItem("verihealth_onboarding_seen");
    if (!hasSeenTour) {
      // Small delay so it doesn't pop up instantly jarringly
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("verihealth_onboarding_seen", "true");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      handleClose();
    }
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-[90vw] max-w-[450px] shadow-2xl border-primary/20">
        <CardHeader className="pb-3 flex flex-row items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Step {currentStep + 1} of {steps.length}
            </span>
            <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="-mt-2 -mr-2" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
            {steps[currentStep].content}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between pt-4 border-t">
          <div className="flex space-x-1">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? "w-4 bg-primary" : "w-2 bg-muted"}`} 
              />
            ))}
          </div>
          <div className="space-x-2 flex">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(curr => curr - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>Finish <CheckCircle2 className="h-4 w-4 ml-2" /></>
              ) : (
                <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

