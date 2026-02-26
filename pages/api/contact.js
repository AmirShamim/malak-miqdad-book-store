import { getServiceSupabase } from '../../lib/supabase-server'

function isEmail(v) {
  return typeof v === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, message } = req.body || {}
  const errors = {}
  if (!name || name.trim().length < 2) errors.name = 'Name too short'
  if (!email || !isEmail(email)) errors.email = 'Invalid email'
  if (!message || message.trim().length < 10) errors.message = 'Message is too short'
  if (Object.keys(errors).length) return res.status(400).json({ errors })

  try {
    const supabase = getServiceSupabase()
    const { error } = await supabase
      .from('contacts')
      .insert({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      })

    if (error) {
      console.error('Contact insert error:', error)
      return res.status(500).json({ error: 'Failed to save message' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Contact handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
