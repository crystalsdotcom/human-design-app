"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import AuthModal from "@/components/AuthModal";

const TYPE_CARDS = [
  { name: "Generator", pct: "37%", desc: "The life force. Built for mastery through response.", color: "#F0A830" },
  { name: "Manifesting Generator", pct: "33%", desc: "The multi-passionate. Speed and efficiency in everything.", color: "#E8892C" },
  { name: "Projector", pct: "20%", desc: "The guide. Sees what others miss.", color: "#8B7EC8" },
  { name: "Manifestor", pct: "8%", desc: "The initiator. Moves first, informs second.", color: "#D4617A" },
  { name: "Reflector", pct: "1%", desc: "The mirror. Samples and reflects the world.", color: "#8BD4D4" },
];

const FEATURES = [
  { title: "Your Type", desc: "Discover your energy type and the strategy that unlocks flow in your life." },
  { title: "Your Decision Strategy", desc: "Learn your built-in authority — the biological compass you were born with." },
  { title: "Your Energy Blueprint", desc: "See which energy centers are defined and how they shape your experience." },
  { title: "Your Life Purpose", desc: "Uncover your Incarnation Cross — the theme your life is designed around." },
];

export default function LandingPage() {
  const { session, configured } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 px-6 sm:px-8 py-5 flex items-center justify-between bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border)]/50">
        <span className="text-sm font-medium tracking-[0.12em]">
          HD<span className="text-[var(--accent-gold)]">OS</span>
        </span>
        <div className="flex items-center gap-4">
          {configured && session ? (
            <Link href="/dashboard" className="cta-primary !text-sm !py-2.5 !px-6 !rounded-lg">
              Dashboard
            </Link>
          ) : (
            <>
              {configured && (
                <button onClick={() => setShowAuth(true)}
                  className="text-[11px] tracking-[0.15em] uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                  Sign in
                </button>
              )}
              <Link href="/chart" className="cta-primary !text-sm !py-2.5 !px-6 !rounded-lg">
                Get Your Free Chart
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-20">
        {/* Aura orb background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] pointer-events-none">
          <div className="w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(196,162,101,0.18) 0%, rgba(232,116,97,0.12) 30%, rgba(139,126,200,0.06) 55%, transparent 72%)",
              filter: "blur(50px)",
            }} />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] pointer-events-none">
          <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(196,162,101,0.45) 0%, rgba(232,116,97,0.30) 35%, rgba(200,184,232,0.15) 60%, transparent 80%)",
              filter: "blur(30px)",
            }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <p className="text-[9px] tracking-[0.5em] uppercase text-[var(--text-tertiary)] mb-8">
            Your Personal Operating System
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] italic text-[clamp(3rem,9vw,6.5rem)] leading-[0.92] mb-6 tracking-tight">
            Discover Who You<br />Were Designed to Be
          </h1>
          <p className="text-[clamp(0.95rem,2vw,1.15rem)] text-[var(--text-secondary)] leading-relaxed mb-10 max-w-lg mx-auto">
            Enter your birth details and find out who you were designed to be — in 60 seconds.
          </p>
          <Link href="/chart" className="cta-primary text-lg px-10 py-4">
            Get Your Free Chart
          </Link>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-4 tracking-wide">
            Join 10,000+ people who&apos;ve discovered their design
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-px h-12 bg-[var(--text-primary)]/10" />
        </div>
      </section>

      {/* What is Human Design */}
      <section className="px-6 py-24 bg-[var(--bg-secondary)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="label-luxury mb-6">What is Human Design?</p>
          <h2 className="font-[family-name:var(--font-playfair)] italic text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-8">
            The most personalized self-knowledge system that exists.
          </h2>
          <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            Human Design uses your exact birth time, date, and location to generate a unique chart — your energetic blueprint. It&apos;s more specific than MBTI, Enneagram, or astrology. It reveals how you&apos;re designed to make decisions, interact with others, and find your purpose.
          </p>
        </div>
      </section>

      {/* What You'll Discover */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <p className="label-luxury text-center mb-6">What You&apos;ll Discover</p>
          <h2 className="font-[family-name:var(--font-playfair)] italic text-[clamp(2rem,5vw,3rem)] text-center mb-16">
            Your design, decoded.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="card">
                <h3 className="font-[family-name:var(--font-playfair)] italic text-xl mb-3">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Type Previews */}
      <section className="px-6 py-24 bg-[var(--bg-secondary)]">
        <div className="max-w-5xl mx-auto">
          <p className="label-luxury text-center mb-6">The 5 Types</p>
          <h2 className="font-[family-name:var(--font-playfair)] italic text-[clamp(2rem,5vw,3rem)] text-center mb-16">
            Which one are you?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {TYPE_CARDS.map((t) => (
              <div key={t.name} className="relative rounded-2xl overflow-hidden p-6 text-white min-h-[200px] flex flex-col justify-end"
                style={{ background: `linear-gradient(180deg, ${t.color}dd 0%, ${t.color} 100%)` }}>
                <p className="text-[10px] tracking-widest uppercase opacity-70 mb-1">{t.pct} of population</p>
                <h3 className="font-[family-name:var(--font-playfair)] italic text-xl mb-2">{t.name}</h3>
                <p className="text-xs opacity-80 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-28 text-center">
        <h2 className="font-[family-name:var(--font-playfair)] italic text-[clamp(2.5rem,6vw,4.5rem)] leading-tight mb-6">
          Ready to meet yourself?
        </h2>
        <p className="text-[var(--text-secondary)] mb-10 max-w-md mx-auto">
          It takes 60 seconds. No account required. Just your birth details.
        </p>
        <Link href="/chart" className="cta-primary text-lg px-12 py-4">
          Get Your Free Chart
        </Link>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24 bg-[var(--bg-secondary)]">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl text-center mb-12">
            Questions & Answers
          </h2>
          <div className="space-y-4">
            {[
              { q: "Is Human Design accurate?", a: "Human Design uses astronomical data — the exact position of celestial bodies at your birth — calculated by the Swiss Ephemeris, the same engine used by NASA. Your chart is as precise as your birth time." },
              { q: "Do I need my exact birth time?", a: "Yes, birth time matters significantly. Even a few minutes can change your chart. If you don't know your exact time, check your birth certificate or ask a family member." },
              { q: "Is the chart really free?", a: "Yes. Your chart, Type, Strategy, and Authority are completely free — forever. Premium unlocks deeper AI interpretations, daily transit readings, and compatibility reports." },
              { q: "How is this different from astrology?", a: "Human Design synthesizes astrology, the I Ching, the Kabbalah, the Hindu-Brahmin chakra system, and quantum physics into a single, unified system. It's more specific and actionable than any single modality." },
            ].map((faq) => (
              <details key={faq.q} className="group card cursor-pointer">
                <summary className="font-medium list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-[var(--text-tertiary)] group-open:rotate-45 transition-transform text-lg">+</span>
                </summary>
                <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-medium tracking-[0.12em]">
            HD<span className="text-[var(--accent-gold)]">OS</span>
          </span>
          <div className="flex gap-6 text-[11px] text-[var(--text-tertiary)]">
            <a href="#" className="hover:text-[var(--text-primary)] transition">Privacy</a>
            <a href="#" className="hover:text-[var(--text-primary)] transition">Terms</a>
            <a href="#" className="hover:text-[var(--text-primary)] transition">Contact</a>
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)]">
            &copy; {new Date().getFullYear()} Human Design OS
          </p>
        </div>
      </footer>
    </main>
  );
}
