import { useCart } from './CartContext'
import Link from 'next/link'
import { useToast } from './ToastContext'

export default function CartModal(){
  const { items, removeItem, clearCart, open, toggleOpen, addItem } = useCart()
  const showToast = useToast()

  if (!open) return null

  function buyAll(){
    if (items.length === 0) {
      showToast('Cart is empty')
      return
    }
    // open each gumroad link in a new tab
    items.forEach(i => {
      if (i.gumroadUrl) window.open(i.gumroadUrl, '_blank')
    })
    showToast('Opening purchase links...')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => toggleOpen(false)} />
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 z-10 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Your Cart</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => { clearCart(); showToast('Cart cleared') }} className="btn-outline text-xs">Clear</button>
            <button onClick={() => toggleOpen(false)} className="btn-outline text-xs">Close</button>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          {items.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-400">No items in cart</p>}
          {items.map(it => (
            <div key={it.id} className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{it.title}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{it.currency} {it.price} • qty {it.qty}</div>
              </div>
              <div className="flex gap-2">
                <a href={it.gumroadUrl} target="_blank" rel="noreferrer" className="btn px-3 py-1 text-xs">Buy</a>
                <button onClick={() => { const copy = { ...it }; removeItem(it.id); showToast('Removed from cart', { actionLabel: 'Undo', action: () => { addItem(copy, copy.qty) } }) }} className="btn-outline px-3 py-1 text-xs">Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700 dark:text-slate-300">Total: <b>{items.reduce((s, i) => s + (i.price * i.qty), 0).toFixed(2)}</b></div>
          <div className="flex gap-2">
            <button onClick={buyAll} className="btn">Buy All</button>
            <Link href="/support" className="btn-outline">More Support</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
