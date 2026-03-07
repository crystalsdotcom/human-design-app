"use client";

import { useState } from "react";
import { ChartData, streamInterpretation } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import Bodygraph from "@/components/Bodygraph";
import DecisionSimulator from "@/components/DecisionSimulator";
import { useAuth } from "@/lib/AuthContext";

interface Props {
  chart: ChartData;
  onReset: () => void;
  onUpgradeNeeded: () => void;
}

// ── Type configuration — orb colors + full-page atmosphere ───────────────────
const TYPE_CONFIG: Record<string, {
  r1: string; r2: string; r3: string; r4: string; glow: string;
  // Page atmosphere
  heroBg: string;        // hero section background gradient
  accent: string;        // accent text/border color (hex)
  tagline: string;       // one-line essence for this type
}> = {
  "Generator": {
    r1:"rgba(253,186,116,0.90)", r2:"rgba(252,165,165,0.70)", r3:"rgba(254,202,202,0.45)", r4:"rgba(255,237,213,0.28)", glow:"rgba(253,186,116,0.22)",
    heroBg: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(253,186,116,0.13) 0%, rgba(254,215,170,0.06) 55%, transparent 80%)",
    accent: "#D97706",
    tagline: "You are the life force.",
  },
  "Manifesting Generator": {
    r1:"rgba(94,234,212,0.85)", r2:"rgba(52,211,153,0.65)", r3:"rgba(167,243,208,0.42)", r4:"rgba(204,251,241,0.26)", glow:"rgba(52,211,153,0.20)",
    heroBg: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(52,211,153,0.12) 0%, rgba(167,243,208,0.06) 55%, transparent 80%)",
    accent: "#059669",
    tagline: "You contain multitudes.",
  },
  "Projector": {
    r1:"rgba(196,181,253,0.90)", r2:"rgba(167,139,250,0.68)", r3:"rgba(147,197,253,0.45)", r4:"rgba(237,233,254,0.28)", glow:"rgba(167,139,250,0.20)",
    heroBg: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(167,139,250,0.12) 0%, rgba(196,181,253,0.06) 55%, transparent 80%)",
    accent: "#7C3AED",
    tagline: "You see what others miss.",
  },
  "Manifestor": {
    r1:"rgba(253,164,175,0.90)", r2:"rgba(251,113,133,0.68)", r3:"rgba(254,202,202,0.45)", r4:"rgba(255,228,230,0.28)", glow:"rgba(251,113,133,0.20)",
    heroBg: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(251,113,133,0.12) 0%, rgba(254,202,202,0.06) 55%, transparent 80%)",
    accent: "#BE185D",
    tagline: "You move first.",
  },
  "Reflector": {
    r1:"rgba(186,230,253,0.90)", r2:"rgba(147,197,253,0.68)", r3:"rgba(196,181,253,0.45)", r4:"rgba(224,242,254,0.28)", glow:"rgba(147,197,253,0.20)",
    heroBg: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(147,197,253,0.12) 0%, rgba(186,230,253,0.06) 55%, transparent 80%)",
    accent: "#0284C7",
    tagline: "You are the rarest mirror.",
  },
};

// ── Profile poetic names ──────────────────────────────────────────────────────
const PROFILE_NAMES: Record<string, [string, string]> = {
  "1/3": ["Investigator", "Martyr"],   "1/4": ["Investigator", "Opportunist"],
  "2/4": ["Hermit", "Opportunist"],    "2/5": ["Hermit", "Heretic"],
  "3/5": ["Martyr", "Heretic"],        "3/6": ["Martyr", "Role Model"],
  "4/6": ["Opportunist", "Role Model"],"4/1": ["Opportunist", "Investigator"],
  "5/1": ["Heretic", "Investigator"],  "5/2": ["Heretic", "Hermit"],
  "6/2": ["Role Model", "Hermit"],     "6/3": ["Role Model", "Martyr"],
};

// ── Authority poetic names ────────────────────────────────────────────────────
const AUTHORITY_NAMES: Record<string, string> = {
  "Sacral":         "Gut Knowing",
  "Emotional":      "Emotional Wave",
  "Splenic":        "Instinct",
  "Ego":            "Will Power",
  "Self-Projected": "Authentic Voice",
  "Mental":         "Environmental Wisdom",
  "Lunar":          "Lunar Clarity",
};

// ── Strategy mantras ──────────────────────────────────────────────────────────
const STRATEGY_MANTRA: Record<string, string> = {
  "Generator":             "Wait to respond",
  "Manifesting Generator": "Feel the pull, then move",
  "Projector":             "Wait for the invitation",
  "Manifestor":            "Inform before acting",
  "Reflector":             "Let the moon decide",
};

// ── Definition poetic ─────────────────────────────────────────────────────────
const DEFINITION_SHORT: Record<string, string> = {
  "Single Definition":  "Always yourself",
  "Split Definition":   "Energised by others",
  "Triple Split":       "Fluid & adaptable",
  "Quadruple Split":    "Beautifully complex",
  "No Definition":      "Pure reflection",
};

const CENTER_LABELS: Record<string, string> = {
  head: "Head", ajna: "Ajna", throat: "Throat", g: "G Center",
  heart: "Heart", sacral: "Sacral", solar_plexus: "Solar Plexus",
  spleen: "Spleen", root: "Root",
};
const ALL_CENTERS = ["head","ajna","throat","g","heart","sacral","solar_plexus","spleen","root"];

export default function ChartResult({ chart, onReset, onUpgradeNeeded }: Props) {
  const [interpretation, setInterpretation] = useState("");
  const [streaming, setStreaming]           = useState(false);
  const [depth, setDepth]                   = useState<"quick" | "standard" | "deep">("standard");
  const [question, setQuestion]             = useState("");
  const [showDetails, setShowDetails]       = useState(false);
  const [activeTab, setActiveTab]           = useState<"reading" | "simulator">("reading");
  const { isSubscribed, configured }        = useAuth();

  const hasAccess  = !configured || isSubscribed;
  const cfg        = TYPE_CONFIG[chart.type_] ?? TYPE_CONFIG["Projector"];
  const profileKey = `${chart.profile[0]}/${chart.profile[1]}`;
  const [pName1, pName2] = PROFILE_NAMES[profileKey] ?? ["—", "—"];

  // Jaakko Mattila-style concentric aura orb — radial gradient with soft rings
  const orbStops = [
    "circle at 50% 50%",
    "rgba(255,255,255,1) 0%",
    "rgba(255,255,255,0.97) 8%",
    `${cfg.r1} 12%`,
    `${cfg.r1} 19%`,
    "rgba(255,255,255,0.94) 22%",
    `${cfg.r2} 26%`,
    `${cfg.r2} 32%`,
    "rgba(255,255,255,0.90) 35%",
    `${cfg.r3} 39%`,
    `${cfg.r3} 45%`,
    "rgba(255,255,255,0.84) 48%",
    `${cfg.r4} 52%`,
    `${cfg.r4} 58%`,
    "rgba(255,255,255,0) 65%",
  ].join(", ");

  async function fetchInterpretation() {
    setInterpretation("");
    setStreaming(true);
    await streamInterpretation(
      chart, question || undefined, depth,
      (chunk) => setInterpretation((prev) => prev + chunk),
      () => setStreaming(false)
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFAF5]">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center text-center px-6 pt-24 pb-24 overflow-hidden"
        style={{ background: `${cfg.heroBg}, #FDFAF5` }}
      >

        {/* Back */}
        <button
          onClick={onReset}
          className="absolute top-8 left-8 label-luxury text-[#1A1714]/28 hover:text-[#1A1714]/65 transition-colors"
        >
          ← back
        </button>

        {/* Name above orb */}
        {chart.name && (
          <p className="label-luxury mb-10 mt-2">{chart.name}</p>
        )}

        {/* ── PORTAL ORB ─ the visual centrepiece ─────────────────────── */}
        <div className="relative mb-14">
          {/* Wide outer atmospheric halo */}
          <div
            className="absolute -inset-20 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 68%)` }}
          />
          {/* Aura orb — concentric rings via radial-gradient, softened with blur */}
          <div
            className="w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] rounded-full"
            style={{
              background: `radial-gradient(${orbStops})`,
              filter: "blur(5px)",
            }}
          />
        </div>

        {/* Type name — huge Cormorant italic, the statement */}
        <h1 className="font-display italic text-7xl sm:text-8xl lg:text-9xl text-[#1A1714] leading-tight tracking-tight mb-3">
          {chart.type_}
        </h1>

        {/* Type tagline — the essence in one line */}
        <p className="font-display italic text-xl mb-5" style={{ color: cfg.accent, opacity: 0.75 }}>
          {cfg.tagline}
        </p>

        {/* Profile — whisper-light */}
        <p className="text-[10px] text-[#1A1714]/30 tracking-[0.28em] uppercase mb-16">
          {chart.profile[0]} / {chart.profile[1]}&ensp;·&ensp;The {pName1} &amp; The {pName2}
        </p>

        {/* Three pillars */}
        <div className="flex items-center justify-center gap-8 sm:gap-16 flex-wrap">
          <div className="text-center">
            <p className="label-luxury mb-2">Authority</p>
            <p className="text-[13px] text-[#1A1714]/52 tracking-wide">
              {AUTHORITY_NAMES[chart.authority] ?? chart.authority}
            </p>
          </div>
          <div className="hidden sm:block w-px h-6 bg-[#1A1714]/10 self-center" />
          <div className="text-center">
            <p className="label-luxury mb-2">Strategy</p>
            <p className="text-[13px] text-[#1A1714]/52 tracking-wide">
              {STRATEGY_MANTRA[chart.type_]}
            </p>
          </div>
          <div className="hidden sm:block w-px h-6 bg-[#1A1714]/10 self-center" />
          <div className="text-center">
            <p className="label-luxury mb-2">Definition</p>
            <p className="text-[13px] text-[#1A1714]/52 tracking-wide">
              {DEFINITION_SHORT[chart.definition] ?? chart.definition}
            </p>
          </div>
        </div>

        {/* Channels — minimal pills, only shown if any */}
        {chart.defined_channels.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-12 max-w-lg">
            {chart.defined_channels.map((ch) => (
              <span
                key={ch}
                className="text-[9px] tracking-[0.18em] uppercase border border-[#1A1714]/10 text-[#1A1714]/28 px-3 py-1.5 rounded-full"
              >
                {ch}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── FULL-WIDTH RULE ───────────────────────────────────────────────── */}
      <div className="w-full h-px bg-[#1A1714]/6" />

      {/* ── BODYGRAPH — gallery object ────────────────────────────────────── */}
      <section className="py-24 px-4 bg-[#F8F5F0]">
        <p className="label-luxury text-center mb-14">Your Blueprint</p>
        <div className="max-w-[280px] mx-auto">
          <Bodygraph chart={chart} />
        </div>
      </section>

      {/* ── FULL-WIDTH RULE ───────────────────────────────────────────────── */}
      <div className="w-full h-px bg-[#1A1714]/6" />

      {/* ── AI READING ───────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 py-20 pb-24">

        {!hasAccess ? (
          /* ── PAYWALL — teaser + gate ─────────────────────────────────── */
          <div>
            {/* Label */}
            <p className="text-[9px] tracking-[0.42em] uppercase text-[#1A1714]/25 mb-10 text-center">
              Your Reading
            </p>

            {/* Blurred teaser — sample text to create desire */}
            <div className="relative mb-14 overflow-hidden">
              {/* Sample reading copy, blurred */}
              <div
                className="pointer-events-none select-none space-y-5"
                style={{ filter: "blur(6px)", opacity: 0.45 }}
                aria-hidden="true"
              >
                <h2 className="font-display italic text-4xl text-[#1A1714] leading-tight">
                  You are built to move when life meets you.
                </h2>
                <p className="text-[15px] text-[#1A1714]/58 leading-[1.92]">
                  As a {chart.type_}, your energy does not initiate — it responds. This is not passivity. It is
                  precision. Every time you have overridden this and forced action from sheer will, the friction
                  you felt was not failure. It was your design telling you the timing was off.
                </p>
                <p className="text-[15px] text-[#1A1714]/58 leading-[1.92]">
                  Your {chart.profile[0]}/{chart.profile[1]} profile is the lens through which your life
                  experience is organised. It shapes how others see you before you say a word, and how
                  you are meant to learn — through direct contact with what does not work.
                </p>
                <p className="text-[15px] text-[#1A1714]/58 leading-[1.92]">
                  The authority in your chart is not a concept. It is a physical signal, available to
                  you right now. Learning to trust it will feel counterintuitive at first — because you
                  were conditioned to override it.
                </p>
              </div>

              {/* Gradient fade over the blurred text — bottom fade to white */}
              <div
                className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, transparent, #FAF9F6)" }}
              />
            </div>

            {/* Gate UI */}
            <div className="text-center space-y-7">
              <div>
                <h3 className="font-display italic text-[2.4rem] leading-tight text-[#1A1714] mb-3">
                  Your reading is ready.
                </h3>
                <p className="text-[13px] text-[#1A1714]/40 leading-relaxed max-w-xs mx-auto">
                  Unlock your full personalised AI interpretation — your type, authority, channels,
                  and what it all means for how you move through life.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={onUpgradeNeeded}
                  className="border border-[#1A1714] text-[#1A1714] hover:bg-[#1A1714] hover:text-[#FAF9F6] px-12 py-4 text-[10px] font-medium tracking-[0.26em] uppercase transition-all duration-300"
                >
                  Illuminate — $14 / mo
                </button>
              </div>

              <p className="text-[9px] text-[#1A1714]/20 tracking-[0.2em] uppercase">
                Cancel anytime · Secured by Stripe
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Tab strip */}
            <div className="flex gap-10 border-b border-[#1A1714]/8 mb-14">
              {(["reading", "simulator"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`label-luxury pb-5 transition-colors border-b-[1.5px] -mb-px ${
                    activeTab === tab
                      ? "border-[#1A1714] text-[#1A1714]/62"
                      : "border-transparent text-[#1A1714]/20 hover:text-[#1A1714]/42"
                  }`}
                >
                  {tab === "reading" ? "AI Reading" : "Decision Simulator"}
                </button>
              ))}
            </div>

            {/* ── AI Reading tab ── */}
            {activeTab === "reading" && (
              <div>
                {!interpretation && !streaming && (
                  <div className="text-center py-4 space-y-12">
                    <div>
                      <p className="font-display italic text-6xl sm:text-7xl text-[#1A1714] leading-tight mb-3">
                        Your Reading
                      </p>
                      <p className="text-[10px] text-[#1A1714]/30 tracking-[0.3em] uppercase">
                        A personalised interpretation of your design
                      </p>
                    </div>

                    {/* Depth selector */}
                    <div className="flex gap-3 justify-center">
                      {(["quick", "standard", "deep"] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDepth(d)}
                          className={`text-[9px] tracking-[0.24em] uppercase px-5 py-3 border transition-all duration-200 ${
                            depth === d
                              ? "border-[#1A1714] bg-[#1A1714] text-[#FAF9F6]"
                              : "border-[#1A1714]/12 text-[#1A1714]/30 hover:border-[#1A1714]/32 hover:text-[#1A1714]/55"
                          }`}
                        >
                          {d === "quick" ? "Essence" : d === "standard" ? "Full" : "Deep Dive"}
                        </button>
                      ))}
                    </div>

                    <input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask something specific… or leave blank for a full reading"
                      className="input-line text-sm w-full max-w-md mx-auto block"
                    />

                    <button
                      onClick={fetchInterpretation}
                      className="border border-[#1A1714] text-[#1A1714] hover:bg-[#1A1714] hover:text-[#FAF9F6] px-12 py-4 text-[10px] font-medium tracking-[0.26em] uppercase transition-all duration-300"
                    >
                      Receive your reading →
                    </button>
                  </div>
                )}

                {(interpretation || streaming) && (
                  <div>
                    <div className="prose prose-base max-w-none
                      [&_h2]:font-display [&_h2]:italic [&_h2]:text-4xl [&_h2]:font-normal [&_h2]:text-[#1A1714] [&_h2]:mt-14 [&_h2]:mb-4 [&_h2]:leading-tight
                      [&_h3]:text-[10px] [&_h3]:tracking-[0.26em] [&_h3]:uppercase [&_h3]:font-medium [&_h3]:text-[#1A1714]/35 [&_h3]:mt-10 [&_h3]:mb-3
                      [&_strong]:font-semibold [&_strong]:text-[#1A1714]
                      [&_p]:text-[#1A1714]/58 [&_p]:leading-[1.92] [&_p]:text-[15px]
                      [&_ul]:text-[#1A1714]/55 [&_li]:leading-relaxed [&_li]:text-[15px]">
                      <ReactMarkdown>{interpretation}</ReactMarkdown>
                    </div>
                    {streaming && (
                      <span className="inline-block w-[2px] h-5 bg-[#1A1714]/32 animate-pulse rounded-full ml-1 mt-2" />
                    )}
                    {!streaming && (
                      <div className="mt-14 pt-8 border-t border-[#1A1714]/7 flex gap-6 flex-wrap">
                        <button
                          onClick={() => { setInterpretation(""); setQuestion(""); }}
                          className="label-luxury text-[#1A1714]/28 hover:text-[#1A1714]/62 transition-colors"
                        >
                          ← Start over
                        </button>
                        <button
                          onClick={fetchInterpretation}
                          className="label-luxury text-[#1A1714]/28 hover:text-[#1A1714]/62 transition-colors ml-auto"
                        >
                          Read again ↺
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Decision Simulator tab ── */}
            {activeTab === "simulator" && <DecisionSimulator chart={chart} />}
          </>
        )}
      </section>

      {/* ── ACTIVATION MAP (collapsible) ──────────────────────────────────── */}
      <div className="border-t border-[#1A1714]/7">
        <div className="max-w-2xl mx-auto px-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between py-7 label-luxury text-[#1A1714]/22 hover:text-[#1A1714]/48 transition-colors"
          >
            <span>Activation Map</span>
            <span className="text-sm">{showDetails ? "↑" : "↓"}</span>
          </button>

          {showDetails && (
            <div className="pb-16 space-y-12">

              {/* Gate activations */}
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <p className="label-luxury mb-6 text-[#1A1714]/32">Personality · Conscious</p>
                  <div className="space-y-3">
                    {Object.entries(chart.personality).map(([planet, data]) => (
                      <div key={planet} className="flex justify-between items-center">
                        <span className="text-[11px] text-[#1A1714]/36 capitalize">{planet.replace(/_/g, " ")}</span>
                        <span className="text-[10px] font-mono text-[#1A1714]/48 tracking-wider">
                          {data.gate}.{data.line}{data.retrograde ? " ℞" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label-luxury mb-6 text-[#7C3AED]/32">Design · Unconscious</p>
                  <div className="space-y-3">
                    {Object.entries(chart.design).map(([planet, data]) => (
                      <div key={planet} className="flex justify-between items-center">
                        <span className="text-[11px] text-[#1A1714]/36 capitalize">{planet.replace(/_/g, " ")}</span>
                        <span className="text-[10px] font-mono text-[#7C3AED]/42 tracking-wider">
                          {data.gate}.{data.line}{data.retrograde ? " ℞" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Centers */}
              <div>
                <p className="label-luxury mb-6">Energy Centers</p>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_CENTERS.map((center) => {
                    const isDefined = chart.defined_centers.includes(center);
                    return (
                      <div
                        key={center}
                        className={`text-center py-4 px-2 border transition ${
                          isDefined
                            ? "border-[#1A1714]/22 text-[#1A1714]"
                            : "border-[#1A1714]/7 text-[#1A1714]/16"
                        }`}
                      >
                        <p className="text-[9px] tracking-[0.2em] uppercase">{CENTER_LABELS[center]}</p>
                        <p className={`text-[8px] mt-1.5 tracking-widest ${isDefined ? "text-[#1A1714]/35" : "text-[#1A1714]/14"}`}>
                          {isDefined ? "defined" : "open"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Channels */}
              {chart.defined_channels.length > 0 && (
                <div>
                  <p className="label-luxury mb-6">Defined Channels</p>
                  <div className="flex flex-wrap gap-2">
                    {chart.defined_channels.map((ch) => (
                      <span key={ch} className="text-[9px] tracking-[0.18em] uppercase border border-[#1A1714]/10 text-[#1A1714]/36 px-3 py-1.5">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
