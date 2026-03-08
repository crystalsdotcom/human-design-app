"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/AuthContext";
import { Lock, Search } from "lucide-react";

interface ContentItem {
  title: string;
  subtitle: string;
  layer: string;
  premium?: boolean;
  count?: string;
}

const CONTENT_SECTIONS: { layer: string; items: ContentItem[] }[] = [
  {
    layer: "Layer 1 — Type",
    items: [
      { title: "Generator", subtitle: "The life force — 37% of the population", layer: "type" },
      { title: "Manifesting Generator", subtitle: "The multi-passionate — 33%", layer: "type" },
      { title: "Projector", subtitle: "The guide — 20%", layer: "type" },
      { title: "Manifestor", subtitle: "The initiator — 8%", layer: "type" },
      { title: "Reflector", subtitle: "The mirror — 1%", layer: "type" },
    ],
  },
  {
    layer: "Layer 2 — Authority",
    items: [
      { title: "Sacral Authority", subtitle: "Gut knowing — trust the body's yes/no", layer: "authority" },
      { title: "Emotional Authority", subtitle: "Ride the wave — clarity comes with time", layer: "authority" },
      { title: "Splenic Authority", subtitle: "Instinct — one-time, in-the-moment knowing", layer: "authority" },
      { title: "Ego Authority", subtitle: "Willpower — does the heart back it?", layer: "authority" },
      { title: "Self-Projected Authority", subtitle: "Voice — listen to what you hear yourself say", layer: "authority" },
      { title: "Mental Authority", subtitle: "Environment — gather trusted perspectives", layer: "authority" },
      { title: "Lunar Authority", subtitle: "28-day cycle — sample the moon's journey", layer: "authority" },
    ],
  },
  {
    layer: "Layer 3 — Profile",
    items: [
      { title: "12 Profiles", subtitle: "From 1/3 Investigator-Martyr to 6/3 Role Model-Martyr", layer: "profile", count: "12 profiles" },
    ],
  },
  {
    layer: "Layer 4 — Centers",
    items: [
      { title: "9 Energy Centers", subtitle: "Head, Ajna, Throat, G, Heart, Sacral, Solar Plexus, Spleen, Root", layer: "centers", count: "9 centers" },
    ],
  },
  {
    layer: "Layer 5 — Gates & Channels",
    items: [
      { title: "64 Gates", subtitle: "The fundamental energies of your design", layer: "gates", premium: true, count: "64 gates" },
      { title: "36 Channels", subtitle: "How centers connect and create your definition", layer: "channels", premium: true, count: "36 channels" },
    ],
  },
  {
    layer: "Layer 6 — Incarnation Cross",
    items: [
      { title: "192 Incarnation Crosses", subtitle: "Your life purpose theme", layer: "cross", premium: true, count: "192 crosses" },
    ],
  },
  {
    layer: "Layer 7 — Variables & PHS",
    items: [
      { title: "Variables", subtitle: "Digestion, environment, perspective, awareness", layer: "variables", premium: true },
    ],
  },
];

export default function ExplorePage() {
  const { isPremium } = useAuth();
  const [search, setSearch] = useState("");

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <p className="label-luxury mb-2">Content Library</p>
          <h1 className="font-[family-name:var(--font-playfair)] italic text-3xl">Explore</h1>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search types, authorities, gates..."
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-gold)] transition"
          />
        </div>

        {/* Content Sections */}
        <div className="space-y-10">
          {CONTENT_SECTIONS.map((section) => (
            <div key={section.layer}>
              <p className="label-luxury mb-4">{section.layer}</p>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div
                    key={item.title}
                    className="card flex items-center gap-4 hover:border-[var(--accent-gold)]/30 transition cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-[11px] text-[var(--text-tertiary)] truncate">{item.subtitle}</p>
                    </div>
                    {item.count && (
                      <span className="text-[10px] tracking-wider uppercase text-[var(--text-tertiary)] whitespace-nowrap">
                        {item.count}
                      </span>
                    )}
                    {item.premium && !isPremium && (
                      <Lock size={14} className="text-[var(--text-tertiary)] flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Relevant to My Chart filter */}
        <div className="mt-10 card text-center">
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            Want to see only content relevant to your chart?
          </p>
          <Link href="/my-design" className="text-sm font-medium text-[var(--accent-gold)]">
            View My Design &rarr;
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
