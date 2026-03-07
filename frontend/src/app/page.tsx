"use client";

import { useState, useRef } from "react";
import ChartForm from "@/components/ChartForm";
import ChartResult from "@/components/ChartResult";
import AuthModal from "@/components/AuthModal";
import UpgradeModal from "@/components/UpgradeModal";
import { ChartData } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const [chart, setChart]           = useState<ChartData | null>(null);
  const [showAuth, setShowAuth]     = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { session, isSubscribed, signOut, configured } = useAuth();
  const formRef = useRef<HTMLDivElement>(null);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#1A1714]">

      {/* Modals */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onSignInNeeded={() => setShowAuth(true)}
        />
      )}

      {!chart ? (
        <>
          {/* ── HEADER ──────────────────────────────────────────────────── */}
          <header className="absolute top-0 left-0 right-0 z-20 px-8 py-7 flex items-center justify-between">
            <span className="text-sm font-medium tracking-[0.12em] text-[#1A1714]/70">
              HD<span className="text-[#1A1714]">OS</span>
            </span>
            <div className="flex items-center gap-6">
              {configured && (
                session ? (
                  <>
                    {!isSubscribed && (
                      <button onClick={() => setShowUpgrade(true)}
                        className="text-[10px] tracking-[0.2em] uppercase text-[#1A1714]/50 hover:text-[#1A1714] transition">
                        Upgrade
                      </button>
                    )}
                    <button onClick={() => signOut()}
                      className="text-[10px] tracking-[0.2em] uppercase text-[#1A1714]/35 hover:text-[#1A1714] transition">
                      Sign out
                    </button>
                  </>
                ) : (
                  <button onClick={() => setShowAuth(true)}
                    className="text-[10px] tracking-[0.2em] uppercase text-[#1A1714]/40 hover:text-[#1A1714] transition">
                    Sign in
                  </button>
                )
              )}
            </div>
          </header>

          {/* ── HERO — luminous aura orb on cream ───────────────────────── */}
          <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 overflow-hidden bg-[#FDFAF5]">

            {/* Large aura orb — the visual centrepiece, light emanating outward */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] pointer-events-none">
              {/* Outer atmospheric halo */}
              <div className="w-[700px] h-[700px] rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(245,185,100,0.22) 0%, rgba(255,150,120,0.14) 30%, rgba(200,160,255,0.08) 58%, transparent 72%)",
                  filter: "blur(40px)",
                }} />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] pointer-events-none">
              {/* Inner vivid orb */}
              <div className="w-[380px] h-[380px] rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(252,210,140,0.92) 0%, rgba(250,170,110,0.78) 28%, rgba(255,138,120,0.52) 52%, rgba(210,160,255,0.28) 70%, transparent 85%)",
                  filter: "blur(28px)",
                }} />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              {/* Orb spacer — pushes headline below the orb centre */}
              <div className="h-[200px] sm:h-[220px]" />

              <p className="text-[9px] tracking-[0.5em] uppercase text-[#1A1714]/28 mb-10">
                The Human Design Operating System
              </p>

              <h1 className="font-display italic text-[clamp(4rem,11vw,8.5rem)] leading-[0.9] text-[#1A1714] mb-8 tracking-tight">
                The Blueprint<br />
                of You.
              </h1>

              <p className="font-display italic text-[clamp(1rem,2.2vw,1.25rem)] text-[#1A1714]/42 leading-relaxed mb-14 max-w-md mx-auto">
                Your energetic architecture, calculated to the exact moment of your birth.
              </p>

              <button
                onClick={scrollToForm}
                className="border border-[#1A1714]/25 text-[#1A1714]/60 rounded-full px-12 py-5 text-[10px] tracking-[0.3em] uppercase hover:border-[#1A1714]/55 hover:text-[#1A1714]/90 transition-all duration-500"
              >
                Reveal My Chart
              </button>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
              <div className="w-px h-12 bg-[#1A1714]/10" />
            </div>
          </section>

          {/* ── PROBLEM CARDS ────────────────────────────────────────────── */}
          <section className="px-6 py-28 bg-[#FAF9F6]">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5">

              <div className="bg-[#F5F3EF] rounded-3xl p-12">
                <p className="text-[9px] tracking-[0.38em] uppercase text-rose-400/80 mb-6">Problem 01</p>
                <h2 className="font-display italic text-[2.4rem] leading-[1.1] text-[#1A1714] mb-6">
                  Decision fatigue is a structural error.
                </h2>
                <p className="text-[14px] text-[#1A1714]/50 leading-relaxed">
                  You were taught to think your way to answers. But for most people, the mind is the worst decision-maker. Human Design reveals your built-in authority — the biological compass you were born with.
                </p>
              </div>

              <div className="bg-[#F5F3EF] rounded-3xl p-12">
                <p className="text-[9px] tracking-[0.38em] uppercase text-rose-400/80 mb-6">Problem 02</p>
                <h2 className="font-display italic text-[2.4rem] leading-[1.1] text-[#1A1714] mb-6">
                  Burnout isn&apos;t laziness. It&apos;s friction.
                </h2>
                <p className="text-[14px] text-[#1A1714]/50 leading-relaxed">
                  When you operate against your type, resistance is inevitable. Your chart identifies exactly where your energy leaks — and the strategy required to move through life without the push.
                </p>
              </div>

            </div>
          </section>

          {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
          <section className="px-6 py-28 text-center bg-[#F6F4F0]">
            <h2 className="font-display italic text-[clamp(2.8rem,6vw,5rem)] text-[#1A1714] mb-20">
              How it works.
            </h2>

            <div className="max-w-2xl mx-auto flex items-start justify-center gap-0">
              {/* Step 1 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-full border border-[#1A1714]/20 flex items-center justify-center mb-5">
                  <span className="font-display italic text-xl text-[#1A1714]/50">1</span>
                </div>
                <p className="text-[9px] tracking-[0.28em] uppercase text-[#1A1714]/35">Enter birth data</p>
              </div>
              {/* Line */}
              <div className="w-16 h-px bg-[#1A1714]/12 mt-6 flex-shrink-0" />
              {/* Step 2 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-full border border-[#1A1714]/20 flex items-center justify-center mb-5">
                  <span className="font-display italic text-xl text-[#1A1714]/50">2</span>
                </div>
                <p className="text-[9px] tracking-[0.28em] uppercase text-[#1A1714]/35">Calculate chart</p>
              </div>
              {/* Line */}
              <div className="w-16 h-px bg-[#1A1714]/12 mt-6 flex-shrink-0" />
              {/* Step 3 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-full border border-[#1A1714]/20 flex items-center justify-center mb-5">
                  <span className="font-display italic text-xl text-[#1A1714]/50">3</span>
                </div>
                <p className="text-[9px] tracking-[0.28em] uppercase text-[#1A1714]/35">Receive reading</p>
              </div>
            </div>
          </section>

          {/* ── FORM SECTION ─────────────────────────────────────────────── */}
          <section ref={formRef} className="px-6 py-28 bg-[#FAF9F6]">
            <div className="max-w-lg mx-auto text-center mb-16">
              <p className="text-[9px] tracking-[0.42em] uppercase text-[#1A1714]/30 mb-6">
                Precision mapped to your birth coordinates
              </p>
              <h2 className="font-display italic text-[clamp(3rem,7vw,5.5rem)] leading-[0.95] text-[#1A1714]">
                Begin here.
              </h2>
            </div>

            <div className="max-w-lg mx-auto">
              <ChartForm onChart={setChart} />
            </div>

            <p className="text-center text-[9px] tracking-[0.35em] uppercase text-[#1A1714]/18 mt-20">
              Ephemeris-accurate · AI interpreted
            </p>
          </section>
        </>

      ) : (
        /* ── RESULT ─────────────────────────────────────────────────────── */
        <>
          <header className="px-8 py-6 flex items-center justify-between">
            <span className="text-sm font-medium tracking-[0.12em] text-[#1A1714] cursor-pointer"
              onClick={() => setChart(null)}>
              HD<span className="text-[#7C3AED]">OS</span>
            </span>
            <div className="flex items-center gap-6">
              {configured && session && (
                <>
                  {!isSubscribed && (
                    <button onClick={() => setShowUpgrade(true)}
                      className="text-[10px] tracking-[0.2em] uppercase text-[#7C3AED] hover:opacity-70 transition">
                      Upgrade ✦
                    </button>
                  )}
                  <button onClick={() => signOut()}
                    className="text-[10px] tracking-[0.2em] uppercase text-[#1A1714]/35 hover:text-[#1A1714] transition">
                    Sign out
                  </button>
                </>
              )}
            </div>
          </header>
          <ChartResult
            chart={chart}
            onReset={() => setChart(null)}
            onUpgradeNeeded={() => setShowUpgrade(true)}
          />
        </>
      )}
    </main>
  );
}
