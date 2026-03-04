import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Only initialize if we have real-looking credentials (not placeholders)
const isReal = supabaseUrl.startsWith("https://") && supabaseAnonKey.length > 20;

// Returns null if not configured — app works in demo mode without auth
export const supabase = isReal
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = isReal;

export type UserProfile = {
  id: string;
  email: string;
  is_subscribed: boolean;
  stripe_customer_id?: string;
};
