import { getServiceSupabase } from '../../../lib/supabase-server'
import stripe from '../../../lib/stripe'

// Also support cart checkout with multiple items
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { items, userId } = req.body || {}
  // items = [{ productId, quantity }]

  if (!items?.length || !userId) {
    return res.status(400).json({ error: 'Missing items or userId' })
  }

  try {
    const supabase = getServiceSupabase()

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    // Fetch all products
    const productIds = items.map(i => i.productId)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('is_active', true)

    if (productsError || !products?.length) {
      return res.status(400).json({ error: 'No valid products found' })
    }

    // Build line items from DB data
    const lineItems = products.map(product => {
      const cartItem = items.find(i => i.productId === product.id)
      return {
        price_data: {
          currency: product.currency.toLowerCase(),
          product_data: {
            name: product.title,
            description: product.description?.substring(0, 200),
          },
          unit_amount: product.price,
        },
        quantity: cartItem?.quantity || 1,
      }
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: profile?.email,
      line_items: lineItems,
      metadata: {
        product_ids: productIds.join(','),
        user_id: userId,
        type: 'cart',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    })

    // Create pending orders for each product
    const orderRows = products.map(product => ({
      user_id: userId,
      product_id: product.id,
      amount: product.price * (items.find(i => i.productId === product.id)?.quantity || 1),
      currency: product.currency,
      status: 'pending',
      stripe_session_id: session.id,
    }))

    await supabase.from('orders').insert(orderRows)

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Cart checkout error:', err)
    return res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
