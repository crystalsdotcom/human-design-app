"use client";

import { useState, useRef, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/AuthContext";
import { streamInterpretation, ChartData } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "Should I take this job?",
  "Why am I so tired?",
  "How do I communicate better?",
  "What's my purpose?",
  "How should I make decisions?",
  "Why do I feel stuck?",
];

export default function ChatPage() {
  const { profile, isPremium, configured } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const FREE_LIMIT = 3;
  const canAsk = isPremium || questionsUsed < FREE_LIMIT;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming || !canAsk) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    setQuestionsUsed(prev => prev + 1);

    // Build a mock chart for the AI from profile data
    const chart: ChartData = profile?.chart_data as unknown as ChartData || {
      type_: profile?.type || "Generator",
      authority: profile?.authority || "Sacral",
      profile: [3, 5],
      definition: profile?.definition || "Single Definition",
      defined_centers: [],
      undefined_centers: [],
      defined_channels: [],
      defined_gates: [],
      personality: {},
      design: {},
      birth_date: "",
      design_date: "",
    };

    let assistantContent = "";
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    await streamInterpretation(
      chart,
      text,
      "standard",
      (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantContent };
          return updated;
        });
      },
      () => setStreaming(false)
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-2xl mx-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border)]">
          <h1 className="font-[family-name:var(--font-playfair)] italic text-2xl">Ask HDOS</h1>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
            {isPremium ? "Unlimited questions" : `${FREE_LIMIT - questionsUsed} questions remaining today`}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl mb-3">
                What&apos;s on your mind?
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">
                Ask anything about your design, your decisions, your relationships, or your energy.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-sm px-4 py-2 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-[var(--text-primary)] text-white rounded-2xl rounded-br-md px-4 py-3"
                      : ""
                  }`}>
                    {msg.role === "user" ? (
                      <p className="text-sm">{msg.content}</p>
                    ) : (
                      <div className="prose-hdos">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                        {streaming && i === messages.length - 1 && (
                          <span className="inline-block w-[2px] h-4 bg-[var(--accent-gold)] animate-pulse rounded-full ml-1" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-[var(--border)]">
          {!canAsk ? (
            <div className="text-center py-3">
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                You&apos;ve used your {FREE_LIMIT} free questions today.
              </p>
              <Link href="/upgrade" className="cta-primary !text-sm !py-2.5 !px-6">
                Unlock Unlimited Questions
              </Link>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your design..."
                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-gold)] transition"
                disabled={streaming}
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                className="cta-primary !p-3 !rounded-xl disabled:opacity-30"
              >
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
