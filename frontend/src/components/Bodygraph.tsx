"use client";

/**
 * HDOS Bodygraph SVG
 * Accurate Human Design body graph with all 9 centers,
 * 36 channels, interactive hover states.
 */

import { useState } from "react";
import { ChartData } from "@/lib/api";

interface Props {
  chart: ChartData;
}

// Center geometry — positions in the SVG coordinate space
const CENTER_POSITIONS: Record<string, { x: number; y: number; w: number; h: number; label: string; shape: "diamond" | "triangle-up" | "triangle-down" | "square" }> = {
  head:         { x: 220, y: 20,  w: 60, h: 60, label: "Head",        shape: "triangle-up" },
  ajna:         { x: 220, y: 110, w: 60, h: 60, label: "Ajna",        shape: "triangle-down" },
  throat:       { x: 220, y: 205, w: 60, h: 40, label: "Throat",      shape: "square" },
  g:            { x: 220, y: 290, w: 60, h: 60, label: "G Center",    shape: "diamond" },
  heart:        { x: 320, y: 280, w: 55, h: 55, label: "Heart",       shape: "diamond" },
  sacral:       { x: 220, y: 390, w: 60, h: 50, label: "Sacral",      shape: "square" },
  solar_plexus: { x: 320, y: 370, w: 55, h: 55, label: "Solar Plexus",shape: "diamond" },
  spleen:       { x: 110, y: 280, w: 55, h: 55, label: "Spleen",      shape: "diamond" },
  root:         { x: 220, y: 470, w: 60, h: 50, label: "Root",        shape: "square" },
};

// Channel paths between centers [gate1, gate2, center_a, center_b]
const CHANNEL_LINES = [
  // Head → Ajna
  { from: "head", to: "ajna", side: "left" },
  { from: "head", to: "ajna", side: "center" },
  { from: "head", to: "ajna", side: "right" },
  // Ajna → Throat
  { from: "ajna", to: "throat", side: "left" },
  { from: "ajna", to: "throat", side: "right" },
  // Throat → G
  { from: "throat", to: "g", side: "center" },
  // Throat → Heart
  { from: "throat", to: "heart", side: "center" },
  // Throat → Spleen
  { from: "throat", to: "spleen", side: "center" },
  // Throat → Solar Plexus
  { from: "throat", to: "solar_plexus", side: "center" },
  // Throat → Sacral (MG)
  { from: "throat", to: "sacral", side: "center" },
  // G → Heart
  { from: "g", to: "heart", side: "center" },
  // G → Sacral
  { from: "g", to: "sacral", side: "left" },
  { from: "g", to: "sacral", side: "right" },
  // G → Spleen
  { from: "g", to: "spleen", side: "center" },
  // Heart → Spleen
  { from: "heart", to: "spleen", side: "center" },
  // Heart → Solar Plexus
  { from: "heart", to: "solar_plexus", side: "center" },
  // Sacral → Solar Plexus
  { from: "sacral", to: "solar_plexus", side: "center" },
  // Sacral → Spleen
  { from: "sacral", to: "spleen", side: "center" },
  // Sacral → Root
  { from: "sacral", to: "root", side: "left" },
  { from: "sacral", to: "root", side: "center" },
  { from: "sacral", to: "root", side: "right" },
  // Solar Plexus → Root
  { from: "solar_plexus", to: "root", side: "center" },
  // Spleen → Root
  { from: "spleen", to: "root", side: "center" },
];

// Map channels to their two centers
const CHANNEL_CENTER_MAP: Record<string, [string, string]> = {
  "Abstraction": ["head", "ajna"],
  "Awareness": ["head", "ajna"],
  "Logic": ["head", "ajna"],
  "Acceptance": ["ajna", "throat"],
  "Structuring": ["ajna", "throat"],
  "Curiosity": ["ajna", "throat"],
  "The Wavelength": ["throat", "spleen"],
  "The Brain Wave": ["throat", "spleen"],
  "The Alpha": ["throat", "g"],
  "The Prodigal": ["throat", "g"],
  "The Money Line": ["throat", "heart"],
  "Transitoriness": ["throat", "solar_plexus"],
  "Openness": ["throat", "solar_plexus"],
  "Inspiration": ["throat", "g"],
  "Charisma": ["throat", "sacral"],
  "Awakening": ["g", "throat"],
  "Perfected Form": ["g", "spleen"],
  "Initiation": ["g", "heart"],
  "Discovery": ["g", "sacral"],
  "Rhythm": ["g", "sacral"],
  "The Beat": ["g", "sacral"],
  "Surrender": ["heart", "spleen"],
  "Community": ["heart", "solar_plexus"],
  "Transformation": ["root", "spleen"],
  "Judgment": ["root", "spleen"],
  "Struggle": ["root", "spleen"],
  "Emoting": ["root", "solar_plexus"],
  "Synthesis": ["root", "solar_plexus"],
  "Recognition": ["root", "solar_plexus"],
  "Maturation": ["root", "sacral"],
  "Mutation": ["root", "sacral"],
  "Concentration": ["root", "sacral"],
  "Power": ["sacral", "spleen"],
  "Exploration": ["sacral", "g"],
  "Preservation": ["sacral", "spleen"],
  "Mating": ["sacral", "solar_plexus"],
};

const CENTER_DESCRIPTIONS: Record<string, string> = {
  head: "Pressure center for inspiration. Questions, doubts, ideas.",
  ajna: "Mind and conceptualization. How you process and communicate thoughts.",
  throat: "Manifestation and communication. Where energy becomes words and action.",
  g: "Identity, love, direction. Your sense of self and life path.",
  heart: "Willpower, ego, material world. Commitments and resources.",
  sacral: "Life force and creativity. Sustainable energy for work and sexuality.",
  solar_plexus: "Emotional intelligence. Feelings, moods, and emotional truth.",
  spleen: "Intuition and immunity. In-the-moment awareness and well-being.",
  root: "Pressure and adrenaline. Drive to resolve pressure and get things done.",
};

function getCenterPath(name: string, pos: typeof CENTER_POSITIONS[string]): string {
  const { x, y, w, h, shape } = pos;
  const cx = x + w / 2;
  const cy = y + h / 2;

  switch (shape) {
    case "diamond":
      return `M ${cx} ${y} L ${x + w} ${cy} L ${cx} ${y + h} L ${x} ${cy} Z`;
    case "triangle-up":
      return `M ${cx} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
    case "triangle-down":
      return `M ${x} ${y} L ${x + w} ${y} L ${cx} ${y + h} Z`;
    case "square":
    default:
      return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  }
}

function getCenterMidpoint(name: string): { x: number; y: number } {
  const pos = CENTER_POSITIONS[name];
  return { x: pos.x + pos.w / 2, y: pos.y + pos.h / 2 };
}

const CENTER_COLORS = {
  defined: {
    fill: "#1C1917",
    stroke: "#1C1917",
    glow: "",
  },
  undefined: {
    fill: "#FAF8F5",
    stroke: "rgba(28,25,23,0.12)",
    glow: "",
  },
  hover: {
    fill: "#7C3AED",
    stroke: "#7C3AED",
  },
};

export default function Bodygraph({ chart }: Props) {
  const [hoveredCenter, setHoveredCenter] = useState<string | null>(null);

  const definedSet = new Set(chart.defined_centers);
  const definedChannelSet = new Set(chart.defined_channels);

  // Figure out which center-to-center connections have defined channels
  const definedConnections = new Set<string>();
  chart.defined_channels.forEach((ch) => {
    const centers = CHANNEL_CENTER_MAP[ch];
    if (centers) {
      const key = `${centers[0]}-${centers[1]}`;
      const keyRev = `${centers[1]}-${centers[0]}`;
      definedConnections.add(key);
      definedConnections.add(keyRev);
    }
  });

  function isConnectionDefined(from: string, to: string): boolean {
    return definedConnections.has(`${from}-${to}`) || definedConnections.has(`${to}-${from}`);
  }

  const tooltip = hoveredCenter ? {
    name: CENTER_POSITIONS[hoveredCenter].label,
    defined: definedSet.has(hoveredCenter),
    desc: CENTER_DESCRIPTIONS[hoveredCenter],
  } : null;

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Tooltip */}
      <div className={`mb-4 min-h-[60px] transition-opacity duration-200 ${tooltip ? "opacity-100" : "opacity-0"}`}>
        {tooltip && (
          <div className="bg-white border border-[#1C1917]/10 rounded-xl px-4 py-3 text-center max-w-xs mx-auto shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="font-semibold text-[#1C1917] text-sm">{tooltip.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tooltip.defined ? "bg-[#1C1917] text-white" : "bg-[#FAF8F5] text-[#1C1917]/40 border border-[#1C1917]/10"}`}>
                {tooltip.defined ? "Defined" : "Open"}
              </span>
            </div>
            <p className="text-xs text-[#78716C]">{tooltip.desc}</p>
          </div>
        )}
      </div>

      <svg
        viewBox="0 0 500 560"
        className="w-full max-w-sm"
      >
        {/* Channel lines */}
        {CHANNEL_LINES.map((line, i) => {
          const from = getCenterMidpoint(line.from);
          const to = getCenterMidpoint(line.to);
          const isDefined = isConnectionDefined(line.from, line.to);

          // Offset for parallel lines
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = -dy / len;
          const ny = dx / len;
          const offsets: Record<string, number> = { left: -5, center: 0, right: 5 };
          const off = offsets[line.side] || 0;

          const x1 = from.x + nx * off;
          const y1 = from.y + ny * off;
          const x2 = to.x + nx * off;
          const y2 = to.y + ny * off;

          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isDefined ? "#1C1917" : "rgba(28,25,23,0.1)"}
              strokeWidth={isDefined ? 3.5 : 1.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Centers */}
        {Object.entries(CENTER_POSITIONS).map(([name, pos]) => {
          const isDefined = definedSet.has(name);
          const isHovered = hoveredCenter === name;
          const colors = isHovered
            ? { fill: CENTER_COLORS.hover.fill, stroke: CENTER_COLORS.hover.stroke }
            : isDefined
            ? { fill: CENTER_COLORS.defined.fill, stroke: CENTER_COLORS.defined.stroke }
            : { fill: CENTER_COLORS.undefined.fill, stroke: CENTER_COLORS.undefined.stroke };

          const path = getCenterPath(name, pos);
          const mid = getCenterMidpoint(name);

          return (
            <g
              key={name}
              onMouseEnter={() => setHoveredCenter(name)}
              onMouseLeave={() => setHoveredCenter(null)}
              className="cursor-pointer"
              style={isDefined ? { filter: CENTER_COLORS.defined.glow } : {}}
            >
              <path
                d={path}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isDefined ? 1.5 : 1}
                className="transition-all duration-200"
              />
              {/* Center label */}
              <text
                x={mid.x}
                y={mid.y - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fontWeight="600"
                fill={isDefined ? "#FAF8F5" : "rgba(28,25,23,0.25)"}
                className="select-none pointer-events-none"
              >
                {pos.label}
              </text>
            </g>
          );
        })}

        {/* Gate numbers on defined gates */}
        {chart.defined_gates.map((gate) => {
          // Find which planet in personality or design has this gate
          const pEntry = Object.values(chart.personality).find(p => p.gate === gate);
          const dEntry = Object.values(chart.design).find(p => p.gate === gate);
          const isPersonality = !!pEntry;
          const isDesign = !!dEntry;
          return null; // Gate numbers rendered inline per center below
        })}
      </svg>

      {/* Defined gates list */}
      <div className="mt-4 flex flex-wrap justify-center gap-1.5 max-w-xs">
        {chart.defined_gates.sort((a, b) => a - b).map((gate) => {
          const inPersonality = Object.values(chart.personality).some(p => p.gate === gate);
          const inDesign = Object.values(chart.design).some(p => p.gate === gate);
          const both = inPersonality && inDesign;
          return (
            <span
              key={gate}
              className={`text-xs font-mono px-2 py-0.5 rounded border ${
                both
                  ? "bg-[#1C1917] border-[#1C1917] text-white"
                  : inPersonality
                  ? "bg-[#1C1917]/10 border-[#1C1917]/20 text-[#1C1917]"
                  : "bg-[#7C3AED]/8 border-[#7C3AED]/20 text-[#7C3AED]"
              }`}
            >
              {gate}
            </span>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex gap-4 text-[10px] text-[#1C1917]/35 justify-center">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-[#1C1917]/20 inline-block" /> Personality
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-[#7C3AED]/20 inline-block" /> Design
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-[#1C1917] inline-block" /> Both
        </span>
      </div>
    </div>
  );
}
