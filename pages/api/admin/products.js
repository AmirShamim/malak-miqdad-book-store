import { requireAdmin } from '../../../lib/admin'
import { getServiceSupabase } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  const { authorized, error } = await requireAdmin(req)
  if (!authorized) return res.status(403).json({ error })

  const supabase = getServiceSupabase()

  if (req.method === 'GET') {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .order('sort_order')

    if (fetchError) return res.status(500).json({ error: 'Failed to fetch' })
    return res.status(200).json({ products: data })
  }

  if (req.method === 'POST') {
    const { title, description, price, cover_url, accent_color } = req.body
    if (!title || !price) return res.status(400).json({ error: 'Title and price required' })

    const { data, error: insertError } = await supabase
      .from('products')
      .insert({
        title,
        description: description || '',
        price,
        currency: 'usd',
        cover_url: cover_url || null,
        accent_color: accent_color || '#3b82f6',
      })
      .select()
      .single()

    if (insertError) return res.status(500).json({ error: 'Failed to create product' })
    return res.status(201).json({ product: data })
  }

  if (req.method === 'PATCH') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Product ID required' })

    const { title, description, price, cover_url, accent_color } = req.body
    const updates = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (price !== undefined) updates.price = price
    if (cover_url !== undefined) updates.cover_url = cover_url
    if (accent_color !== undefined) updates.accent_color = accent_color

    const { data, error: updateError } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) return res.status(500).json({ error: 'Failed to update' })
    return res.status(200).json({ product: data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
