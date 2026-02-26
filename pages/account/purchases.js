import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthContext'
import { formatPrice } from '../../lib/format'
import { useToast } from '../../components/ToastContext'

export default function Purchases() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const showToast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/signin?returnTo=/account/purchases')
      return
    }

    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*, products(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setOrders(data)
      }
      setLoading(false)
    }

    fetchOrders()
  }, [user, authLoading, router])

  async function handleDownload(orderId) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/downloads/${orderId}`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })
      const data = await res.json()

      if (data.url) {
        window.open(data.url, '_blank')
      } else {
        showToast(data.error || 'Download not available')
      }
    } catch (err) {
      showToast('Failed to generate download link')
    }
  }

  if (authLoading || (!user && !authLoading)) return null

  return (
    <>
      <Head>
        <title>My Purchases — Malak Miqdad</title>
      </Head>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">My Purchases</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="prose-card animate-pulse">
                <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-2/3 mb-3" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="prose-card text-center">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">No purchases yet</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Browse our digital products and make your first purchase.
            </p>
            <Link href="/" className="btn">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const product = order.products
              const statusColors = {
                paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                refunded: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
              }

              return (
                <div key={order.id} className="prose-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {product?.title || 'Product'}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {formatPrice(order.amount, order.currency)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || statusColors.pending}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                        {order.download_count > 0 && ` • Downloaded ${order.download_count} time${order.download_count > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'paid' && (
                        <button
                          onClick={() => handleDownload(order.id)}
                          className="btn px-3 py-1.5 text-xs"
                        >
                          Download
                        </button>
                      )}
                      {product && (
                        <Link href={`/product/${product.id}`} className="btn-outline px-3 py-1.5 text-xs">
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
