import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthContext'
import { formatPrice } from '../../lib/format'

export default function AdminOrders() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (authLoading) return
    if (!user || !isAdmin) { router.replace('/'); return }
    fetchOrders()
  }, [user, isAdmin, authLoading, router])

  async function fetchOrders() {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })
    const data = await res.json()
    if (res.ok) setOrders(data.orders || [])
    setLoading(false)
  }

  if (authLoading || !isAdmin) return null

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <>
      <Head><title>Orders — Admin</title></Head>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Orders</h1>
          <Link href="/admin" className="text-sm text-brand-600">← Dashboard</Link>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'paid', 'pending', 'failed', 'refunded'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${filter === f ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="prose-card animate-pulse h-16" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">No orders found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => (
              <div key={order.id} className="prose-card">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                      {order.products?.title || 'Product'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {order.profiles?.full_name || order.profiles?.email || 'Unknown'} •{' '}
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-sm">{formatPrice(order.amount, order.currency)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                      order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>{order.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
