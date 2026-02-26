import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthContext'
import { formatPrice } from '../../lib/format'

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user || !isAdmin) {
      router.replace('/')
      return
    }

    fetchDashboard()
  }, [user, isAdmin, authLoading, router])

  async function fetchDashboard() {
    const { data: { session } } = await supabase.auth.getSession()
    const headers = { Authorization: `Bearer ${session?.access_token}` }

    try {
      const res = await fetch('/api/admin/stats', { headers })
      const data = await res.json()
      if (res.ok) {
        setStats(data.stats)
        setRecentOrders(data.recentOrders || [])
        setRecentBookings(data.recentBookings || [])
      }
    } catch {}

    setLoading(false)
  }

  if (authLoading || !isAdmin) return null

  return (
    <>
      <Head>
        <title>Admin Dashboard — Malak Miqdad</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Admin Dashboard</h1>

        {/* Quick Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="prose-card animate-pulse">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3 mb-2" />
                <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="prose-card">
              <p className="text-xs text-slate-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-600">{formatPrice(stats.totalRevenue || 0)}</p>
            </div>
            <div className="prose-card">
              <p className="text-xs text-slate-500 mb-1">Orders</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalOrders || 0}</p>
            </div>
            <div className="prose-card">
              <p className="text-xs text-slate-500 mb-1">Active Bookings</p>
              <p className="text-2xl font-bold text-brand-600">{stats.activeBookings || 0}</p>
            </div>
            <div className="prose-card">
              <p className="text-xs text-slate-500 mb-1">Unread Messages</p>
              <p className="text-2xl font-bold text-orange-600">{stats.unreadContacts || 0}</p>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { href: '/admin/products', label: 'Manage Products', icon: '📦' },
            { href: '/admin/orders', label: 'View Orders', icon: '🧾' },
            { href: '/admin/bookings', label: 'Manage Bookings', icon: '🎨' },
            { href: '/admin/contacts', label: 'Contact Messages', icon: '✉️' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="prose-card hover:border-brand-300 dark:hover:border-brand-600 transition-colors text-center">
              <span className="text-2xl mb-2 block">{link.icon}</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="prose-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs text-brand-600 hover:text-brand-700">View All →</Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-slate-500">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {order.products?.title || 'Product'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.profiles?.full_name || order.profiles?.email || 'Customer'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {formatPrice(order.amount, order.currency)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="prose-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent Bookings</h2>
              <Link href="/admin/bookings" className="text-xs text-brand-600 hover:text-brand-700">View All →</Link>
            </div>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-slate-500">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map(booking => (
                  <Link key={booking.id} href={`/admin/bookings/${booking.id}`} className="flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 py-1 rounded">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {booking.service_packages?.title || 'Service'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.brand_name || booking.profiles?.full_name || 'Client'}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      booking.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {booking.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
