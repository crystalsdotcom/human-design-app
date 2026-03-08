"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Bodygraph from "@/components/Bodygraph";
import { useAuth } from "@/lib/AuthContext";
import { TYPE_CONFIG, AUTHORITY_NAMES, PROFILE_NAMES, DEFINITION_SHORT } from "@/lib/types";
import { Lock } from "lucide-react";

type Tab = "overview" | "centers" | "channels" | "purpose" | "advanced";

const TABS: { key: Tab; label: string; premium?: boolean }[] = [
  { key: "overview", label: "Overview" },
  { key: "centers", label: "Centers" },
  { key: "channels", label: "Channels", premium: true },
  { key: "purpose", label: "Purpose", premium: true },
  { key: "advanced", label: "Advanced", premium: true },
];

const CENTER_INFO: Record<string, { label: string; defined: string; undefined: string }> = {
  head: { label: "Head", defined: "You have consistent inspiration and mental pressure. Ideas flow reliably.", undefined: "You're open to all kinds of inspiration. Be careful not to think about things that don't matter to you." },
  ajna: { label: "Ajna", defined: "You process information in a fixed, reliable way. Trust your mental certainty.", undefined: "You can see things from multiple perspectives. Don't try to be certain about everything." },
  throat: { label: "Throat", defined: "You have a consistent voice and way of manifesting. Communication comes naturally.", undefined: "You speak in different ways depending on who you're with. Don't try to get attention." },
  g: { label: "G Center", defined: "You have a fixed sense of identity and direction. You know who you are.", undefined: "Your identity and direction shift based on your environment. Embrace the fluidity." },
  heart: { label: "Heart / Ego", defined: "You have consistent willpower and drive. You can make and keep promises.", undefined: "Your willpower fluctuates. Don't make promises or try to prove your worth." },
  sacral: { label: "Sacral", defined: "You have sustainable life force energy. You're built for work you love.", undefined: "You don't have consistent energy. Know when to rest. You amplify others' energy." },
  solar_plexus: { label: "Solar Plexus", defined: "You ride emotional waves. Never make decisions in the highs or lows — wait for clarity.", undefined: "You absorb and amplify others' emotions. Learn to distinguish your feelings from theirs." },
  spleen: { label: "Spleen", defined: "You have reliable intuition and in-the-moment awareness. Trust your gut instinct.", undefined: "You're sensitive to what's healthy and unhealthy. Don't hold onto things out of fear." },
  root: { label: "Root", defined: "You have consistent pressure to get things done. You work at your own pace.", undefined: "You amplify stress and adrenaline. Don't let urgency run your life." },
};

export default function MyDesignPage() {
  const { profile, isPremium } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // For demo: create a mock chart view from profile data if available
  const type = profile?.type || "Generator";
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG["Generator"];
  const profileStr = profile?.profile || "3/5";
  const [pName1, pName2] = PROFILE_NAMES[profileStr] || ["Martyr", "Heretic"];
  const authority = profile?.authority || "Sacral";
  const definition = profile?.definition || "Single Definition";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRaw = profile?.chart_data as any;
  const definedCenters: string[] = chartRaw?.defined_centers || ["sacral", "throat", "g"];
  const definedChannels: string[] = chartRaw?.defined_channels || [];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="label-luxury mb-2">My Design</p>
          <h1 className="font-[family-name:var(--font-playfair)] italic text-4xl mb-2">{type}</h1>
          <p className="text-sm italic" style={{ color: cfg.accent }}>{cfg.tagline}</p>
        </div>

        {/* BodyGraph */}
        {profile?.chart_data && (
          <div className="mb-8 bg-[var(--bg-secondary)] rounded-2xl p-6">
            <Bodygraph chart={profile.chart_data as never} />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto mb-8 border-b border-[var(--border)]">
          {TABS.map(({ key, label, premium }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-[11px] tracking-wider uppercase whitespace-nowrap border-b-2 transition-colors ${
                activeTab === key
                  ? "border-[var(--accent-gold)] text-[var(--text-primary)]"
                  : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {label}
              {premium && !isPremium && <Lock size={10} className="text-[var(--text-tertiary)]" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="card">
              <p className="label-luxury mb-3">Type</p>
              <h3 className="font-[family-name:var(--font-playfair)] italic text-2xl mb-2">{type}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{cfg.tagline}</p>
            </div>
            <div className="card">
              <p className="label-luxury mb-3">Strategy</p>
              <h3 className="font-[family-name:var(--font-playfair)] italic text-xl mb-2">{cfg.strategy}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                This is how you&apos;re designed to navigate life. When you follow your strategy, resistance dissolves.
              </p>
            </div>
            <div className="card">
              <p className="label-luxury mb-3">Authority</p>
              <h3 className="font-[family-name:var(--font-playfair)] italic text-xl mb-2">
                {AUTHORITY_NAMES[authority] || authority}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Your decision-making compass. This is the part of your body that knows before your mind does.
              </p>
            </div>
            <div className="card">
              <p className="label-luxury mb-3">Profile</p>
              <h3 className="font-[family-name:var(--font-playfair)] italic text-xl mb-2">
                {profileStr} &mdash; The {pName1} &amp; The {pName2}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Your profile shapes how you learn and how others see you. It&apos;s the costume your life force wears.
              </p>
            </div>
            <div className="card">
              <p className="label-luxury mb-3">Definition</p>
              <h3 className="font-[family-name:var(--font-playfair)] italic text-xl mb-2">
                {DEFINITION_SHORT[definition] || definition}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {definition}
              </p>
            </div>
          </div>
        )}

        {activeTab === "centers" && (
          <div className="space-y-4">
            {Object.entries(CENTER_INFO).map(([key, info]) => {
              const isDefined = definedCenters.includes(key);
              return (
                <div key={key} className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${isDefined ? "bg-[var(--accent-gold)]" : "border border-[var(--border)]"}`} />
                    <h3 className="font-medium">{info.label}</h3>
                    <span className={`text-[10px] tracking-wider uppercase ${isDefined ? "text-[var(--accent-gold)]" : "text-[var(--text-tertiary)]"}`}>
                      {isDefined ? "Defined" : "Open"}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {isDefined ? info.defined : info.undefined}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "channels" && (
          <div>
            {!isPremium ? (
              <div className="text-center py-12">
                <Lock size={32} className="mx-auto text-[var(--text-tertiary)] mb-4" />
                <h3 className="font-[family-name:var(--font-playfair)] italic text-2xl mb-3">Channels & Gates</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
                  Discover your {definedChannels.length || "defined"} channels and what each Gate means for your life.
                </p>
                <Link href="/upgrade" className="cta-primary !text-sm !py-3 !px-8">
                  Unlock with Premium
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {definedChannels.length > 0 ? definedChannels.map((ch) => (
                  <div key={ch} className="card">
                    <h3 className="font-medium mb-1">{ch}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Channel deep-dive content here.</p>
                  </div>
                )) : (
                  <p className="text-sm text-[var(--text-secondary)] text-center py-8">
                    Generate your chart to see your channels.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "purpose" && (
          <div className="text-center py-12">
            {!isPremium ? (
              <>
                <Lock size={32} className="mx-auto text-[var(--text-tertiary)] mb-4" />
                <h3 className="font-[family-name:var(--font-playfair)] italic text-2xl mb-3">Incarnation Cross</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
                  Your life purpose — the theme your entire existence is built around.
                </p>
                <Link href="/upgrade" className="cta-primary !text-sm !py-3 !px-8">
                  Unlock Your Purpose
                </Link>
              </>
            ) : (
              <div className="text-left space-y-6">
                <div className="card">
                  <p className="label-luxury mb-3">Your Incarnation Cross</p>
                  <h3 className="font-[family-name:var(--font-playfair)] italic text-2xl mb-3">
                    {profile?.incarnation_cross || "Calculate your chart to discover your Cross"}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Your Incarnation Cross is the overarching theme of your life. It represents your purpose — not what you do, but what you&apos;re here to express through living.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="text-center py-12">
            {!isPremium ? (
              <>
                <Lock size={32} className="mx-auto text-[var(--text-tertiary)] mb-4" />
                <h3 className="font-[family-name:var(--font-playfair)] italic text-2xl mb-3">Variables & PHS</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
                  Your optimal diet, environment, perspective, and awareness — the deepest layer of your design.
                </p>
                <Link href="/upgrade" className="cta-primary !text-sm !py-3 !px-8">
                  Unlock Advanced
                </Link>
              </>
            ) : (
              <div className="text-left">
                <div className="card">
                  <p className="label-luxury mb-3">Variables</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Advanced variable analysis coming soon.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
