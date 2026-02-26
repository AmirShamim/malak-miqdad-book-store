import { getServiceSupabase } from '../../lib/supabase-server'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { path: eventPath = '/' } = req.body || {}

  try {
    const supabase = getServiceSupabase()
    const { error } = await supabase
      .from('analytics')
      .insert({ event_path: eventPath })

    if (error) {
      console.error('Analytics insert error:', error)
      return res.status(500).json({ ok: false })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Analytics error:', err)
    return res.status(200).json({ ok: true }) // fail silently for analytics
  }
}
