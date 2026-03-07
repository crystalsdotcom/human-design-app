"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
  const { signInWithEmail } = useAuth();
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(10,8,6,0.72)", backdropFilter: "blur(12px)" }}
    >
      <div
        className="relative w-full max-w-sm bg-[#FAF9F6] px-10 py-14"
        style={{ boxShadow: "0 32px 80px rgba(10,8,6,0.28)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-7 text-[#1A1714]/22 hover:text-[#1A1714]/60 transition-colors text-xl leading-none"
        >
          ×
        </button>

        {!sent ? (
          <>
            <p className="text-[9px] tracking-[0.42em] uppercase text-[#1A1714]/30 mb-5">
              Create account
            </p>
            <h2 className="font-display italic text-[2.6rem] leading-[1.05] text-[#1A1714] mb-3">
              Begin your<br />journey.
            </h2>
            <p className="text-[13px] text-[#1A1714]/42 leading-relaxed mb-10">
              Enter your email and we&apos;ll send a magic link.<br />No password needed.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="text-[9px] tracking-[0.32em] uppercase text-[#1A1714]/30 block mb-3">
                  Your email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-line w-full text-sm"
                />
                {error && (
                  <p className="text-[11px] text-rose-400 mt-2">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full border border-[#1A1714] text-[#1A1714] hover:bg-[#1A1714] hover:text-[#FAF9F6] disabled:opacity-30 py-4 text-[10px] font-medium tracking-[0.26em] uppercase transition-all duration-300"
              >
                {loading ? "Sending…" : "Send Magic Link →"}
              </button>
            </form>

            <p className="text-[9px] text-[#1A1714]/20 text-center mt-8">
              By continuing you agree to our Terms & Privacy Policy
            </p>
          </>
        ) : (
          <div className="text-center">
            <p className="text-[9px] tracking-[0.42em] uppercase text-[#1A1714]/30 mb-5">
              Check your inbox
            </p>
            <h2 className="font-display italic text-[2.6rem] leading-[1.05] text-[#1A1714] mb-6">
              Link sent.
            </h2>
            <p className="text-[13px] text-[#1A1714]/42 leading-relaxed mb-10">
              We sent a magic link to{" "}
              <span className="text-[#1A1714]/75">{email}</span>.
              <br />Click it to sign in instantly.
            </p>
            <button
              onClick={onClose}
              className="label-luxury text-[#1A1714]/30 hover:text-[#1A1714]/65 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
