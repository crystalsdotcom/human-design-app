"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

interface Props {
  onClose: () => void;
  onSignInNeeded: () => void;
}

const FEATURES = [
  "Unlimited AI chart readings (quick, standard, deep)",
  "Decision Simulator — make aligned choices",
  "Full gate & channel analysis",
  "Unlimited charts — family, friends, partners",
  "Relationship Compatibility (coming soon)",
  "Business Mode — team & leadership insights (coming soon)",
];

export default function UpgradeModal({ onClose, onSignInNeeded }: Props) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!session) {
      onClose();
      onSignInNeeded();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: session.user.id, email: session.user.email }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-[#1C1917]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1C1917]/25 hover:text-[#1C1917] transition text-lg leading-none"
        >
          ×
        </button>

        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7C3AED] font-medium mb-2">HDOS Pro</p>
          <h2 className="text-2xl font-bold text-[#1C1917] mb-1">
            Know yourself deeply.
          </h2>
          <p className="text-sm text-[#78716C]">
            Unlock full AI readings, the Decision Simulator, and every HDOS feature.
          </p>
        </div>

        {/* Price */}
        <div className="bg-[#FAF8F5] rounded-xl p-4 mb-6 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-[#1C1917]">$29</span>
          <span className="text-[#78716C] text-sm">/ month</span>
          <span className="ml-auto text-xs text-[#1C1917]/40">Cancel anytime</span>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-6">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-[#1C1917]/70">
              <span className="text-[#7C3AED] mt-0.5 text-base leading-none">✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 rounded-xl py-4 font-semibold text-white transition-all text-sm"
        >
          {loading ? "Redirecting…" : session ? "Start Free Trial →" : "Sign in to Subscribe →"}
        </button>

        <p className="text-[10px] text-[#1C1917]/25 text-center mt-3">
          Secured by Stripe. Cancel anytime from your account.
        </p>
      </div>
    </div>
  );
}
