"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/AuthContext";
import { UserPlus, Heart, Users, Briefcase, Baby, User } from "lucide-react";

const RELATIONSHIP_ICONS: Record<string, typeof Heart> = {
  partner: Heart,
  family: Users,
  friend: User,
  coworker: Briefcase,
  child: Baby,
};

interface SavedPerson {
  id: string;
  name: string;
  relationship: string;
  type: string;
  profile: string;
}

export default function PeoplePage() {
  const { isPremium } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  // In production, these come from Supabase
  const [people] = useState<SavedPerson[]>([]);

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="label-luxury mb-1">My People</p>
            <h1 className="font-[family-name:var(--font-playfair)] italic text-3xl">Relationships</h1>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="cta-primary !text-sm !py-2.5 !px-4 !rounded-lg flex items-center gap-2"
          >
            <UserPlus size={16} /> Add Person
          </button>
        </div>

        {people.length === 0 && !showAddForm ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-6">
              <Users size={28} className="text-[var(--text-tertiary)]" />
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] italic text-2xl mb-3">
              Discover your connections
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">
              Add a partner, friend, or family member to see how your designs interact.
              Each relationship has a unique electromagnetic dynamic.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="cta-primary !text-base"
            >
              Add Your First Person
            </button>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-4">
              You can also <button className="text-[var(--accent-gold)] underline">invite them by email</button> to see the full report together
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {people.map((person) => {
              const Icon = RELATIONSHIP_ICONS[person.relationship] || User;
              return (
                <Link key={person.id} href={`/people/${person.id}`} className="card flex items-center gap-4 hover:border-[var(--accent-gold)]/30 transition">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                    <Icon size={18} className="text-[var(--text-secondary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{person.name}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{person.type} &middot; {person.profile}</p>
                  </div>
                  <span className="text-[var(--text-tertiary)]">&rsaquo;</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Add Person Form */}
        {showAddForm && (
          <div className="card mt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-medium">Add a Person</h3>
              <button onClick={() => setShowAddForm(false)} className="text-[var(--text-tertiary)] text-lg">&times;</button>
            </div>
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); }}>
              <div>
                <label className="label-luxury">Their Name</label>
                <input className="input-line" placeholder="Name" />
              </div>
              <div>
                <label className="label-luxury">Relationship</label>
                <select className="input-line appearance-none cursor-pointer">
                  <option value="">Select...</option>
                  <option value="partner">Partner</option>
                  <option value="family">Family</option>
                  <option value="friend">Friend</option>
                  <option value="coworker">Coworker</option>
                  <option value="child">Child</option>
                </select>
              </div>
              <div>
                <label className="label-luxury">Date of Birth</label>
                <input type="date" className="input-line" />
              </div>
              <div>
                <label className="label-luxury">Time of Birth</label>
                <input type="time" className="input-line" />
              </div>
              <div>
                <label className="label-luxury">Birth City</label>
                <input className="input-line" placeholder="City, Country" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="cta-primary flex-1 !text-sm">
                  Calculate Chart
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="cta-secondary flex-1 !text-sm">
                  Cancel
                </button>
              </div>
            </form>

            {/* Invite option */}
            <div className="mt-6 pt-5 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--text-secondary)] text-center">
                Or{" "}
                <button className="text-[var(--accent-gold)] font-medium">
                  invite them by email
                </button>
                {" "}to fill in their own details
              </p>
            </div>
          </div>
        )}

        {/* Compatibility Preview */}
        {!isPremium && people.length > 0 && (
          <div className="card mt-6 text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              See full compatibility reports with electromagnetic connections, communication mapping, and growth areas.
            </p>
            <Link href="/upgrade" className="cta-primary !text-sm !py-2.5 !px-6">
              Unlock Compatibility
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
