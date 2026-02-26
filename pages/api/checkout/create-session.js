import { getServiceSupabase } from '../../../lib/supabase-server'
import stripe from '../../../lib/stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { productId, userId } = req.body || {}

  if (!productId || !userId) {
    return res.status(400).json({ error: 'Missing productId or userId' })
  }

  try {
    const supabase = getServiceSupabase()
    if (!supabase) return res.status(503).json({ error: 'Service unavailable' })

    // Fetch product from DB (never trust client-sent prices)
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Fetch user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: profile?.email,
      line_items: [
        {
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: {
              name: product.title,
              description: product.description?.substring(0, 200),
              images: product.cover_url
                ? [`${process.env.NEXT_PUBLIC_APP_URL}${product.cover_url}`]
                : [],
            },
            unit_amount: product.price, // already in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        product_id: product.id,
        user_id: userId,
        type: 'product',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    })

    // Create a pending order
    await supabase.from('orders').insert({
      user_id: userId,
      product_id: product.id,
      amount: product.price,
      currency: product.currency,
      status: 'pending',
      stripe_session_id: session.id,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Checkout session error:', err)
    return res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
