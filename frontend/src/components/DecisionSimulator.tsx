"use client";

import { useState } from "react";
import { ChartData, streamDecisionSimulation } from "@/lib/api";
import ReactMarkdown from "react-markdown";

interface Props {
  chart: ChartData;
}

const AUTHORITY_ICONS: Record<string, string> = {
  "Sacral": "◉",
  "Emotional": "〜",
  "Splenic": "⚡",
  "Ego": "♡",
  "Self-Projected": "◈",
  "Mental": "◇",
  "Lunar": "☽",
};

const AUTHORITY_HINT: Record<string, string> = {
  "Sacral": "Your gut responds instantly — trust the uh-huh or unh-uh before your mind speaks.",
  "Emotional": "Wait through the wave. How does this feel on a high? On a low? Clarity emerges over time.",
  "Splenic": "Your spleen spoke once, in the first instant. Did you catch it?",
  "Ego": "Does your will truly back this? Not should — want.",
  "Self-Projected": "Talk it through with someone you trust. Listen to what you hear yourself say.",
  "Mental": "Gather trusted perspectives. What do the wise people in your life reflect back?",
  "Lunar": "Give it 28 days. Sample this across the full lunar cycle.",
};

const EXAMPLE_DECISIONS = [
  "Should I take this new job offer?",
  "Is this relationship right for me?",
  "Should I start my own business?",
  "Should I move to a new city?",
  "Is this the right time to invest?",
];

export default function DecisionSimulator({ chart }: Props) {
  const [decision, setDecision] = useState("");
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [submitted, setSubmitted] = useState("");

  const authority = chart.authority;
  const icon = AUTHORITY_ICONS[authority] || "◎";
  const hint = AUTHORITY_HINT[authority] || "";

  async function runSimulation() {
    if (!decision.trim() || streaming) return;
    setResponse("");
    setStreaming(true);
    setSubmitted(decision);
    await streamDecisionSimulation(
      chart,
      decision,
      (chunk) => setResponse((prev) => prev + chunk),
      () => setStreaming(false)
    );
  }

  function reset() {
    setDecision("");
    setResponse("");
    setSubmitted("");
  }

  return (
    <div className="space-y-5">

      {/* Authority badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] text-lg">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold text-[#1C1917]">{authority} Authority</p>
          <p className="text-[11px] text-[#78716C] leading-relaxed max-w-sm">{hint}</p>
        </div>
      </div>

      {/* Input area */}
      {!response && (
        <div className="space-y-3">
          <textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="Describe a decision you're navigating right now..."
            rows={4}
            className="w-full bg-[#FAF8F5] border border-[#1C1917]/10 rounded-xl px-4 py-3 text-[#1C1917] placeholder-[#1C1917]/25 focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 transition text-sm resize-none"
          />

          {/* Example chips */}
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_DECISIONS.map((ex) => (
              <button
                key={ex}
                onClick={() => setDecision(ex)}
                className="text-[10px] px-2.5 py-1 rounded-full border border-[#1C1917]/10 text-[#1C1917]/40 hover:border-[#7C3AED]/30 hover:text-[#7C3AED] transition"
              >
                {ex}
              </button>
            ))}
          </div>

          <button
            onClick={runSimulation}
            disabled={!decision.trim() || streaming}
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl py-3.5 font-medium text-white transition-all text-sm"
          >
            Simulate with my Design →
          </button>
        </div>
      )}

      {/* Response */}
      {(response || streaming) && (
        <div className="space-y-4">
          {/* The decision being analyzed */}
          <div className="bg-[#FAF8F5] rounded-xl px-4 py-3 border border-[#1C1917]/8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#1C1917]/30 mb-1">Your situation</p>
            <p className="text-sm text-[#1C1917]/70 italic">"{submitted}"</p>
          </div>

          {/* Streaming response */}
          <div className="prose prose-sm max-w-none text-[#1C1917]/80 leading-relaxed
            [&_h2]:text-[#1C1917] [&_h2]:font-bold [&_h2]:text-base [&_h2]:mt-4 [&_h2]:mb-2
            [&_h3]:text-[#1C1917] [&_h3]:font-semibold [&_h3]:text-sm [&_h3]:mt-3 [&_h3]:mb-1
            [&_strong]:text-[#1C1917] [&_strong]:font-semibold
            [&_p]:text-[#44403C] [&_p]:leading-relaxed
            [&_ul]:text-[#44403C] [&_li]:leading-relaxed">
            <ReactMarkdown>{response}</ReactMarkdown>
            {streaming && (
              <span className="inline-block w-1.5 h-4 bg-[#7C3AED] animate-pulse rounded-sm ml-0.5" />
            )}
          </div>

          {/* Try another */}
          {!streaming && (
            <button
              onClick={reset}
              className="text-sm text-[#7C3AED] hover:text-[#6D28D9] transition font-medium"
            >
              ← Try another decision
            </button>
          )}
        </div>
      )}
    </div>
  );
}
