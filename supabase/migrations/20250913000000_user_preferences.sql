-- Create user_preferences table for storing tutorial completion and other user settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tutorial completion tracking
  tutorials_completed JSONB DEFAULT '{}',
  tutorial_last_seen TIMESTAMP WITH TIME ZONE,
  
  -- User preferences
  preferred_search_filters JSONB DEFAULT '{}',
  search_history JSONB DEFAULT '[]',
  saved_professors JSONB DEFAULT '[]',
  email_preferences JSONB DEFAULT '{}',
  
  -- Session tracking
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  login_count INTEGER DEFAULT 1,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON public.user_preferences(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create search_sessions table for persistent search history
CREATE TABLE IF NOT EXISTS public.search_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  ai_suggestion TEXT,
  professors_found JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for search sessions
CREATE INDEX IF NOT EXISTS search_sessions_user_id_idx ON public.search_sessions(user_id);
CREATE INDEX IF NOT EXISTS search_sessions_created_at_idx ON public.search_sessions(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for search_sessions
CREATE POLICY "Users can view own search sessions" ON public.search_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search sessions" ON public.search_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own search sessions" ON public.search_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own search sessions" ON public.search_sessions
  FOR DELETE USING (auth.uid() = user_id);
