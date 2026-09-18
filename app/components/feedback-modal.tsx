"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [category, setCategory] = useState("UX");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating || !message) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, category, message }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => setIsOpen(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full shadow-lg h-12 w-12 p-0 flex items-center justify-center z-50 bg-primary hover:bg-primary/90 text-primary-foreground"
        aria-label="Send Feedback"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 animate-in slide-in-from-bottom-5">
      <Card className="shadow-2xl border-primary/20">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Send Feedback</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitted ? (
            <div className="text-center py-6 text-green-600 font-medium">
              Thank you for your feedback! 🚀
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">How would you rate your experience?</label>
                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-colors ${rating >= star ? "text-yellow-500" : "text-gray-300 hover:text-gray-400"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 text-sm border rounded-md bg-background"
                >
                  <option value="Bug">Bug Report</option>
                  <option value="UX">UX / Design</option>
                  <option value="Feature">Feature Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Details</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="w-full p-2 text-sm border rounded-md h-24 resize-none bg-background"
                  required
                />
              </div>
            </>
          )}
        </CardContent>
        {!submitted && (
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleSubmit} 
              disabled={isSubmitting || !rating || !message}
            >
              {isSubmitting ? "Sending..." : "Submit Feedback"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

