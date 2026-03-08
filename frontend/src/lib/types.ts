// Shared types for the HDOS app

export type HDType = "Generator" | "Manifesting Generator" | "Projector" | "Manifestor" | "Reflector";
export type SubscriptionStatus = "free" | "trial" | "active" | "cancelled" | "past_due";
export type Relationship = "partner" | "family" | "friend" | "coworker" | "child" | "self";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  birth_date?: string;
  birth_time?: string;
  birth_location?: string;
  birth_lat?: number;
  birth_lng?: number;
  timezone?: string;
  type?: string;
  strategy?: string;
  authority?: string;
  profile?: string;
  definition?: string;
  incarnation_cross?: string;
  chart_data?: ChartDataJSON;
  subscription_status: SubscriptionStatus;
  subscription_plan?: string;
  trial_ends_at?: string;
  onboarding_complete: boolean;
  streak_count: number;
  streak_last_date?: string;
  total_ai_questions: number;
  daily_ai_questions: number;
  referral_code?: string;
  created_at: string;
}

export interface SavedChart {
  id: string;
  user_id: string;
  name: string;
  relationship?: Relationship;
  birth_date: string;
  birth_time?: string;
  birth_location?: string;
  type?: string;
  strategy?: string;
  authority?: string;
  profile?: string;
  definition?: string;
  chart_data: ChartDataJSON;
  created_at: string;
}

export interface TransitReading {
  id: string;
  user_id: string;
  date: string;
  reading_text: string;
  transit_data?: Record<string, unknown>;
  gates_activated?: string[];
  mood_rating?: number;
  journal_entry?: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  entry_text?: string;
  mood_rating?: number;
  prompt?: string;
  transit_gates?: string[];
  created_at: string;
}

export interface ChartDataJSON {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  incarnation_cross?: string;
  centers: Record<string, { defined: boolean; gates: number[] }>;
  channels: Array<{ channel: string; name: string; centers: string[] }>;
  gates: Record<string, { gate: number; line: number }>;
  variables?: {
    digestion: string;
    environment: string;
    perspective: string;
    awareness: string;
  };
}

// Type configuration for visual styling
export const TYPE_CONFIG: Record<string, {
  gradient: string;
  gradientStart: string;
  gradientEnd: string;
  accent: string;
  tagline: string;
  strategy: string;
}> = {
  "Generator": {
    gradient: "linear-gradient(135deg, #F0A830, #E8892C)",
    gradientStart: "#F0A830",
    gradientEnd: "#E8892C",
    accent: "#D97706",
    tagline: "You are the life force.",
    strategy: "Wait to respond",
  },
  "Manifesting Generator": {
    gradient: "linear-gradient(135deg, #E8892C, #D4617A)",
    gradientStart: "#E8892C",
    gradientEnd: "#D4617A",
    accent: "#D4617A",
    tagline: "You contain multitudes.",
    strategy: "Feel the pull, then move",
  },
  "Projector": {
    gradient: "linear-gradient(135deg, #8B7EC8, #5E4FA2)",
    gradientStart: "#8B7EC8",
    gradientEnd: "#5E4FA2",
    accent: "#7C3AED",
    tagline: "You see what others miss.",
    strategy: "Wait for the invitation",
  },
  "Manifestor": {
    gradient: "linear-gradient(135deg, #D4617A, #B83B4E)",
    gradientStart: "#D4617A",
    gradientEnd: "#B83B4E",
    accent: "#BE185D",
    tagline: "You move first.",
    strategy: "Inform before acting",
  },
  "Reflector": {
    gradient: "linear-gradient(135deg, #C8B8E8, #8BD4D4, #F0C878, #D4617A)",
    gradientStart: "#C8B8E8",
    gradientEnd: "#8BD4D4",
    accent: "#0284C7",
    tagline: "You are the rarest mirror.",
    strategy: "Let the moon decide",
  },
};

export const AUTHORITY_NAMES: Record<string, string> = {
  "Sacral": "Gut Knowing",
  "Emotional": "Emotional Wave",
  "Splenic": "Instinct",
  "Ego": "Will Power",
  "Self-Projected": "Authentic Voice",
  "Mental": "Environmental Wisdom",
  "Lunar": "Lunar Clarity",
};

export const PROFILE_NAMES: Record<string, [string, string]> = {
  "1/3": ["Investigator", "Martyr"],
  "1/4": ["Investigator", "Opportunist"],
  "2/4": ["Hermit", "Opportunist"],
  "2/5": ["Hermit", "Heretic"],
  "3/5": ["Martyr", "Heretic"],
  "3/6": ["Martyr", "Role Model"],
  "4/6": ["Opportunist", "Role Model"],
  "4/1": ["Opportunist", "Investigator"],
  "5/1": ["Heretic", "Investigator"],
  "5/2": ["Heretic", "Hermit"],
  "6/2": ["Role Model", "Hermit"],
  "6/3": ["Role Model", "Martyr"],
};

export const DEFINITION_SHORT: Record<string, string> = {
  "Single Definition": "Always yourself",
  "Split Definition": "Energised by others",
  "Triple Split": "Fluid & adaptable",
  "Quadruple Split": "Beautifully complex",
  "No Definition": "Pure reflection",
};
