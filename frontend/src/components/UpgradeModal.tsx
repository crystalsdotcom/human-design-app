"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

interface Props {
  onClose: () => void;
  onSignInNeeded: () => void;
}

const FEATURES = [
  "Unlimited AI questions & readings",
  "Full daily transit readings",
  "Complete compatibility reports",
  "All 64 Gates & 36 Channels deep-dives",
  "Incarnation Cross (life purpose) reading",
  "Advanced journal with AI-powered insights",
];

export default function UpgradeModal({ onClose, onSignInNeeded }: Props) {
  const { session }   = useAuth();
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(10,8,6,0.72)", backdropFilter: "blur(12px)" }}
    >
      <div
        className="relative w-full max-w-md bg-[#FAF9F6] px-10 py-14"
        style={{ boxShadow: "0 32px 80px rgba(10,8,6,0.28)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-7 text-[#1A1714]/22 hover:text-[#1A1714]/60 transition-colors text-xl leading-none"
        >
          ×
        </button>

        {/* Label */}
        <p className="text-[9px] tracking-[0.42em] uppercase text-[#1A1714]/30 mb-5">
          HDOS Pro
        </p>

        {/* Headline */}
        <h2 className="font-display italic text-[2.8rem] leading-[1.0] text-[#1A1714] mb-3">
          Know yourself<br />completely.
        </h2>
        <p className="text-[13px] text-[#1A1714]/42 leading-relaxed mb-10">
          Unlock your full AI reading, the Decision Simulator,<br />
          and every HDOS feature.
        </p>

        {/* Price */}
        <div className="border border-[#1A1714]/8 px-6 py-5 mb-10 flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-playfair)] italic text-[3rem] text-[#1A1714] leading-none">$15</span>
          <span className="text-[12px] text-[#1A1714]/35 tracking-wider">/ month</span>
          <span className="ml-auto text-[10px] text-[#1A1714]/25 tracking-[0.2em] uppercase">or $99 / year</span>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-10">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3 text-[12px] text-[#1A1714]/52 leading-relaxed">
              <span className="text-[#1A1714]/25 mt-0.5 text-[10px] flex-shrink-0">—</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full border border-[#1A1714] text-[#1A1714] hover:bg-[#1A1714] hover:text-[#FAF9F6] disabled:opacity-30 py-4 text-[10px] font-medium tracking-[0.26em] uppercase transition-all duration-300"
        >
          {loading
            ? "Redirecting…"
            : session
            ? "Start Free Trial →"
            : "Sign in to Subscribe →"}
        </button>

        <p className="text-[9px] text-[#1A1714]/20 text-center mt-5">
          Secured by Stripe · Cancel anytime from your account
        </p>
      </div>
    </div>
  );
}
