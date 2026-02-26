import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role key
// ONLY use this in API routes and getServerSideProps — never expose to client
export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL')
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Get a user-scoped Supabase client from an API request
// Uses the user's JWT from the Authorization header to respect RLS
export function getUserSupabase(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Missing Supabase env vars')
  }

  const token = req.headers.authorization?.replace('Bearer ', '')

  const client = createClient(url, anonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return client
}
