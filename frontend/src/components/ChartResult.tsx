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

// ── Type-specific atmospheric colours ────────────────────────────────────────
const TYPE_CONFIG: Record<string, { bg: string; blob1: string; blob2: string; blob3: string }> = {
  "Generator":            { bg: "from-amber-50 via-[#FAF8F5] to-rose-50",       blob1: "bg-amber-200/50",   blob2: "bg-rose-200/40",    blob3: "bg-orange-100/60" },
  "Manifesting Generator":{ bg: "from-teal-50 via-[#FAF8F5] to-emerald-50",    blob1: "bg-teal-200/50",    blob2: "bg-emerald-200/40", blob3: "bg-cyan-100/50"   },
  "Projector":            { bg: "from-violet-50 via-[#FAF8F5] to-indigo-50",    blob1: "bg-violet-200/50",  blob2: "bg-indigo-200/40",  blob3: "bg-purple-100/50" },
  "Manifestor":           { bg: "from-rose-50 via-[#FAF8F5] to-red-50",         blob1: "bg-rose-200/50",    blob2: "bg-red-200/40",     blob3: "bg-pink-100/50"   },
  "Reflector":            { bg: "from-sky-50 via-[#FAF8F5] to-slate-50",        blob1: "bg-sky-200/50",     blob2: "bg-slate-200/40",   blob3: "bg-blue-100/50"   },
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

// ── Definition short ──────────────────────────────────────────────────────────
const DEFINITION_SHORT: Record<string, string> = {
  "Single Definition":    "Always yourself",
  "Split Definition":     "Energised by others",
  "Triple Split":         "Fluid & adaptable",
  "Quadruple Split":      "Beautifully complex",
  "No Definition":        "Pure reflection",
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
    <div className="min-h-screen bg-[#F8F6F2]">

      {/* ── HERO: atmospheric gradient + Turrell orbs ───────────────────── */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${cfg.bg} flex flex-col items-center justify-center text-center px-6 py-24 min-h-[56vh]`}>

        {/* Glowing orbs — inspired by James Turrell light fields */}
        <div className={`absolute -top-20 left-1/4 w-[420px] h-[420px] rounded-full ${cfg.blob1} blur-[120px] pointer-events-none`} />
        <div className={`absolute -bottom-16 right-1/4 w-[380px] h-[380px] rounded-full ${cfg.blob2} blur-[110px] pointer-events-none`} />
        <div className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full ${cfg.blob3} blur-[90px] pointer-events-none`} />

        {/* Back */}
        <button
          onClick={onReset}
          className="absolute top-7 left-7 label-luxury text-[#1A1714]/35 hover:text-[#1A1714] transition-colors"
        >
          ← back
        </button>

        {/* Content */}
        <div className="relative z-10 max-w-xl">
          {chart.name && (
            <p className="label-luxury mb-5">{chart.name}</p>
          )}

          {/* Type — massive Cormorant italic */}
          <h1 className="font-display italic text-7xl sm:text-8xl text-[#1A1714] leading-none mb-4">
            {chart.type_}
          </h1>

          {/* Profile as poetic names */}
          <p className="text-sm text-[#1A1714]/40 tracking-[0.18em] uppercase mb-10">
            {chart.profile[0]} / {chart.profile[1]} &nbsp;·&nbsp; The {pName1} &amp; The {pName2}
          </p>

          {/* Three pillars */}
          <div className="flex items-start justify-center gap-6 sm:gap-10 text-center flex-wrap">
            <div>
              <p className="label-luxury mb-1.5">Authority</p>
              <p className="text-[13px] text-[#1A1714]/70">{AUTHORITY_NAMES[chart.authority] ?? chart.authority}</p>
            </div>
            <div className="w-px h-8 bg-[#1A1714]/10 self-center hidden sm:block" />
            <div>
              <p className="label-luxury mb-1.5">Strategy</p>
              <p className="text-[13px] text-[#1A1714]/70">{STRATEGY_MANTRA[chart.type_]}</p>
            </div>
            <div className="w-px h-8 bg-[#1A1714]/10 self-center hidden sm:block" />
            <div>
              <p className="label-luxury mb-1.5">Definition</p>
              <p className="text-[13px] text-[#1A1714]/70">{DEFINITION_SHORT[chart.definition] ?? chart.definition}</p>
            </div>
          </div>

          {/* Channels as soft pills */}
          {chart.defined_channels.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-8">
              {chart.defined_channels.map((ch) => (
                <span
                  key={ch}
                  className="text-[10px] tracking-widest uppercase border border-[#1A1714]/12 text-[#1A1714]/40 px-3 py-1.5 rounded-full"
                >
                  {ch}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── BODYGRAPH: floating, centred, minimal ─────────────────────────── */}
      <div className="max-w-[300px] mx-auto py-16 px-4">
        <Bodygraph chart={chart} />
      </div>

      {/* ── AI READING ────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-6 pb-16">

        {!hasAccess ? (
          /* Paywall */
          <div className="text-center border border-[#1A1714]/8 py-14 px-8">
            <p className="font-display italic text-5xl text-[#1A1714] mb-4">Your Reading</p>
            <p className="text-[13px] text-[#1A1714]/40 mb-8 max-w-xs mx-auto">
              Unlock a personalised AI interpretation and Decision Simulator.
            </p>
            <button
              onClick={onUpgradeNeeded}
              className="border border-[#1A1714] text-[#1A1714] hover:bg-[#1A1714] hover:text-[#F8F6F2] px-8 py-4 text-[11px] font-medium tracking-[0.22em] uppercase transition-all duration-300"
            >
              Unlock — $29 / mo
            </button>
          </div>
        ) : (
          <>
            {/* Tab strip */}
            <div className="flex gap-8 border-b border-[#1A1714]/8 mb-10">
              {(["reading", "simulator"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`label-luxury pb-4 transition-colors border-b-[1.5px] -mb-px ${
                    activeTab === tab
                      ? "border-[#1A1714] text-[#1A1714]/70"
                      : "border-transparent text-[#1A1714]/25 hover:text-[#1A1714]/50"
                  }`}
                >
                  {tab === "reading" ? "AI Reading" : "Decision Simulator"}
                </button>
              ))}
            </div>

            {/* ── AI Reading ── */}
            {activeTab === "reading" && (
              <div>
                {!interpretation && !streaming && (
                  <div className="text-center py-8 space-y-8">
                    <div>
                      <p className="font-display italic text-5xl text-[#1A1714] mb-2">Your Reading</p>
                      <p className="text-[13px] text-[#1A1714]/35 tracking-wide">A personalised interpretation of your design</p>
                    </div>

                    {/* Depth selector */}
                    <div className="flex gap-4 justify-center">
                      {(["quick", "standard", "deep"] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDepth(d)}
                          className={`text-[10px] tracking-widest uppercase px-5 py-2.5 border transition-all duration-200 ${
                            depth === d
                              ? "border-[#1A1714] bg-[#1A1714] text-[#F8F6F2]"
                              : "border-[#1A1714]/15 text-[#1A1714]/35 hover:border-[#1A1714]/40 hover:text-[#1A1714]/60"
                          }`}
                        >
                          {d === "quick" ? "Essence" : d === "standard" ? "Full" : "Deep Dive"}
                        </button>
                      ))}
                    </div>

                    {/* Optional question */}
                    <input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask something specific… or leave blank for a full reading"
                      className="input-line text-sm w-full max-w-md mx-auto block"
                    />

                    <button
                      onClick={fetchInterpretation}
                      className="border border-[#1A1714] text-[#1A1714] hover:bg-[#1A1714] hover:text-[#F8F6F2] px-10 py-4 text-[11px] font-medium tracking-[0.22em] uppercase transition-all duration-300"
                    >
                      Receive your reading →
                    </button>
                  </div>
                )}

                {(interpretation || streaming) && (
                  <div>
                    <div className="prose prose-base max-w-none
                      [&_h2]:font-display [&_h2]:italic [&_h2]:text-3xl [&_h2]:font-normal [&_h2]:text-[#1A1714] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:leading-tight
                      [&_h3]:text-[11px] [&_h3]:tracking-[0.2em] [&_h3]:uppercase [&_h3]:font-medium [&_h3]:text-[#1A1714]/40 [&_h3]:mt-8 [&_h3]:mb-2
                      [&_strong]:font-semibold [&_strong]:text-[#1A1714]
                      [&_p]:text-[#1A1714]/65 [&_p]:leading-[1.85] [&_p]:text-[15px]
                      [&_ul]:text-[#1A1714]/60 [&_li]:leading-relaxed [&_li]:text-[15px]">
                      <ReactMarkdown>{interpretation}</ReactMarkdown>
                    </div>
                    {streaming && (
                      <span className="inline-block w-[3px] h-5 bg-[#1A1714]/40 animate-pulse rounded-full ml-1 mt-2" />
                    )}
                    {!streaming && (
                      <div className="mt-10 pt-8 border-t border-[#1A1714]/8 flex gap-4 flex-wrap">
                        <button
                          onClick={() => { setInterpretation(""); setQuestion(""); }}
                          className="label-luxury text-[#1A1714]/35 hover:text-[#1A1714] transition-colors"
                        >
                          ← Start over
                        </button>
                        <button
                          onClick={fetchInterpretation}
                          className="label-luxury text-[#1A1714]/35 hover:text-[#1A1714] transition-colors ml-auto"
                        >
                          Read again ↺
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Decision Simulator ── */}
            {activeTab === "simulator" && (
              <DecisionSimulator chart={chart} />
            )}
          </>
        )}
      </div>

      {/* ── EXPANDABLE: raw activation data ───────────────────────────────── */}
      <div className="border-t border-[#1A1714]/8">
        <div className="max-w-2xl mx-auto px-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between py-6 label-luxury text-[#1A1714]/30 hover:text-[#1A1714]/55 transition-colors"
          >
            <span>Activation Map</span>
            <span className="text-base">{showDetails ? "↑" : "↓"}</span>
          </button>

          {showDetails && (
            <div className="pb-12 space-y-10">

              {/* Gate activations */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Personality */}
                <div>
                  <p className="label-luxury mb-5 text-[#1A1714]/40">Personality · Conscious</p>
                  <div className="space-y-2.5">
                    {Object.entries(chart.personality).map(([planet, data]) => (
                      <div key={planet} className="flex justify-between items-center">
                        <span className="text-[12px] text-[#1A1714]/40 capitalize">{planet.replace(/_/g, " ")}</span>
                        <span className="text-[11px] font-mono text-[#1A1714]/55 tracking-wider">
                          {data.gate}.{data.line}{data.retrograde ? " ℞" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Design */}
                <div>
                  <p className="label-luxury mb-5 text-[#7C3AED]/40">Design · Unconscious</p>
                  <div className="space-y-2.5">
                    {Object.entries(chart.design).map(([planet, data]) => (
                      <div key={planet} className="flex justify-between items-center">
                        <span className="text-[12px] text-[#1A1714]/40 capitalize">{planet.replace(/_/g, " ")}</span>
                        <span className="text-[11px] font-mono text-[#7C3AED]/50 tracking-wider">
                          {data.gate}.{data.line}{data.retrograde ? " ℞" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Centers */}
              <div>
                <p className="label-luxury mb-5">Energy Centers</p>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_CENTERS.map((center) => {
                    const isDefined = chart.defined_centers.includes(center);
                    return (
                      <div
                        key={center}
                        className={`text-center py-3 px-2 border transition ${
                          isDefined
                            ? "border-[#1A1714]/30 text-[#1A1714]"
                            : "border-[#1A1714]/8 text-[#1A1714]/20"
                        }`}
                      >
                        <p className="text-[10px] tracking-widest uppercase">{CENTER_LABELS[center]}</p>
                        <p className={`text-[9px] mt-1 tracking-wider ${isDefined ? "text-[#1A1714]/40" : "text-[#1A1714]/15"}`}>
                          {isDefined ? "defined" : "open"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Defined channels */}
              {chart.defined_channels.length > 0 && (
                <div>
                  <p className="label-luxury mb-5">Defined Channels</p>
                  <div className="flex flex-wrap gap-2">
                    {chart.defined_channels.map((ch) => (
                      <span key={ch} className="text-[10px] tracking-widest uppercase border border-[#1A1714]/12 text-[#1A1714]/40 px-3 py-1.5">
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
