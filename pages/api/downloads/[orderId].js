import { getServiceSupabase } from '../../../lib/supabase-server'

// GET /api/downloads/[orderId] — generate a signed download URL for a purchased product
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { orderId } = req.query
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const supabase = getServiceSupabase()
    if (!supabase) return res.status(503).json({ error: 'Service unavailable' })

    // Verify the user from the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Fetch the order — must belong to this user and be paid
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, products(*)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .eq('status', 'paid')
      .single()

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found or not paid' })
    }

    const product = order.products

    if (!product?.file_url) {
      return res.status(404).json({ error: 'No file available for this product' })
    }

    // Generate a signed URL (1 hour expiry)
    const { data: signedUrl, error: storageError } = await supabase
      .storage
      .from('product-files')
      .createSignedUrl(product.file_url, 60 * 60)

    if (storageError || !signedUrl) {
      return res.status(500).json({ error: 'Failed to generate download link' })
    }

    // Increment download count
    await supabase
      .from('orders')
      .update({ download_count: (order.download_count || 0) + 1 })
      .eq('id', orderId)

    return res.status(200).json({ url: signedUrl.signedUrl })
  } catch (err) {
    console.error('Download error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
