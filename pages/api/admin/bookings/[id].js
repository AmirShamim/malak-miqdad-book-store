import { requireAdmin } from '../../../../lib/admin'
import { getServiceSupabase } from '../../../../lib/supabase-server'
import { sendBookingStatusUpdate } from '../../../../lib/resend'

export default async function handler(req, res) {
  const { authorized, error } = await requireAdmin(req)
  if (!authorized) return res.status(403).json({ error })

  const { id } = req.query
  const supabase = getServiceSupabase()

  if (req.method === 'GET') {
    const { data: booking, error: fetchError } = await supabase
      .from('service_bookings')
      .select('*, service_packages(*), profiles(full_name, email)')
      .eq('id', id)
      .single()

    if (fetchError || !booking) return res.status(404).json({ error: 'Booking not found' })
    return res.status(200).json({ booking })
  }

  if (req.method === 'PATCH') {
    const { status } = req.body
    const validStatuses = ['pending', 'accepted', 'payment_pending', 'in_progress', 'revision', 'completed', 'cancelled']

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const { data: booking, error: updateError } = await supabase
      .from('service_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, service_packages(title), profiles(full_name, email)')
      .single()

    if (updateError) return res.status(500).json({ error: 'Failed to update' })

    // Send status email to client
    try {
      if (booking.profiles?.email) {
        await sendBookingStatusUpdate({
          to: booking.profiles.email,
          packageTitle: booking.service_packages?.title || 'Design Service',
          status,
        })
      }
    } catch {}

    return res.status(200).json({ booking })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
