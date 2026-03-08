"use client";

import { useState } from "react";
import Link from "next/link";
import ChartForm from "@/components/ChartForm";
import ChartResult from "@/components/ChartResult";
import AuthModal from "@/components/AuthModal";
import { ChartData } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function ChartPage() {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const { session, configured } = useAuth();

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {!chart ? (
        <>
          {/* Header */}
          <header className="px-6 sm:px-8 py-5 flex items-center justify-between border-b border-[var(--border)]/50">
            <Link href="/" className="text-sm font-medium tracking-[0.12em]">
              HD<span className="text-[var(--accent-gold)]">OS</span>
            </Link>
            <div className="flex items-center gap-4">
              {configured && !session && (
                <button onClick={() => setShowAuth(true)}
                  className="text-[11px] tracking-[0.15em] uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                  Sign in
                </button>
              )}
            </div>
          </header>

          {/* Form Section */}
          <section className="px-6 py-20">
            <div className="max-w-lg mx-auto text-center mb-14">
              <p className="label-luxury mb-4">
                Precision mapped to your birth coordinates
              </p>
              <h1 className="font-[family-name:var(--font-playfair)] italic text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.95]">
                Get Your Free Chart
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-4">
                Enter your birth details below. Your chart generates instantly.
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <ChartForm onChart={setChart} />
            </div>

            <p className="text-center text-[9px] tracking-[0.35em] uppercase text-[var(--text-tertiary)] mt-16">
              Ephemeris-accurate &middot; AI interpreted &middot; Free forever
            </p>
          </section>
        </>
      ) : (
        <>
          {/* Header for result */}
          <header className="px-6 sm:px-8 py-5 flex items-center justify-between">
            <Link href="/" className="text-sm font-medium tracking-[0.12em]">
              HD<span className="text-[var(--accent-gold)]">OS</span>
            </Link>
            <div className="flex items-center gap-4">
              {configured && !session && (
                <button onClick={() => setShowAuth(true)}
                  className="text-[11px] tracking-[0.15em] uppercase text-[var(--accent-gold)] hover:opacity-70 transition">
                  Save My Chart
                </button>
              )}
              {configured && session && (
                <Link href="/dashboard"
                  className="text-[11px] tracking-[0.15em] uppercase text-[var(--accent-gold)] hover:opacity-70 transition">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </header>
          <ChartResult
            chart={chart}
            onReset={() => setChart(null)}
            onUpgradeNeeded={() => setShowAuth(true)}
          />
        </>
      )}
    </main>
  );
}
