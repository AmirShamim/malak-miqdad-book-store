import { requireAdmin } from '../../../lib/admin'
import { getServiceSupabase } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { authorized, error } = await requireAdmin(req)
  if (!authorized) {
    return res.status(403).json({ error })
  }

  const supabase = getServiceSupabase()

  try {
    // Total revenue (paid orders)
    const { data: orders } = await supabase
      .from('orders')
      .select('amount')
      .eq('status', 'paid')

    const totalRevenue = orders?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0
    const totalOrders = orders?.length || 0

    // Active bookings
    const { count: activeBookings } = await supabase
      .from('service_bookings')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'accepted', 'payment_pending', 'in_progress', 'revision'])

    // Unread contacts
    const { count: unreadContacts } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)

    // Recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*, products(title), profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(5)

    // Recent bookings
    const { data: recentBookings } = await supabase
      .from('service_bookings')
      .select('*, service_packages(title), profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5)

    return res.status(200).json({
      stats: {
        totalRevenue,
        totalOrders,
        activeBookings: activeBookings || 0,
        unreadContacts: unreadContacts || 0,
      },
      recentOrders: recentOrders || [],
      recentBookings: recentBookings || [],
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    return res.status(500).json({ error: 'Failed to fetch stats' })
  }
}
