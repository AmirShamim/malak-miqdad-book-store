import { requireAdmin } from '../../../lib/admin'
import { getServiceSupabase } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { authorized, error } = await requireAdmin(req)
  if (!authorized) return res.status(403).json({ error })

  const supabase = getServiceSupabase()
  if (!supabase) return res.status(503).json({ error: 'Service unavailable' })

  const { data: orders, error: fetchError } = await supabase
    .from('orders')
    .select('*, products(title), profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (fetchError) return res.status(500).json({ error: 'Failed to fetch orders' })

  return res.status(200).json({ orders })
}
