import Link from 'next/link'
import Image from 'next/image'
import products from '../lib/products'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useToast } from '../components/ToastContext'
import { track } from '../lib/track'
import { useCart } from '../components/CartContext'
import ConfirmModal from '../components/ConfirmModal'

export default function Home(){
  const [q, setQ] = useState('')
  const router = useRouter()
  const showToast = useToast()
  const { addItem, removeItem, items } = useCart()
  const [confirmModal, setConfirmModal] = useState({ open: false, product: null })
  const [animatingId, setAnimatingId] = useState(null)

  function handleAdd(p){
    addItem(p)
    showToast('Added to cart', { actionLabel: 'Undo', action: () => { removeItem(p.id); track(`/cart/undo/${p.id}`) } })
    setAnimatingId(p.id)
    setTimeout(() => setAnimatingId(null), 380)
    track(`/cart/add/${p.id}`)
  }

  function requestRemove(p){
    setConfirmModal({ open: true, product: p })
  }

  function handleRemoveConfirmed(){
    const p = confirmModal.product
    if (!p) return
    const removed = items.find(i => i.id === p.id)
    const qty = removed?.qty || 1
    removeItem(p.id)
    setConfirmModal({ open: false, product: null })
    showToast('Removed from cart', { actionLabel: 'Undo', action: () => { addItem(p, qty); track(`/cart/undo/${p.id}`) } })
    track(`/cart/remove/${p.id}`)
  }

  function cancelRemove(){
    setConfirmModal({ open: false, product: null })
  }

  const productsToShow = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return products
    return products.filter(p => p.title.toLowerCase().includes(term) || (p.categories || []).some(c => c.toLowerCase().includes(term)))
  }, [q])

  return (
    <>
      <section className="gradient-hero rounded-3xl px-6 py-20 mb-14 relative overflow-hidden ring-1 ring-slate-200">
        <div className="max-w-3xl">
          <span className="badge mb-4">Cooking • Resilience • Heritage • Design</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6">Preserving Heritage Through Food Under Unimaginable Circumstances</h1>
          <p className="text-lg md:text-xl leading-relaxed text-slate-700 dark:text-slate-200 mb-8">Recipe volumes and digital design products created while studying online in Gaza—capturing resourceful, nourishing meals and creative design work that kept hope alive. Your purchase directly supports continuing education and daily needs.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#books" className="btn">Browse the Books</Link>
            <Link href="/story" className="btn-outline">Read the Story</Link>
          </div>
        </div>
      </section>

      <section id="books" className="site-grid">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Products</h2>
          <p className="text-slate-600 dark:text-slate-200 mb-4 max-w-2xl">Carefully written guides, design templates, and digital products. Choose an item to learn more.</p>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <label htmlFor="q" className="sr-only">Search books</label>
            <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products or categories" className="border rounded px-3 py-2 text-sm w-full md:w-64" />
            {q && (
              <button className="btn-outline" onClick={() => setQ('')}>Clear</button>
            )}
          </div>

          <div className="product-grid">
            {productsToShow.map(p => {
              const inCart = items.some(i => i.id === p.id)
              return (
                <div key={p.id} role="link" tabIndex={0} onClick={() => router.push(`/product/${p.id}`)} onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/product/${p.id}`) }} className="product-card group overflow-hidden">
                  <div className={`relative h-40 w-full rounded-lg mb-4 bg-gradient-to-br ${p.accentColor} opacity-90 group-hover:opacity-100 transition-opacity`}> 
                    {p.cover && (
                      <Image src={p.cover} alt={`${p.title} cover`} layout="fill" objectFit="cover" className="mix-blend-multiply dark:mix-blend-normal" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-brand-400 dark:group-hover:text-brand-300 transition-colors">{p.title}</h3>
                  {p.type && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-[10px] font-semibold tracking-wide text-brand-700 dark:text-brand-300 mb-2 uppercase">{p.type === 'digital' ? 'Digital Product' : 'Book'}</span>
                  )}
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-3">{p.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {p.categories?.slice(0,3).map(c => (
                      <span key={c} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-medium tracking-wide text-slate-600 dark:text-slate-300">{c}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2 gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.currency} {p.price}</span>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/product/${p.id}`} className="btn-outline px-3 py-2 text-xs">Details</Link>
                      <a href={p.gumroadUrl} target="_blank" rel="noreferrer" onClick={() => { track(`/buy/${p.id}`); showToast('Opening Gumroad…') }} className="btn px-3 py-2 text-xs">Buy</a>
                      {inCart ? (
                        <button className={`btn-added px-3 py-2 text-xs ${animatingId === p.id ? 'btn-animate' : ''}`} onClick={(e) => { e.stopPropagation(); requestRemove(p) }} aria-pressed="true">Added</button>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); handleAdd(p) }} className="btn-outline px-3 py-2 text-xs">Add</button>
                      )} 
                      <button onClick={() => { const url = `${window.location.origin}/product/${p.id}`; navigator.clipboard.writeText(url).then(() => { showToast('Link copied'); track(`/share/${p.id}`) }) }} className="btn-outline px-3 py-2 text-xs">Share</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mt-20 grid gap-10 md:grid-cols-3"> 
        {/* Confirm Modal for remove */}
        <ConfirmModal open={confirmModal.open} title="Remove item" message={confirmModal.product ? `Remove "${confirmModal.product.title}" from your cart?` : ''} confirmLabel="Remove" cancelLabel="Cancel" onConfirm={handleRemoveConfirmed} onCancel={cancelRemove} />
        <div className="prose-card">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Resourceful Techniques</h3>
          <p className="text-sm text-slate-600 dark:text-slate-200">Fuel-saving cooking, substitutions for scarce ingredients, and improvisation strategies refined under restriction.</p>
        </div>
        <div className="prose-card">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Cultural Preservation</h3>
          <p className="text-sm text-slate-600 dark:text-slate-200">Traditional flavors adapted for limited supplies—keeping identity alive even when resources are not.</p>
        </div>
        <div className="prose-card">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Direct Impact</h3>
          <p className="text-sm text-slate-600 dark:text-slate-200">Every purchase supports ongoing e-learning and basic essentials in Gaza.</p>
        </div>
      </section>
    </>
  )
}
