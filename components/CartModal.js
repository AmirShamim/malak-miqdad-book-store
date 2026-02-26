import { useCart } from './CartContext'
import { useAuth } from './AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useToast } from './ToastContext'
import { formatPrice } from '../lib/products'
import { supabase } from '../lib/supabase'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function CartModal() {
  const { items, removeItem, clearCart, open, toggleOpen, addItem } = useCart()
  const { user } = useAuth()
  const showToast = useToast()
  const router = useRouter()
  const [buying, setBuying] = useState(false)

  async function buyAll() {
    if (items.length === 0) { showToast('Cart is empty'); return }
    if (!user) { toggleOpen(false); router.push('/auth/signin?returnTo=/'); return }

    setBuying(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/checkout/create-cart-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ items: items.map(i => ({ productId: i.id, quantity: i.qty })), userId: user.id }),
      })
      const data = await res.json()
      if (data.url) { clearCart(); window.location.href = data.url }
      else { showToast(data.error || 'Failed to start checkout') }
    } catch { showToast('Checkout failed') }
    setBuying(false)
  }

  async function buySingle(item) {
    if (!user) { toggleOpen(false); router.push('/auth/signin?returnTo=/'); return }
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ productId: item.id, userId: user.id }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
      else { showToast(data.error || 'Failed to start checkout') }
    } catch { showToast('Checkout failed') }
  }

  const total = items.reduce((s, i) => s + (i.price * i.qty), 0)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => toggleOpen(false)}
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 h-full w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Cart
                {items.length > 0 && <span className="ml-2 text-sm font-normal text-slate-400">({items.reduce((s, i) => s + i.qty, 0)} items)</span>}
              </h3>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button onClick={() => { clearCart(); showToast('Cart cleared') }} className="btn-ghost text-xs text-red-500 dark:text-red-400 hover:text-red-600">
                    Clear all
                  </button>
                )}
                <button onClick={() => toggleOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Close cart">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Your cart is empty</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Browse our books and add items to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {items.map(it => (
                      <motion.div
                        key={it.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{it.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {formatPrice(it.price, it.currency)} &times; {it.qty}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button onClick={() => buySingle(it)} className="btn px-2.5 py-1 text-xs">Buy</button>
                          <button
                            onClick={() => {
                              const copy = { ...it }
                              removeItem(it.id)
                              showToast('Removed', { actionLabel: 'Undo', action: () => addItem(copy, copy.qty) })
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            aria-label={`Remove ${it.title}`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatPrice(total)}</span>
                </div>
                <button onClick={buyAll} disabled={buying || items.length === 0} className="btn w-full justify-center">
                  {buying ? 'Processing...' : 'Checkout All'}
                </button>
                {!user && (
                  <p className="text-xs text-slate-400 mt-3 text-center">
                    <Link href="/auth/signin" className="text-brand-600 dark:text-brand-400 hover:underline" onClick={() => toggleOpen(false)}>Sign in</Link> to checkout
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
