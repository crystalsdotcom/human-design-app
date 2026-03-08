"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/AuthContext";
import { Sparkles, BookOpen, Users, ChevronRight } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

export default function DashboardPage() {
  const { profile, isPremium, configured } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const name = profile?.name || "Explorer";
  const type = profile?.type || "your type";
  const streak = profile?.streak_count || 0;

  if (!mounted) return null;

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* Greeting */}
        <div className="mb-8">
          <p className="text-[var(--text-tertiary)] text-sm">{formatDate()}</p>
          <h1 className="font-[family-name:var(--font-playfair)] italic text-3xl mt-1">
            {getGreeting()}, {name}
          </h1>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center gap-2 mb-6 text-sm text-[var(--accent-gold)]">
            <span className="text-lg">&#128293;</span>
            <span className="font-medium">Day {streak}</span>
            <span className="text-[var(--text-tertiary)]">streak</span>
          </div>
        )}

        {/* Today's Transit Card */}
        <div className="card mb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 -translate-y-8 translate-x-8"
            style={{ background: "radial-gradient(circle, var(--accent-gold), transparent)" }} />
          <p className="label-luxury mb-3">Today&apos;s Energy</p>
          <h2 className="font-[family-name:var(--font-playfair)] italic text-xl mb-3">
            Your transit reading is ready
          </h2>
          {isPremium ? (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              The Sun moves through Gate 41 today, activating your Solar Plexus.
              This is a day for imagination — let new desires surface without needing to act on them yet.
            </p>
          ) : (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              Gate 41 is active today, touching your emotional center...
              <span className="text-[var(--accent-gold)]"> Unlock your full reading</span>
            </p>
          )}
          <Link href={isPremium ? "#" : "/upgrade"} className="text-sm font-medium text-[var(--accent-gold)] flex items-center gap-1">
            {isPremium ? "Read full transit" : "Unlock full transit"} <ChevronRight size={14} />
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link href="/chat" className="card flex flex-col items-center gap-2 py-5 hover:border-[var(--accent-gold)]/30 transition">
            <Sparkles size={20} className="text-[var(--accent-gold)]" />
            <span className="text-[10px] tracking-wider uppercase text-[var(--text-secondary)]">Ask HDOS</span>
          </Link>
          <Link href="/people" className="card flex flex-col items-center gap-2 py-5 hover:border-[var(--accent-gold)]/30 transition">
            <Users size={20} className="text-[var(--accent-gold)]" />
            <span className="text-[10px] tracking-wider uppercase text-[var(--text-secondary)]">Compatibility</span>
          </Link>
          <Link href="/journal" className="card flex flex-col items-center gap-2 py-5 hover:border-[var(--accent-gold)]/30 transition">
            <BookOpen size={20} className="text-[var(--accent-gold)]" />
            <span className="text-[10px] tracking-wider uppercase text-[var(--text-secondary)]">Journal</span>
          </Link>
        </div>

        {/* Your Design Summary */}
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-4">
            <p className="label-luxury !mb-0">Your Design</p>
            <Link href="/my-design" className="text-[11px] text-[var(--accent-gold)] font-medium">
              View Full Chart
            </Link>
          </div>
          {profile?.chart_data ? (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[10px] tracking-wider uppercase text-[var(--text-tertiary)] mb-1">Type</p>
                <p className="text-sm font-medium">{profile.type}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-wider uppercase text-[var(--text-tertiary)] mb-1">Authority</p>
                <p className="text-sm font-medium">{profile.authority}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-wider uppercase text-[var(--text-tertiary)] mb-1">Profile</p>
                <p className="text-sm font-medium">{profile.profile}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-[var(--text-secondary)] mb-3">Generate your chart to see your design here</p>
              <Link href="/chart" className="cta-primary !text-sm !py-2.5 !px-6">
                Get Your Chart
              </Link>
            </div>
          )}
        </div>

        {/* Upgrade CTA for free users */}
        {!isPremium && configured && (
          <Link href="/upgrade" className="block">
            <div className="rounded-2xl p-6 text-white relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, var(--accent-gold), var(--accent-coral))" }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-12 translate-x-12" />
              <p className="text-[10px] tracking-widest uppercase opacity-80 mb-2">HDOS Premium</p>
              <h3 className="font-[family-name:var(--font-playfair)] italic text-xl mb-2">
                Unlock your full design
              </h3>
              <p className="text-sm opacity-80 mb-3">
                Unlimited AI, full transits, compatibility reports, and more.
              </p>
              <span className="text-sm font-semibold">
                Start 14-day free trial &rarr;
              </span>
            </div>
          </Link>
        )}
      </div>
    </AppShell>
  );
}
