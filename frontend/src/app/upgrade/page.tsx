"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import AuthModal from "@/components/AuthModal";
import { Check, Sparkles, Sun, Users, BookOpen, Mic, Brain, Compass } from "lucide-react";

const FEATURES = [
  { icon: Sparkles, label: "Unlimited AI questions", free: "3/day" },
  { icon: Sun, label: "Full daily transit readings", free: "Headline only" },
  { icon: Users, label: "Complete compatibility reports", free: "Teaser" },
  { icon: BookOpen, label: "All 64 Gates & 36 Channels deep-dives", free: "Locked" },
  { icon: Compass, label: "Incarnation Cross (life purpose) reading", free: "Locked" },
  { icon: Mic, label: "Audio narration for every chart element", free: "Locked" },
  { icon: Brain, label: "Advanced journal with AI-powered insights", free: "Basic" },
  { icon: Compass, label: "Variables & PHS (diet/environment)", free: "Locked" },
];

export default function UpgradePage() {
  const { session, configured } = useAuth();
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  async function handleCheckout() {
    if (!session) {
      setShowAuth(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: session.user.id,
          email: session.user.email,
          plan,
        }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm font-medium tracking-[0.12em]">
          HD<span className="text-[var(--accent-gold)]">OS</span>
        </Link>
        <Link href="/dashboard" className="text-[11px] tracking-[0.15em] uppercase text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition">
          Back
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Headline */}
        <div className="text-center mb-14">
          <p className="label-luxury mb-4">HDOS Premium</p>
          <h1 className="font-[family-name:var(--font-playfair)] italic text-[clamp(2.5rem,6vw,4rem)] leading-tight mb-4">
            Unlock Your Full Design
          </h1>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Everything you need to live in alignment with who you were designed to be.
          </p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <button
            onClick={() => setPlan("monthly")}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition ${
              plan === "monthly"
                ? "bg-[var(--text-primary)] text-white"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPlan("annual")}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition relative ${
              plan === "annual"
                ? "bg-[var(--text-primary)] text-white"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
            }`}
          >
            Annual
            <span className="absolute -top-2 -right-2 text-[8px] tracking-wider uppercase bg-[var(--accent-gold)] text-white px-2 py-0.5 rounded-full">
              Save 45%
            </span>
          </button>
        </div>

        {/* Price Display */}
        <div className="text-center mb-12">
          {plan === "annual" ? (
            <>
              <div className="flex items-baseline justify-center gap-2">
                <span className="font-[family-name:var(--font-playfair)] italic text-6xl">$99</span>
                <span className="text-[var(--text-tertiary)]">/ year</span>
              </div>
              <p className="text-sm text-[var(--accent-gold)] mt-2 font-medium">
                Less than $9 / month
              </p>
            </>
          ) : (
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-[family-name:var(--font-playfair)] italic text-6xl">$15</span>
              <span className="text-[var(--text-tertiary)]">/ month</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mb-12">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="cta-primary text-lg px-12 py-4 disabled:opacity-50"
          >
            {loading ? "Redirecting..." : "Start 14-Day Free Trial"}
          </button>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
            Cancel anytime &middot; No charge for 14 days &middot; Secured by Stripe
          </p>
        </div>

        {/* Features Comparison */}
        <div className="mb-12">
          <div className="grid grid-cols-[1fr,80px,80px] gap-0 text-sm">
            <div className="px-4 py-3 font-medium text-[var(--text-tertiary)] text-[10px] tracking-wider uppercase">Feature</div>
            <div className="px-2 py-3 text-center font-medium text-[var(--text-tertiary)] text-[10px] tracking-wider uppercase">Free</div>
            <div className="px-2 py-3 text-center font-medium text-[var(--accent-gold)] text-[10px] tracking-wider uppercase">Premium</div>

            {FEATURES.map(({ icon: Icon, label, free }) => (
              <div key={label} className="contents">
                <div className="px-4 py-3 border-t border-[var(--border)] flex items-center gap-2.5">
                  <Icon size={14} className="text-[var(--text-tertiary)] flex-shrink-0" />
                  <span className="text-sm">{label}</span>
                </div>
                <div className="px-2 py-3 border-t border-[var(--border)] text-center text-[11px] text-[var(--text-tertiary)]">
                  {free}
                </div>
                <div className="px-2 py-3 border-t border-[var(--border)] flex items-center justify-center">
                  <Check size={16} className="text-[var(--accent-gold)]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center mb-12">
          <p className="text-sm text-[var(--text-secondary)]">
            Trusted by 10,000+ people discovering their design
          </p>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h3 className="font-[family-name:var(--font-playfair)] italic text-xl text-center mb-6">Common Questions</h3>
          {[
            { q: "Can I cancel anytime?", a: "Yes. Cancel from your profile settings — your access continues until the end of your billing period." },
            { q: "What happens after the trial?", a: "After 14 days, you'll be charged for your selected plan. We'll remind you before the trial ends." },
            { q: "Can I switch between monthly and annual?", a: "Absolutely. Upgrade or downgrade at any time from your settings." },
          ].map((faq) => (
            <details key={faq.q} className="group card cursor-pointer">
              <summary className="font-medium text-sm list-none flex items-center justify-between">
                {faq.q}
                <span className="text-[var(--text-tertiary)] group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
