-- HDOS Supabase Schema — Master Build Spec v1.0
-- Run this in Supabase Dashboard → SQL Editor

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email               TEXT NOT NULL,
  name                TEXT,
  birth_date          DATE,
  birth_time          TIME,
  birth_location      TEXT,
  birth_lat           DECIMAL,
  birth_lng           DECIMAL,
  timezone            TEXT,
  -- Chart data (computed on creation, stored for fast access)
  type                TEXT,
  strategy            TEXT,
  authority           TEXT,
  profile             TEXT,
  definition          TEXT,
  incarnation_cross   TEXT,
  chart_data          JSONB,
  -- Subscription
  stripe_customer_id  TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'trial', 'active', 'cancelled', 'past_due')),
  subscription_plan   TEXT CHECK (subscription_plan IN ('monthly', 'annual')),
  trial_ends_at       TIMESTAMPTZ,
  -- Engagement
  onboarding_complete BOOLEAN DEFAULT false,
  last_active_at      TIMESTAMPTZ,
  streak_count        INTEGER DEFAULT 0,
  streak_last_date    DATE,
  total_ai_questions  INTEGER DEFAULT 0,
  daily_ai_questions  INTEGER DEFAULT 0,
  daily_reset_at      TIMESTAMPTZ,
  -- Marketing
  email_opted_in      BOOLEAN DEFAULT true,
  referral_code       TEXT UNIQUE,
  referred_by         UUID REFERENCES public.profiles(id),
  utm_source          TEXT,
  utm_medium          TEXT,
  utm_campaign        TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 3. CHARTS (My People — saved charts of friends/family)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.charts (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name                TEXT NOT NULL,
  relationship        TEXT CHECK (relationship IN ('partner', 'family', 'friend', 'coworker', 'child', 'self')),
  birth_date          DATE NOT NULL,
  birth_time          TIME,
  birth_location      TEXT,
  birth_lat           DECIMAL,
  birth_lng           DECIMAL,
  timezone            TEXT,
  -- Computed chart data
  type                TEXT,
  strategy            TEXT,
  authority           TEXT,
  profile             TEXT,
  definition          TEXT,
  incarnation_cross   TEXT,
  chart_data          JSONB NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. TRANSIT READINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transit_readings (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date                DATE NOT NULL,
  reading_text        TEXT NOT NULL,
  transit_data        JSONB,
  gates_activated     TEXT[],
  mood_rating         INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  journal_entry       TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================================
-- 5. COMPATIBILITY REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.compatibility_reports (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  chart_id            UUID REFERENCES public.charts(id) ON DELETE SET NULL,
  invited_user_id     UUID REFERENCES public.profiles(id),
  invited_email       TEXT,
  invite_status       TEXT DEFAULT 'pending' CHECK (invite_status IN ('pending', 'accepted', 'expired')),
  report_data         JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. AI CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  messages            JSONB[] DEFAULT '{}',
  context             TEXT DEFAULT 'general' CHECK (context IN ('general', 'transit', 'compatibility', 'career', 'relationship')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. JOURNAL ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date                DATE NOT NULL,
  entry_text          TEXT,
  mood_rating         INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  prompt              TEXT,
  transit_gates       TEXT[],
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================================
-- 8. EMAIL EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_events (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type          TEXT CHECK (event_type IN ('sent', 'opened', 'clicked', 'unsubscribed')),
  email_flow          TEXT,
  email_name          TEXT,
  metadata            JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. REFERRALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id         UUID REFERENCES public.profiles(id),
  referral_code       TEXT NOT NULL,
  status              TEXT DEFAULT 'clicked' CHECK (status IN ('clicked', 'signed_up', 'converted')),
  reward_granted      BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access" ON public.profiles
  USING (auth.role() = 'service_role');

-- Charts
ALTER TABLE public.charts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own charts" ON public.charts
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role full access charts" ON public.charts
  USING (auth.role() = 'service_role');

-- Transit Readings
ALTER TABLE public.transit_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own transits" ON public.transit_readings
  FOR ALL USING (auth.uid() = user_id);

-- Compatibility Reports
ALTER TABLE public.compatibility_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own compatibility" ON public.compatibility_reports
  FOR ALL USING (auth.uid() = user_id);

-- AI Conversations
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own conversations" ON public.ai_conversations
  FOR ALL USING (auth.uid() = user_id);

-- Journal Entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own journal" ON public.journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- Referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Service role full access referrals" ON public.referrals
  USING (auth.role() = 'service_role');

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_charts_user_id ON public.charts(user_id);
CREATE INDEX IF NOT EXISTS idx_transit_readings_user_date ON public.transit_readings(user_id, date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON public.journal_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
