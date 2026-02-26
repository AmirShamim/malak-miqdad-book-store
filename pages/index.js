import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import { getProducts, formatPrice } from '../lib/products'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useToast } from '../components/ToastContext'
import { track } from '../lib/track'
import { useCart } from '../components/CartContext'
import { useAuth } from '../components/AuthContext'
import ConfirmModal from '../components/ConfirmModal'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

export async function getStaticProps() {
  const products = await getProducts()
  return { props: { products }, revalidate: 60 }
}

export default function Home({ products = [] }){
  const [q, setQ] = useState('')
  const router = useRouter()
  const showToast = useToast()
  const { addItem, removeItem, items } = useCart()
  const { user } = useAuth()
  const [confirmModal, setConfirmModal] = useState({ open: false, product: null })
  const [animatingId, setAnimatingId] = useState(null)
  const [buyingId, setBuyingId] = useState(null)

  async function handleBuy(product) {
    if (!user) {
      router.push(`/auth/signin?returnTo=${encodeURIComponent('/')}`)
      return
    }

    setBuyingId(product.id)
    track(`/buy/${product.id}`)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ productId: product.id, userId: user.id }),
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        showToast(data.error || 'Failed to start checkout')
      }
    } catch (err) {
      showToast('Checkout failed')
    }
    setBuyingId(null)
  }

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
  }, [q, products])

  return (
    <>
      <Head>
        <title>Malak Miqdad — Palestinian Recipe Books & Design Services</title>
        <meta name="description" content="Digital recipe books preserving Palestinian heritage through food, plus professional graphic design services. Support education and resilience." />
        <meta property="og:title" content="Malak Miqdad — Palestinian Recipe Books & Design Services" />
        <meta property="og:description" content="Digital recipe books preserving Palestinian heritage through food, plus professional graphic design services." />
        <meta property="og:type" content="website" />
      </Head>

      {/* Hero */}
      <section className="relative rounded-3xl px-8 sm:px-12 lg:px-16 py-20 sm:py-28 mb-20 sm:mb-28 overflow-hidden gradient-hero">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-2xl relative z-10"
        >
          <div className="ornament mb-8 max-w-xs">
            <span>Cooking &middot; Heritage &middot; Design</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-semibold tracking-tight text-[#2d2a26] dark:text-[#e8e4df] mb-6 leading-[1.1]">
            Preserving Heritage<br className="hidden sm:inline" /> Through Food
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-[#6b6560] dark:text-[#9b9590] mb-10 max-w-xl">
            Two recipe volumes born from resilience in Gaza — capturing resourceful, nourishing meals that kept hope alive. Your purchase directly supports education and daily needs.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="#books" className="btn">Explore the Collection</Link>
            <Link href="/story" className="btn-outline">Read the Story</Link>
          </div>
        </motion.div>
      </section>

      {/* ── Book Preview Bento ── */}
      <section className="mb-24 sm:mb-32">
        <div className="text-center mb-14">
          <div className="ornament mx-auto mb-5 max-w-[140px]"><span>Preview</span></div>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df]">Inside the Books</h2>
          <p className="text-sm text-[#8a8580] dark:text-[#8a8580] mt-3 max-w-lg mx-auto leading-relaxed">A glimpse into the pages — vibrant photography, step-by-step techniques, and stories behind every recipe.</p>
        </div>
        <div className="liquid-glass-container rounded-[2rem] p-3 sm:p-4">
          <div className="bento-grid">
            {[
              { src: '/images/book-preview-1.jpg', alt: 'Recipe pages spread — sweet pastries', span: 'bento-tall', label: 'Sweet Pastries' },
              { src: '/images/book-preview-2.jpg', alt: 'Cookbook flat lay with ingredients', span: 'bento-wide', label: 'Fresh Ingredients' },
              { src: '/images/cover1.jpg',          alt: 'Book 1 cover — A Book of Sweets', span: '',           label: 'Volume One' },
              { src: '/images/cover2.jpg',          alt: 'Book 2 cover — 15 Famous Palestinian Recipes', span: 'bento-tall',  label: 'Volume Two' },
              { src: '/images/book-preview-3.jpg', alt: 'Hands preparing traditional dough', span: 'bento-wide', label: 'Traditional Techniques' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className={`bento-card group ${item.span}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                />
                {/* Beige blur overlay — clears on hover */}
                <div className="bento-beige-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <span className="bento-pill-btn">
                    {item.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="books">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="ornament mb-4 max-w-[160px]"><span>The Collection</span></div>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df]">Digital Products</h2>
            <p className="text-sm text-[#8a8580] dark:text-[#8a8580] mt-2 max-w-lg leading-relaxed">
              Carefully written guides with ingredient substitutions, low-fuel methods, and culturally rooted flavors.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <label htmlFor="q" className="sr-only">Search products</label>
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b5afa8] pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search books..."
              className="input pl-10 pr-9"
            />
            {q && (
              <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5afa8] hover:text-[#6b6560] dark:hover:text-[#c5c0ba] transition-colors" aria-label="Clear search">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        <div className="product-grid">
          {productsToShow.map((p, i) => {
            const inCart = items.some(it => it.id === p.id)
            const accent = p.accent_color || p.accentColor || '#a68b65'
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/product/${p.id}`)}
                onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/product/${p.id}`) }}
                className="product-card group"
              >
                <div
                  className="relative h-52 w-full overflow-hidden"
                  style={{ backgroundColor: accent }}
                >
                  {(p.cover_url || p.cover) && (
                    <Image
                      src={p.cover_url || p.cover}
                      alt={`${p.title} cover`}
                      layout="fill"
                      objectFit="cover"
                      className="mix-blend-multiply dark:mix-blend-normal group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                </div>

                <div className="product-card-body">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.categories?.slice(0, 3).map(c => (
                      <span key={c} className="badge text-[10px]">{c}</span>
                    ))}
                  </div>

                  <h3 className="text-base font-semibold text-[#2d2a26] dark:text-[#e8e4df] mb-1.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
                    {p.title}
                  </h3>
                  <p className="text-sm text-[#8a8580] dark:text-[#9b9590] mb-5 line-clamp-2 leading-relaxed">{p.description}</p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-100 dark:border-[#2a2725]" onClick={(e) => e.stopPropagation()}>
                    <span className="text-lg font-bold text-[#2d2a26] dark:text-[#e8e4df]">{formatPrice(p.price, p.currency)}</span>
                    <div className="flex gap-2">
                      {inCart ? (
                        <button
                          className={`btn-added px-3 py-1.5 text-xs ${animatingId === p.id ? 'btn-animate' : ''}`}
                          onClick={(e) => { e.stopPropagation(); requestRemove(p) }}
                          aria-pressed="true"
                        >
                          &#10003; In Cart
                        </button>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); handleAdd(p) }} className="btn-outline px-3 py-1.5 text-xs">
                          Add to Cart
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleBuy(p) }}
                        disabled={buyingId === p.id}
                        className="btn px-3 py-1.5 text-xs"
                      >
                        {buyingId === p.id ? '...' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {productsToShow.length === 0 && q && (
          <div className="text-center py-16">
            <svg className="w-12 h-12 text-brand-200 dark:text-[#3a3530] mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <p className="text-[#8a8580] dark:text-[#8a8580] mb-3">No products match &quot;{q}&quot;</p>
            <button onClick={() => setQ('')} className="btn-ghost">Clear search</button>
          </div>
        )}
      </section>

      {/* Services CTA */}
      <section className="mt-24 sm:mt-32">
        <div className="prose-card bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-[#1a1816] dark:via-[#1d1b18] dark:to-[#1a1816] border border-brand-100 dark:border-[#2a2725] px-8 sm:px-12 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
            <div className="flex-1">
              <div className="ornament mb-5 max-w-[140px]"><span>Services</span></div>
              <h2 className="text-2xl sm:text-3xl font-display font-semibold mb-4 text-[#2d2a26] dark:text-[#e8e4df]">Need a Logo or Brand Identity?</h2>
              <p className="text-sm text-[#8a8580] dark:text-[#9b9590] mb-7 max-w-lg leading-relaxed">
                Professional graphic design services — logos, brand identity kits, social media packs, and custom illustrations. Crafted with care and cultural sensitivity.
              </p>
              <Link href="/services" className="btn">View Packages &amp; Pricing</Link>
            </div>
            <div className="w-24 h-24 rounded-2xl bg-brand-100 dark:bg-[#2a2725] flex items-center justify-center flex-shrink-0">
              <svg className="w-11 h-11 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards — Bento style */}
      <section className="mt-24 sm:mt-32 mb-8">
        <div className="text-center mb-14">
          <div className="ornament mx-auto mb-5 max-w-[100px]"><span>Why</span></div>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df]">More Than Recipes</h2>
        </div>
        <div className="liquid-glass-container rounded-[2rem] p-3 sm:p-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            {[
              { title: 'Resourceful Techniques', desc: 'Fuel-saving cooking, substitutions for scarce ingredients, and improvisation strategies refined under restriction.', iconPath: 'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z' },
              { title: 'Cultural Preservation', desc: 'Traditional flavors adapted for limited supplies — keeping identity alive even when resources are not.', iconPath: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z' },
              { title: 'Real Impact', desc: 'Every purchase supports ongoing e-learning and basic essentials for a family navigating crisis.', iconPath: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.12, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="bento-feature-card text-center py-10 px-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/40 dark:bg-white/[0.06] flex items-center justify-center mx-auto mb-5 border border-white/30 dark:border-white/[0.08]">
                  <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d={card.iconPath} /></svg>
                </div>
                <h3 className="font-display font-semibold text-lg text-[#2d2a26] dark:text-[#e8e4df] mb-3">{card.title}</h3>
                <p className="text-sm text-[#8a8580] dark:text-[#9b9590] leading-relaxed max-w-xs mx-auto">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portfolio Showcase Bento ── */}
      <section className="mt-24 sm:mt-32 mb-8">
        <div className="text-center mb-14">
          <div className="ornament mx-auto mb-5 max-w-[140px]"><span>Design Work</span></div>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df]">Portfolio Highlights</h2>
          <p className="text-sm text-[#8a8580] dark:text-[#8a8580] mt-3 max-w-lg mx-auto leading-relaxed">Logos, brand identities, and visual systems crafted with purpose.</p>
        </div>
        <div className="liquid-glass-container rounded-[2rem] p-3 sm:p-4">
          <div className="bento-grid-portfolio">
            {[
              { src: '/images/portfolio-1.jpg', alt: 'Brand identity project', span: 'bento-p-wide', label: 'Brand Identity', cat: 'Branding' },
              { src: '/images/portfolio-2.jpg', alt: 'Logo design collection',  span: '',            label: 'Logo Design',     cat: 'Logo' },
              { src: '/images/portfolio-3.jpg', alt: 'Illustration artwork',    span: 'bento-p-tall', label: 'Illustration',    cat: 'Art' },
              { src: '/images/portfolio-4.jpg', alt: 'Social media templates',  span: '',            label: 'Social Media',    cat: 'Digital' },
              { src: '/images/portfolio-5.jpg', alt: 'Packaging mockup',        span: '',            label: 'Packaging',       cat: 'Print' },
              { src: '/images/portfolio-6.jpg', alt: 'Typography exploration',  span: 'bento-p-wide', label: 'Typography',      cat: 'Type' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className={`bento-card group ${item.span}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                />
                {/* Beige blur overlay — clears on hover */}
                <div className="bento-beige-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex items-end justify-between">
                  <span className="bento-pill-btn">
                    {item.label}
                  </span>
                  <span className="text-[10px] font-medium tracking-wider uppercase text-white/50 group-hover:text-white/70 transition-colors">{item.cat}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="text-center mt-10">
          <Link href="/services/portfolio" className="btn-outline">View Full Portfolio</Link>
        </div>
      </section>

      <ConfirmModal open={confirmModal.open} title="Remove item" message={confirmModal.product ? `Remove "${confirmModal.product.title}" from your cart?` : ''} confirmLabel="Remove" cancelLabel="Cancel" onConfirm={handleRemoveConfirmed} onCancel={cancelRemove} />
    </>
  )
}
