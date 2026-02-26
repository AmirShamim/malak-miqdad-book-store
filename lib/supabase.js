import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase env vars — check .env.local')
}

// Client-side Supabase client (uses anon key, respects RLS)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

export default supabase
