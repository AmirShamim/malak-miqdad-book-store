import { getUserSupabase, getServiceSupabase } from '../../../lib/supabase-server'
import stripe from '../../../lib/stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userSupabase = getUserSupabase(req)
    if (!userSupabase) return res.status(503).json({ error: 'Service unavailable' })
    const { data: { user }, error: authError } = await userSupabase.auth.getUser()

    if (authError || !user) {
      return res.status(401).json({ error: 'Please sign in' })
    }

    const { bookingId } = req.body
    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID required' })
    }

    const serviceSupabase = getServiceSupabase()
    if (!serviceSupabase) return res.status(503).json({ error: 'Service unavailable' })

    // Fetch booking and verify ownership
    const { data: booking, error: bookingError } = await serviceSupabase
      .from('service_bookings')
      .select('*, service_packages(title)')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single()

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    if (booking.status !== 'payment_pending') {
      return res.status(400).json({ error: 'This booking is not awaiting payment' })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Stripe Checkout Session for the booking
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: booking.currency || 'usd',
          product_data: {
            name: booking.service_packages?.title || 'Design Service',
            description: `Booking for ${booking.brand_name || 'your project'}`,
          },
          unit_amount: booking.amount,
        },
        quantity: 1,
      }],
      metadata: {
        type: 'booking',
        booking_id: booking.id,
        user_id: user.id,
      },
      success_url: `${appUrl}/account/bookings/${booking.id}?payment=success`,
      cancel_url: `${appUrl}/account/bookings/${booking.id}?payment=cancelled`,
    })

    // Update booking with stripe session ID
    await serviceSupabase
      .from('service_bookings')
      .update({ stripe_session_id: session.id })
      .eq('id', booking.id)

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Booking payment error:', err)
    return res.status(500).json({ error: 'Failed to create payment session' })
  }
}
