-- Create profiles table for user settings
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  history_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analysis_history table
CREATE TABLE IF NOT EXISTS public.analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_name TEXT NOT NULL,
  contract_text TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  risk_summary JSONB NOT NULL,
  clauses JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create guest_usage table to track anonymous usage
CREATE TABLE IF NOT EXISTS public.guest_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_usage ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Analysis history policies
CREATE POLICY "history_select_own" ON public.analysis_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "history_insert_own" ON public.analysis_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "history_delete_own" ON public.analysis_history FOR DELETE USING (auth.uid() = user_id);

-- Guest usage policies (allow all for tracking anonymous users)
CREATE POLICY "guest_usage_all" ON public.guest_usage FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON public.analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at ON public.analysis_history(created_at);
CREATE INDEX IF NOT EXISTS idx_guest_usage_fingerprint ON public.guest_usage(fingerprint);
