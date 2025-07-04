import { createClient } from '@supabase/supabase-js';

// Get the environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a dummy client if environment variables are missing
const isMissingEnvVars = !supabaseUrl || !supabaseAnonKey;

// If environment variables are missing, we'll log a warning instead of crashing
if (isMissingEnvVars && process.env.NODE_ENV !== 'production') {
  console.warn(
    '⚠️ Supabase environment variables are missing. Authentication features will not work.\n' +
    'Please run: npm run setup-env'
  );
}

// Create the Supabase client (will be a mock client if env vars are missing)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Helper function to get the current session
export const getSession = async () => {
  if (isMissingEnvVars) return null;

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  const session = await getSession();
  return session?.user || null;
}; 