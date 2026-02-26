import { getServiceSupabase } from './supabase-server'

/**
 * Shared admin middleware - verifies user is authenticated and has admin role.
 * Use in getServerSideProps or API routes.
 */
export async function requireAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '') ||
    req.cookies?.['sb-access-token'] ||
    null

  if (!token) {
    return { authorized: false, error: 'Not authenticated' }
  }

  const supabase = getServiceSupabase()

  // Try to get user from the Supabase auth token
  const { createClient } = require('@supabase/supabase-js')
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error: authError } = await userClient.auth.getUser()

  if (authError || !user) {
    return { authorized: false, error: 'Invalid session' }
  }

  // Check admin role in profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: 'Admin access required' }
  }

  return { authorized: true, user, supabase }
}
