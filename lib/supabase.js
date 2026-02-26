import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Client-side Supabase client (uses anon key, respects RLS).
 * Returns a no-op stub when env vars are missing to avoid runtime errors
 * while still allowing the app to render with fallback data.
 */
let supabase

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Stub that prevents crashes when Supabase isn't configured
  const noop = () => ({ data: null, error: { message: 'Supabase not configured' } })
  const chainable = new Proxy({}, {
    get() { return (..._args) => chainable },
    apply() { return Promise.resolve(noop()) },
  })
  supabase = {
    from: () => chainable,
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: (_cb) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: noop,
      signInWithPassword: noop,
      signInWithOAuth: noop,
      signOut: () => Promise.resolve({ error: null }),
    },
  }
  if (typeof window !== 'undefined') {
    console.warn('Supabase not configured — running with fallback data')
  }
}

export { supabase }
export default supabase
