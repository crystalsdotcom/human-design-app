"use client";

import { useState } from "react";
import ChartForm from "@/components/ChartForm";
import ChartResult from "@/components/ChartResult";
import AuthModal from "@/components/AuthModal";
import UpgradeModal from "@/components/UpgradeModal";
import { ChartData } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { session, isSubscribed, signOut, configured } = useAuth();

  return (
    <main className="min-h-screen bg-[#F8F6F2] text-[#1A1714]">

      {/* Modals */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onSignInNeeded={() => setShowAuth(true)}
        />
      )}

      {/* Header — ultra minimal */}
      <header className="px-8 py-6 flex items-center justify-between">
        <div>
          <span
            className="text-sm font-medium tracking-[0.12em] text-[#1A1714] cursor-pointer"
            onClick={() => setChart(null)}
          >
            HD<span className="text-[#7C3AED]">OS</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          {configured && (
            session ? (
              <>
                {!isSubscribed && (
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="text-[10px] tracking-[0.2em] uppercase text-[#7C3AED] hover:opacity-70 transition"
                  >
                    Upgrade ✦
                  </button>
                )}
                {isSubscribed && (
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#7C3AED]">Pro ✦</span>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-[10px] tracking-[0.2em] uppercase text-[#1A1714]/35 hover:text-[#1A1714] transition"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-[10px] tracking-[0.2em] uppercase text-[#1A1714]/40 hover:text-[#1A1714] transition"
              >
                Sign in
              </button>
            )
          )}
        </div>
      </header>

      {!chart ? (
        /* ── HERO ───────────────────────────────────────────────── */
        <div className="max-w-2xl mx-auto px-8">

          {/* Editorial headline */}
          <div className="pt-20 pb-20 text-center">
            <p className="text-[9px] tracking-[0.45em] uppercase text-[#1A1714]/30 mb-12">
              Intelligent Energetic Architecture
            </p>

            <h1
              style={{ fontFamily: "var(--font-cormorant)" }}
              className="text-[clamp(4rem,10vw,8rem)] font-light leading-[0.88] tracking-[-0.01em] text-[#1A1714] mb-10"
            >
              Know yourself<br />
              <span className="italic text-[#7C3AED]">precisely.</span>
            </h1>

            <p className="text-[#1A1714]/45 text-[13px] tracking-wide max-w-[260px] mx-auto leading-relaxed mb-20">
              Enter your birth data below for an accurate Human Design chart.
            </p>

            {/* The form */}
            <ChartForm onChart={setChart} />
          </div>

          {/* Footer tagline */}
          <div className="pb-16 text-center">
            <p className="text-[9px] tracking-[0.35em] uppercase text-[#1A1714]/20">
              Ephemeris-accurate · AI interpreted
            </p>
          </div>
        </div>

      ) : (
        /* ── RESULT — full width, ChartResult manages its own layout ── */
        <ChartResult
          chart={chart}
          onReset={() => setChart(null)}
          onUpgradeNeeded={() => setShowUpgrade(true)}
        />
      )}
    </main>
  );
}
