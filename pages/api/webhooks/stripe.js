import { buffer } from 'micro'
import Stripe from 'stripe'
import { getServiceSupabase } from '../../../lib/supabase-server'
import { sendOrderConfirmation } from '../../../lib/resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

// Disable body parsing — Stripe needs the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
    } else {
      // For local development without webhook signing
      event = JSON.parse(buf.toString())
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  const supabase = getServiceSupabase()
  if (!supabase) return res.status(503).json({ error: 'Service unavailable' })

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object

      const type = session.metadata?.type
      const userId = session.metadata?.user_id

      if (type === 'product' || type === 'cart') {
        // Update all orders for this session to 'paid'
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            stripe_payment_intent: session.payment_intent,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_session_id', session.id)

        if (updateError) {
          console.error('Failed to update orders:', updateError)
        }

        // Fetch the updated orders with product details for email
        const { data: orders } = await supabase
          .from('orders')
          .select('*, products(*)')
          .eq('stripe_session_id', session.id)

        // Get user email
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single()

        // Send confirmation emails
        if (profile?.email && orders) {
          for (const order of orders) {
            const product = order.products
            if (product?.file_url) {
              // Generate a signed download URL (24h expiry)
              const { data: signedUrl } = await supabase
                .storage
                .from('product-files')
                .createSignedUrl(product.file_url, 60 * 60 * 24)

              await sendOrderConfirmation({
                to: profile.email,
                productTitle: product.title,
                downloadUrl: signedUrl?.signedUrl || `${process.env.NEXT_PUBLIC_APP_URL}/account/purchases`,
              })
            } else {
              await sendOrderConfirmation({
                to: profile.email,
                productTitle: product?.title || 'Your purchase',
                downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/purchases`,
              })
            }
          }
        }

        // Track the sale in analytics
        await supabase.from('analytics').insert({ event_path: '/sales' })
      }

      if (type === 'booking') {
        // Update service booking status to in_progress
        const bookingId = session.metadata?.booking_id

        if (bookingId) {
          await supabase
            .from('service_bookings')
            .update({
              status: 'in_progress',
              stripe_session_id: session.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId)
        }
      }

      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object
      // Mark pending orders as failed
      await supabase
        .from('orders')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('stripe_session_id', session.id)
        .eq('status', 'pending')

      break
    }

    default:
      // Unhandled event type
      break
  }

  return res.status(200).json({ received: true })
}
