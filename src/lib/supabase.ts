import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Demo mode flag - when true, uses local mock data instead of Supabase
export const IS_DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL || supabaseUrl === 'https://your-project.supabase.co';
