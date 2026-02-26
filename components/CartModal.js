import { useCart } from './CartContext'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useToast } from './ToastContext'
import { useAuth } from './AuthContext'
import { formatPrice } from '../lib/format'
import { AnimatePresence, m } from 'framer-motion'
import { useCheckout } from '../hooks/useCheckout'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { X, ShoppingBag, Trash2 } from './Icons'

export default function CartModal() {
  const { items, removeItem, clearCart, open, toggleOpen, addItem } = useCart()
  const { user } = useAuth()
  const showToast = useToast()
  const router = useRouter()
  const { buyProduct, buyCart, buyingId } = useCheckout()
  const trapRef = useFocusTrap(open)

  const total = items.reduce((s, i) => s + (i.price * i.qty), 0)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => toggleOpen(false)}
          />

          {/* Cart Panel */}
          <m.div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
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
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" strokeWidth={1} />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Your cart is empty</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Browse our books and add items to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {items.map(it => (
                      <m.div
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
                          <button onClick={() => buyProduct(it.id)} disabled={buyingId === it.id} className="btn px-2.5 py-1 text-xs">{buyingId === it.id ? '...' : 'Buy'}</button>
                          <button
                            onClick={() => {
                              const copy = { ...it }
                              removeItem(it.id)
                              showToast('Removed', { actionLabel: 'Undo', action: () => addItem(copy, copy.qty) })
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            aria-label={`Remove ${it.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </m.div>
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
                <button onClick={() => buyCart(items)} disabled={buyingId === 'cart' || items.length === 0} className="btn w-full justify-center">
                  {buyingId === 'cart' ? 'Processing...' : 'Checkout All'}
                </button>
                {!user && (
                  <p className="text-xs text-slate-400 mt-3 text-center">
                    <Link href="/auth/signin" className="text-brand-600 dark:text-brand-400 hover:underline" onClick={() => toggleOpen(false)}>Sign in</Link> to checkout
                  </p>
                )}
              </div>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  )
}
