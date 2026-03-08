"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/AuthContext";

const MOODS = [
  { value: 1, emoji: "&#128542;", label: "Rough" },
  { value: 2, emoji: "&#128533;", label: "Low" },
  { value: 3, emoji: "&#128528;", label: "Neutral" },
  { value: 4, emoji: "&#128578;", label: "Good" },
  { value: 5, emoji: "&#10024;", label: "Great" },
];

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function JournalPage() {
  const { profile } = useAuth();
  const [mood, setMood] = useState<number | null>(null);
  const [entry, setEntry] = useState("");
  const [saved, setSaved] = useState(false);

  const type = profile?.type || "your type";
  const authority = profile?.authority || "your authority";

  // Generate a prompt based on their design
  const prompts: Record<string, string> = {
    "Sacral": "What lit you up today? What made your gut say 'yes' — or 'no'?",
    "Emotional": "Where are you on your emotional wave right now? What clarity is emerging?",
    "Splenic": "Did you catch any quiet intuitive hits today? What did they tell you?",
    "Ego": "What commitments feel aligned with your will right now?",
    "Self-Projected": "What did you hear yourself say today that felt true?",
    "Mental": "What insights from your environment stood out today?",
    "Lunar": "What surprised you about today? What felt different from yesterday?",
  };
  const todayPrompt = prompts[authority] || "How did today's energy show up for you?";

  function handleSave() {
    // In production: save to Supabase journal_entries table
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="label-luxury mb-2">Daily Reflection</p>
          <h1 className="font-[family-name:var(--font-playfair)] italic text-3xl mb-1">Journal</h1>
          <p className="text-sm text-[var(--text-tertiary)]">{formatDate(new Date())}</p>
        </div>

        {/* Today's Prompt */}
        <div className="card mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-15 -translate-y-6 translate-x-6"
            style={{ background: "radial-gradient(circle, var(--accent-gold), transparent)" }} />
          <p className="label-luxury mb-3">Today&apos;s Prompt</p>
          <p className="font-[family-name:var(--font-playfair)] italic text-lg leading-relaxed">
            {todayPrompt}
          </p>
        </div>

        {/* Mood Selector */}
        <div className="mb-6">
          <p className="label-luxury mb-4">How do you feel?</p>
          <div className="flex gap-3 justify-center">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition ${
                  mood === m.value
                    ? "bg-[var(--accent-gold)]/10 border-2 border-[var(--accent-gold)]"
                    : "border-2 border-transparent hover:bg-[var(--bg-secondary)]"
                }`}
              >
                <span className="text-2xl" dangerouslySetInnerHTML={{ __html: m.emoji }} />
                <span className="text-[9px] tracking-wider uppercase text-[var(--text-tertiary)]">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Journal Entry */}
        <div className="mb-6">
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Write freely..."
            rows={8}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-gold)] transition resize-none leading-relaxed"
          />
          <p className="text-[10px] text-[var(--text-tertiary)] mt-2 text-right">
            {entry.length} characters
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!entry.trim() && mood === null}
          className="cta-primary w-full disabled:opacity-30"
        >
          {saved ? "Saved" : "Save Entry"}
        </button>

        {/* Past Entries Preview */}
        <div className="mt-10 pt-8 border-t border-[var(--border)]">
          <p className="label-luxury mb-4">Past Entries</p>
          <div className="text-center py-8">
            <p className="text-sm text-[var(--text-tertiary)]">
              Your journal entries will appear here. Start writing today to build a picture of your patterns.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
