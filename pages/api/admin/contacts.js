import { requireAdmin } from '../../../lib/admin'
import { getServiceSupabase } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  const { authorized, error } = await requireAdmin(req)
  if (!authorized) return res.status(403).json({ error })

  const supabase = getServiceSupabase()

  if (req.method === 'GET') {
    const { data: contacts, error: fetchError } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (fetchError) return res.status(500).json({ error: 'Failed to fetch' })
    return res.status(200).json({ contacts })
  }

  if (req.method === 'PATCH') {
    const { id, is_read } = req.body
    if (!id) return res.status(400).json({ error: 'ID required' })

    const { error: updateError } = await supabase
      .from('contacts')
      .update({ is_read })
      .eq('id', id)

    if (updateError) return res.status(500).json({ error: 'Failed to update' })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
