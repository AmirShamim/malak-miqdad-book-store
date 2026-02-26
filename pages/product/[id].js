import { getProducts, getProduct, formatPrice } from '../../lib/products'
import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useToast } from '../../components/ToastContext'
import { track } from '../../lib/track'
import { useCart } from '../../components/CartContext'
import { useAuth } from '../../components/AuthContext'
import ConfirmModal from '../../components/ConfirmModal'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'

export async function getStaticPaths() {
  const products = await getProducts()
  return {
    paths: products.map(p => ({ params: { id: String(p.id) } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const product = await getProduct(params.id)
  if (!product) return { notFound: true }
  return { props: { product }, revalidate: 60 }
}

export default function Product({ product }) {
  const router = useRouter()
  const showToast = useToast()
  const { addItem, removeItem, items } = useCart()
  const { user } = useAuth()
  const [confirmModal, setConfirmModal] = useState({ open: false, product: null })
  const [animating, setAnimating] = useState(false)
  const [buying, setBuying] = useState(false)

  if (!product) return <div className="prose-card"><p>Product not found</p></div>

  async function handleBuy() {
    if (!user) {
      router.push(`/auth/signin?returnTo=${encodeURIComponent(`/product/${product.id}`)}`)
      return
    }
    setBuying(true)
    track(`/buy/${product.id}`)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ productId: product.id, userId: user.id }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
      else { showToast(data.error || 'Failed to start checkout') }
    } catch { showToast('Checkout failed') }
    setBuying(false)
  }

  function handleAddProduct() {
    addItem(product)
    showToast('Added to cart', { actionLabel: 'Undo', action: () => { removeItem(product.id); track(`/cart/undo/${product.id}`) } })
    setAnimating(true)
    setTimeout(() => setAnimating(false), 380)
    track(`/cart/add/${product.id}`)
  }

  function requestRemoveProduct() { setConfirmModal({ open: true, product }) }

  function handleRemoveConfirmed() {
    const removed = items.find(i => i.id === product.id)
    const qty = removed?.qty || 1
    removeItem(product.id)
    setConfirmModal({ open: false, product: null })
    showToast('Removed from cart', { actionLabel: 'Undo', action: () => { addItem(product, qty); track(`/cart/undo/${product.id}`) } })
    track(`/cart/remove/${product.id}`)
  }

  function cancelRemove() { setConfirmModal({ open: false, product: null }) }

  const coverUrl = product.cover_url || product.cover
  const accent = product.accent_color || product.accentColor || '#a68b65'
  const inCart = (items || []).some(i => i.id === product.id)

  return (
    <>
      <Head>
        <title>{product.title} — Malak Miqdad</title>
        <meta name="description" content={product.description?.substring(0, 160)} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.description?.substring(0, 160)} />
        <meta property="og:type" content="product" />
        {coverUrl && <meta property="og:image" content={coverUrl} />}
      </Head>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="prose-card overflow-hidden p-0"
          >
            {/* Cover */}
            <div className="relative h-60 sm:h-80 w-full" style={{ backgroundColor: accent }}>
              {coverUrl && (
                <Image src={coverUrl} alt={`${product.title} cover`} layout="fill" objectFit="cover" className="mix-blend-multiply dark:mix-blend-normal" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            <div className="p-7 sm:p-10">
              <div className="ornament mb-5 max-w-[120px]"><span>Volume</span></div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold mb-4 tracking-tight text-[#2d2a26] dark:text-[#e8e4df]">{product.title}</h1>
              <p className="text-[#6b6560] dark:text-[#9b9590] leading-relaxed mb-8 text-sm sm:text-base">{product.description}</p>

              {/* Price + Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-10 pb-8 border-b border-brand-100 dark:border-[#2a2725]">
                <span className="text-3xl font-display font-bold text-[#2d2a26] dark:text-[#e8e4df]">{formatPrice(product.price, product.currency)}</span>
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleBuy} disabled={buying} className="btn">
                    {buying ? 'Processing...' : 'Buy Now'}
                  </button>
                  {inCart ? (
                    <button className={`btn-added ${animating ? 'btn-animate' : ''}`} onClick={requestRemoveProduct} aria-pressed="true">
                      &#10003; In Cart
                    </button>
                  ) : (
                    <button className="btn-outline" onClick={handleAddProduct}>Add to Cart</button>
                  )}
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      const url = `${window.location.origin}/product/${product.id}`
                      navigator.clipboard.writeText(url).then(() => { showToast('Link copied'); track(`/share/${product.id}`) })
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                    Share
                  </button>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="bg-brand-50 dark:bg-[#1e1c19] rounded-2xl p-6">
                  <h3 className="text-[11px] font-semibold text-[#8a8580] dark:text-[#8a8580] mb-4 uppercase tracking-[0.08em]">Inside This Volume</h3>
                  <ul className="text-sm text-[#6b6560] dark:text-[#9b9590] space-y-2.5">
                    <li className="flex items-center gap-2.5"><svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> Ingredient substitutions</li>
                    <li className="flex items-center gap-2.5"><svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> Fuel-saving methods</li>
                    <li className="flex items-center gap-2.5"><svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> Low-cost meal frameworks</li>
                    <li className="flex items-center gap-2.5"><svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> Flavor preservation tips</li>
                  </ul>
                </div>
                <div className="bg-brand-50 dark:bg-[#1e1c19] rounded-2xl p-6">
                  <h3 className="text-[11px] font-semibold text-[#8a8580] dark:text-[#8a8580] mb-4 uppercase tracking-[0.08em]">Format &amp; Delivery</h3>
                  <ul className="text-sm text-[#6b6560] dark:text-[#9b9590] space-y-2.5">
                    <li className="flex items-center gap-2.5"><svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg> Instant digital download</li>
                    <li className="flex items-center gap-2.5"><svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> PDF format</li>
                    <li className="flex items-center gap-2.5"><svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg> Free future updates</li>
                    <li className="flex items-center gap-2.5"><svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> Direct educational support</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Why These Books Exist */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="prose-card"
          >
            <h2 className="text-xl font-display font-semibold mb-4 text-[#2d2a26] dark:text-[#e8e4df]">Why These Books Exist</h2>
            <p className="text-sm text-[#6b6560] dark:text-[#9b9590] leading-relaxed">
              Created during online studies in Gaza, these recipes were written under restriction — carefully documenting ways to cook with limited supplies while honoring cultural memory. Each purchase supports continuity of education and essentials.
            </p>
          </motion.div>

          {/* Sample Recipe */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="prose-card"
          >
            <h2 className="text-xl font-display font-semibold mb-4 text-[#2d2a26] dark:text-[#e8e4df]">Sample Recipe Snippet</h2>
            <div className="bg-brand-50 dark:bg-[#1e1c19] rounded-2xl p-6 text-sm text-[#5a5550] dark:text-[#a5a09a] space-y-3">
              <p className="font-display font-semibold text-base tracking-wide text-[#2d2a26] dark:text-[#e8e4df]">Spiced Lentil Flatbread Base</p>
              <ol className="list-decimal ml-5 space-y-2 text-sm leading-relaxed">
                <li>Soak 1 cup lentils (if time allows) or rinse thoroughly.</li>
                <li>Blend with 1.5 cups water, pinch salt, and spice mix.</li>
                <li>Cook thin layer on low heat pan until set; flip to finish.</li>
                <li>Serve with preserved herb oil or simple yogurt dressing.</li>
              </ol>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="prose-card"
          >
            <h3 className="font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df] mb-3">Support Further</h3>
            <p className="text-sm text-[#8a8580] dark:text-[#9b9590] mb-5 leading-relaxed">Want to do more? Read the full story or explore support options.</p>
            <div className="flex flex-col gap-3">
              <Link href="/story" className="btn-outline text-center text-sm">Read the Story</Link>
              <Link href="/support" className="btn-outline text-center text-sm">Support Options</Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="prose-card"
          >
            <h3 className="font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df] mb-3">Need Design Work?</h3>
            <p className="text-sm text-[#8a8580] dark:text-[#9b9590] mb-5 leading-relaxed">Professional graphic design services — logos, brand identity, social media packs.</p>
            <Link href="/services" className="btn text-center w-full">View Services</Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="prose-card"
          >
            <h3 className="font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df] mb-4">At a Glance</h3>
            <ul className="text-sm text-[#8a8580] dark:text-[#9b9590] space-y-3">
              <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0"></span> Resourceful techniques</li>
              <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0"></span> Cultural preservation</li>
              <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0"></span> Accessible ingredients</li>
              <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0"></span> Direct support impact</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="prose-card"
          >
            <h3 className="font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df] mb-4">Nutrition Focus</h3>
            <p className="text-sm text-[#8a8580] dark:text-[#9b9590] leading-relaxed">Emphasis on fiber, sustaining energy, and adaptable spice balances while minimizing fuel usage.</p>
          </motion.div>
        </aside>
      </div>

      <ConfirmModal open={confirmModal.open} title="Remove item" message={confirmModal.product ? `Remove "${confirmModal.product.title}" from your cart?` : ''} confirmLabel="Remove" cancelLabel="Cancel" onConfirm={handleRemoveConfirmed} onCancel={cancelRemove} />
    </>
  )
}
