"use client";

import { useState } from "react";
import { MessageSquare, X, HelpCircle, Send, Phone, ThumbsUp, Star, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"support" | "feedback" | "faq">("support");
  
  // Feedback state
  const [rating, setRating] = useState<number>(0);
  const [category, setCategory] = useState("Bug Report");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Chat state
  const [chatMsg, setChatMsg] = useState("");
  const [chatSent, setChatSent] = useState(false);

  const handleSubmitFeedback = async () => {
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
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setMessage("");
          setRating(0);
        }, 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendChat = () => {
    if (!chatMsg) return;
    setChatSent(true);
    setTimeout(() => {
      setChatSent(false);
      setChatMsg("");
    }, 4000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full shadow-[0_0_20px_rgba(47,191,159,0.3)] h-14 w-14 p-0 flex items-center justify-center z-50 bg-accent-verified hover:bg-accent-verified/90 text-background transition-transform hover:scale-105"
        aria-label="Help and Support"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-surface/95 backdrop-blur-xl border border-border/40 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-accent-verified/10 border-b border-accent-verified/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-verified flex items-center justify-center">
              <Phone className="w-4 h-4 text-background" />
            </div>
            <div>
              <h3 className="font-bold text-sm">VeriHealth Support</h3>
              <p className="text-[10px] text-accent-verified font-mono">Online • Replies in &lt; 5 mins</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary transition-colors p-1 bg-surface-raised rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-border/40">
          <button 
            onClick={() => setActiveTab("support")} 
            className={`flex-1 py-2 text-xs font-semibold ${activeTab === "support" ? "border-b-2 border-accent-verified text-accent-verified" : "text-text-muted hover:text-text-primary"}`}
          >
            Live Chat
          </button>
          <button 
            onClick={() => setActiveTab("feedback")} 
            className={`flex-1 py-2 text-xs font-semibold ${activeTab === "feedback" ? "border-b-2 border-accent-info text-accent-info" : "text-text-muted hover:text-text-primary"}`}
          >
            Feedback
          </button>
          <button 
            onClick={() => setActiveTab("faq")} 
            className={`flex-1 py-2 text-xs font-semibold ${activeTab === "faq" ? "border-b-2 border-purple-400 text-purple-400" : "text-text-muted hover:text-text-primary"}`}
          >
            FAQ
          </button>
        </div>

        {/* Content */}
        <div className="p-4 h-72 overflow-y-auto">
          
          {/* LIVE CHAT TAB */}
          {activeTab === "support" && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent-verified flex items-center justify-center shrink-0 mt-1">
                    <img src="/logo.png" alt="bot" className="w-4 h-4 brightness-0 invert" />
                  </div>
                  <div className="bg-surface-raised border border-border/50 rounded-2xl rounded-tl-sm p-3 text-xs text-text-primary space-y-2 shadow-sm">
                    <p>Hi there! 👋 I'm the VeriHealth support bot.</p>
                    <p>Having trouble connecting your 1 AM Wallet on the PREPROD network? Need help verifying a proof?</p>
                  </div>
                </div>
                {chatSent && (
                  <div className="flex items-start gap-2 flex-row-reverse">
                    <div className="w-6 h-6 rounded-full bg-accent-info flex items-center justify-center shrink-0 mt-1">
                      <UserIcon />
                    </div>
                    <div className="bg-accent-info/10 border border-accent-info/20 rounded-2xl rounded-tr-sm p-3 text-xs text-text-primary shadow-sm">
                      <p>Thanks for your message! A human agent will respond to your registered email shortly.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <input 
                  type="text" 
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Type a message..." 
                  className="flex-1 bg-surface-raised border border-border/60 rounded-full px-4 py-2 text-xs outline-none focus:border-accent-verified/50"
                  disabled={chatSent}
                />
                <button onClick={handleSendChat} disabled={!chatMsg || chatSent} className="w-8 h-8 rounded-full bg-accent-verified text-background flex items-center justify-center shrink-0 disabled:opacity-50">
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          )}

          {/* FEEDBACK TAB */}
          {activeTab === "feedback" && (
            <div className="space-y-4 h-full flex flex-col justify-center">
              {submitted ? (
                <div className="text-center space-y-3 animate-in zoom-in-95">
                  <div className="w-12 h-12 bg-accent-info/10 rounded-full flex items-center justify-center mx-auto">
                    <ThumbsUp className="w-6 h-6 text-accent-info" />
                  </div>
                  <h4 className="font-bold text-accent-info">Feedback Logged!</h4>
                  <p className="text-xs text-text-muted">Thanks for helping us improve VeriHealth.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Rate your experience</label>
                    <div className="flex justify-between px-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                          <Star className={`w-6 h-6 ${rating >= s ? "fill-yellow-400 text-yellow-400" : "text-border/50"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Topic</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-surface-raised border border-border/50 rounded-lg p-2 text-xs outline-none">
                      <option>Bug Report</option>
                      <option>UX/UI Feedback</option>
                      <option>Wallet Issue</option>
                      <option>Feature Request</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Details</label>
                    <textarea 
                      value={message} onChange={(e) => setMessage(e.target.value)} 
                      placeholder="Tell us what happened..." 
                      className="w-full flex-1 bg-surface-raised border border-border/50 rounded-lg p-2 text-xs resize-none outline-none focus:border-accent-info/50"
                    />
                  </div>
                  <Button onClick={handleSubmitFeedback} disabled={isSubmitting || !rating || !message} className="w-full bg-accent-info hover:bg-accent-info/90 text-background h-8 text-xs font-bold">
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* FAQ TAB */}
          {activeTab === "faq" && (
            <div className="space-y-3">
              <div className="bg-surface-raised border border-border/40 p-3 rounded-xl">
                <h4 className="text-xs font-bold mb-1 flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5 text-purple-400" /> What is the 1 AM Wallet?</h4>
                <p className="text-[10px] text-text-muted leading-relaxed">It's the official browser extension required to sign Zero-Knowledge proofs on the Midnight network.</p>
              </div>
              <div className="bg-surface-raised border border-border/40 p-3 rounded-xl">
                <h4 className="text-xs font-bold mb-1 flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5 text-purple-400" /> Is my data on-chain?</h4>
                <p className="text-[10px] text-text-muted leading-relaxed">No. Only the cryptographic commitment (a hash) is stored on-chain. Your health data stays in your local wallet.</p>
              </div>
              <div className="bg-surface-raised border border-border/40 p-3 rounded-xl">
                <h4 className="text-xs font-bold mb-1 flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5 text-purple-400" /> How do I get credentials?</h4>
                <p className="text-[10px] text-text-muted leading-relaxed">Provide your Public Key to a registered hospital/issuer. They will attest to your facts via the network.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-background">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

