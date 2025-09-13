import { createClient } from '@supabase/supabase-js';

const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Log a warning if the environment variables are missing in development
if (isDevelopment && (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-anon-key')) {
  console.warn(
    'Supabase URL or anon key is missing. This will use mock data in development. To use a real Supabase instance, add your credentials to .env.local:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key'
  );
}

// Create the client and export it
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for professors table
export interface ProfessorRow {
  id: number;
  name: string;
  title?: string;
  university?: string;
  research_areas?: string; // JSON string array
  email?: string;
  publications?: number;
  citations?: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
} 