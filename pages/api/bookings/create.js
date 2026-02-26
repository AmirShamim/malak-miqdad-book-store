import { getUserSupabase, getServiceSupabase } from '../../../lib/supabase-server'
import { sendBookingNotification } from '../../../lib/resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get authenticated user
    const userSupabase = getUserSupabase(req)
    if (!userSupabase) return res.status(503).json({ error: 'Service unavailable' })
    const { data: { user }, error: authError } = await userSupabase.auth.getUser()

    if (authError || !user) {
      return res.status(401).json({ error: 'Please sign in to book a service' })
    }

    const { packageId, brandName, brief, referenceUrls, deadline } = req.body

    if (!packageId || !brief || brief.trim().length < 20) {
      return res.status(400).json({ error: 'Package ID and a detailed brief (20+ chars) are required' })
    }

    // Fetch the package from DB to get accurate pricing
    const serviceSupabase = getServiceSupabase()
    if (!serviceSupabase) return res.status(503).json({ error: 'Service unavailable' })
    const { data: pkg, error: pkgError } = await serviceSupabase
      .from('service_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single()

    if (pkgError || !pkg) {
      return res.status(404).json({ error: 'Service package not found' })
    }

    // Create the booking
    const { data: booking, error: bookingError } = await serviceSupabase
      .from('service_bookings')
      .insert({
        user_id: user.id,
        package_id: pkg.id,
        status: 'pending',
        brand_name: brandName || null,
        brief: brief.trim(),
        reference_urls: Array.isArray(referenceUrls) ? referenceUrls.filter(Boolean) : [],
        deadline: deadline || null,
        amount: pkg.price,
        currency: pkg.currency || 'usd',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      return res.status(500).json({ error: 'Failed to create booking' })
    }

    // Send notification email to admin (fire and forget)
    try {
      await sendBookingNotification({
        customerName: user.user_metadata?.full_name || user.email,
        packageTitle: pkg.title,
        brief: brief.trim().substring(0, 200),
      })
    } catch (emailErr) {
      console.error('Booking notification email failed:', emailErr)
    }

    // Track analytics
    try {
      await serviceSupabase.from('analytics').insert({
        event: 'booking_created',
        path: `/services/book/${pkg.id}`,
        user_id: user.id,
      })
    } catch {}

    return res.status(201).json({ booking })
  } catch (err) {
    console.error('Booking API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
