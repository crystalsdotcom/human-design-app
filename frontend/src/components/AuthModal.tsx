"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error } = await signInWithEmail(email.trim());
    setLoading(false);
    if (error) { setError(error); return; }
    setSent(true);
  }

  return (
    <div className="fixed inset-0 bg-[#1C1917]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1C1917]/25 hover:text-[#1C1917] transition text-lg leading-none"
        >
          ×
        </button>

        {!sent ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#1C1917] mb-1">Welcome to HDOS</h2>
              <p className="text-sm text-[#78716C]">Enter your email — we'll send a magic link. No password needed.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-[#FAF8F5] border border-[#1C1917]/10 rounded-xl px-4 py-3 text-[#1C1917] placeholder-[#1C1917]/30 focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 transition text-sm"
              />
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1C1917] hover:bg-[#1C1917]/90 disabled:opacity-40 rounded-xl py-3 font-medium text-white transition text-sm"
              >
                {loading ? "Sending…" : "Send Magic Link →"}
              </button>
            </form>

            <p className="text-[10px] text-[#1C1917]/25 text-center mt-4">
              By continuing you agree to our Terms & Privacy Policy
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-lg font-bold text-[#1C1917] mb-2">Check your inbox</h2>
            <p className="text-sm text-[#78716C]">
              We sent a magic link to <span className="font-medium text-[#1C1917]">{email}</span>.
              Click it to sign in — no password needed.
            </p>
            <button
              onClick={onClose}
              className="mt-6 text-sm text-[#7C3AED] hover:underline"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
