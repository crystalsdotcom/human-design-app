"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/AuthContext";
import { User, CreditCard, Bell, Share2, Moon, Shield, Trash2, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { profile, isPremium, signOut, configured, session } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = profile?.referral_code || "HDOS-XXXX";
  const referralLink = `https://humandesignos.com/chart?ref=${referralCode}`;

  function copyReferral() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 py-8">
        <h1 className="font-[family-name:var(--font-playfair)] italic text-3xl mb-8">Settings</h1>

        {/* Profile Info */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
              <User size={24} className="text-[var(--text-tertiary)]" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{profile?.name || "Explorer"}</p>
              <p className="text-sm text-[var(--text-tertiary)]">{profile?.email || "Not signed in"}</p>
              {profile?.type && (
                <p className="text-[11px] text-[var(--accent-gold)] mt-0.5">
                  {profile.type} &middot; {profile.profile}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard size={18} className="text-[var(--text-secondary)]" />
            <h3 className="font-medium">Subscription</h3>
          </div>
          {isPremium ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] font-medium">
                  Premium Active
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  {profile?.subscription_plan === "annual" ? "$99/year" : "$15/month"}
                </span>
              </div>
              <button className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                Manage Subscription &rarr;
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-3">Free plan</p>
              <Link href="/upgrade" className="cta-primary !text-sm !py-2.5 !px-6 inline-block">
                Upgrade to Premium
              </Link>
            </div>
          )}
        </div>

        {/* Referral */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Share2 size={18} className="text-[var(--text-secondary)]" />
            <h3 className="font-medium">Refer a Friend</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            Share your link — when a friend signs up for Premium, you both get a free month.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={referralLink}
              className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] truncate"
            />
            <button onClick={copyReferral} className="cta-secondary !text-xs !py-2 !px-4">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Settings Links */}
        <div className="space-y-1">
          {[
            { icon: Bell, label: "Notifications", action: () => {} },
            { icon: Moon, label: "Dark Mode", action: () => {}, note: "Coming soon" },
            { icon: Shield, label: "Privacy", action: () => {} },
          ].map(({ icon: Icon, label, note }) => (
            <button key={label} className="w-full card flex items-center gap-3 hover:border-[var(--accent-gold)]/30 transition">
              <Icon size={18} className="text-[var(--text-secondary)]" />
              <span className="flex-1 text-left text-sm">{label}</span>
              {note && <span className="text-[10px] text-[var(--text-tertiary)]">{note}</span>}
            </button>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="mt-10 pt-8 border-t border-[var(--border)] space-y-3">
          {configured && session && (
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          )}
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-500 transition">
            <Trash2 size={18} />
            Delete Account
          </button>
        </div>
      </div>
    </AppShell>
  );
}
