import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthContext'
import { formatPrice } from '../../lib/products'

export default function CheckoutSuccess() {
  const router = useRouter()
  const { session_id } = router.query
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session_id || !user) return

    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*, products(*)')
        .eq('stripe_session_id', session_id)
        .eq('user_id', user.id)

      if (!error && data) {
        setOrders(data)
      }
      setLoading(false)
    }

    fetchOrders()
  }, [session_id, user])

  return (
    <>
      <Head>
        <title>Purchase Complete — Malak Miqdad</title>
        <meta name="description" content="Your purchase is complete. Thank you for your support!" />
      </Head>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-lg mx-auto text-center">
        <div className="prose-card">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
          <h1 className="text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">Thank You!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your purchase is complete. You&apos;ll receive a confirmation email with download links shortly.
          </p>

          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-3 mb-6 text-left">
              {orders.map(order => (
                <div key={order.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {order.products?.title || 'Product'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatPrice(order.amount, order.currency)} • {order.status === 'paid' ? '✓ Paid' : 'Processing'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 mb-6">
              Your payment is being processed. Orders will appear in your account shortly.
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Link href="/account/purchases" className="btn justify-center">
              View My Purchases
            </Link>
            <Link href="/" className="btn-outline justify-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  )
}
