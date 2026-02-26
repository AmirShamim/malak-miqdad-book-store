import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { getProducts } from '../lib/products'
import { formatPrice } from '../lib/format'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { m } from 'framer-motion'
import { useCheckout } from '../hooks/useCheckout'
import { useCartActions } from '../hooks/useCartActions'
import { Search, X as XIcon } from '../components/Icons'
import h from '../styles/home.module.css'

/* Below-the-fold sections — lazy loaded */
const BookPreviewBento = dynamic(() => import('../components/home/BookPreviewBento'))
const ServicesCTA = dynamic(() => import('../components/home/ServicesCTA'))
const FeatureCards = dynamic(() => import('../components/home/FeatureCards'))
const PortfolioShowcase = dynamic(() => import('../components/home/PortfolioShowcase'))
const ConfirmModal = dynamic(() => import('../components/ConfirmModal'), { ssr: false })

export async function getStaticProps() {
  const products = await getProducts()
  return { props: { products }, revalidate: 60 }
}

export default function Home({ products = [] }){
  const [q, setQ] = useState('')
  const router = useRouter()
  const { buyProduct, buyingId } = useCheckout()
  const { items, confirmModal, animatingId, handleAdd, requestRemove, handleRemoveConfirmed, cancelRemove } = useCartActions()

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
        <link rel="canonical" href="https://malakmiqdad.com" />
        <meta property="og:title" content="Malak Miqdad — Palestinian Recipe Books & Design Services" />
        <meta property="og:description" content="Digital recipe books preserving Palestinian heritage through food, plus professional graphic design services." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://malakmiqdad.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Malak Miqdad — Palestinian Recipe Books & Design Services" />
        <meta name="twitter:description" content="Digital recipe books preserving Palestinian heritage through food, plus professional graphic design services." />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Malak Miqdad',
            url: 'https://malakmiqdad.com',
            description: 'Palestinian recipe books and graphic design services.',
            author: { '@type': 'Person', name: 'Malak Miqdad' },
          }) }}
        />
      </Head>

      {/* Hero */}
      <section className={`relative rounded-3xl px-8 sm:px-12 lg:px-16 py-20 sm:py-28 mb-20 sm:mb-28 overflow-hidden ${h['gradient-hero']}`}>
        <m.div
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
        </m.div>
      </section>

      {/* ── Book Preview Bento (lazy) ── */}
      <BookPreviewBento />

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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b5afa8] pointer-events-none" />
            <input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search books..."
              className="input pl-10 pr-9"
            />
            {q && (
              <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5afa8] hover:text-[#6b6560] dark:hover:text-[#c5c0ba] transition-colors" aria-label="Clear search">
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className={h['product-grid']}>
          {productsToShow.map((p, i) => {
            const inCart = items.some(it => it.id === p.id)
            const accent = p.accent_color || p.accentColor || '#a68b65'
            return (
              <m.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/product/${p.id}`)}
                onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/product/${p.id}`) }}
                className={`${h['product-card']} group`}
              >
                <div
                  className="relative h-52 w-full overflow-hidden"
                  style={{ backgroundColor: accent }}
                >
                  {(p.cover_url || p.cover) && (
                    <Image
                      src={p.cover_url || p.cover}
                      alt={`${p.title} cover`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      style={{ objectFit: 'cover' }}
                      className="mix-blend-multiply dark:mix-blend-normal group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                </div>

                <div className={h['product-card-body']}>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.categories?.slice(0, 3).map(c => (
                      <span key={c} className={`${h.badge} text-[10px]`}>{c}</span>
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
                        onClick={(e) => { e.stopPropagation(); buyProduct(p.id, '/') }}
                        disabled={buyingId === p.id}
                        className="btn px-3 py-1.5 text-xs"
                      >
                        {buyingId === p.id ? '...' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </m.div>
            )
          })}
        </div>

        {productsToShow.length === 0 && q && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-brand-200 dark:text-[#3a3530] mx-auto mb-4" strokeWidth={1} />
            <p className="text-[#8a8580] dark:text-[#8a8580] mb-3">No products match &quot;{q}&quot;</p>
            <button onClick={() => setQ('')} className="btn-ghost">Clear search</button>
          </div>
        )}
      </section>

      <ServicesCTA />
      <FeatureCards />
      <PortfolioShowcase />

      <ConfirmModal open={confirmModal.open} title="Remove item" message={confirmModal.product ? `Remove "${confirmModal.product.title}" from your cart?` : ''} confirmLabel="Remove" cancelLabel="Cancel" onConfirm={handleRemoveConfirmed} onCancel={cancelRemove} />
    </>
  )
}
