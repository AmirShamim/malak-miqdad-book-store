import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { m } from 'framer-motion'
import { getServiceSupabase } from '../lib/supabase-server'
import b from '../styles/bento.module.css'

function withTimeout(promise, ms = 4000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

/* Placeholder portfolio items shown when DB is empty */
const PLACEHOLDER_ITEMS = [
  { id: 'p1', title: 'Heritage Brand Identity', description: 'Complete visual identity for a cultural preservation initiative — logo, typography system, and collateral.', image_url: '/images/portfolio-1.jpg', category: 'Branding', client_name: null },
  { id: 'p2', title: 'Artisan Logo Collection', description: 'Hand-crafted logo marks for small businesses and independent creators.', image_url: '/images/portfolio-2.jpg', category: 'Logo', client_name: null },
  { id: 'p3', title: 'Botanical Illustrations', description: 'Detailed botanical artwork for packaging and editorial use, combining tradition with modern aesthetics.', image_url: '/images/portfolio-3.jpg', category: 'Illustration', client_name: null },
  { id: 'p4', title: 'Social Media Templates', description: 'Cohesive social media kit with stories, posts, and highlight covers in a warm editorial style.', image_url: '/images/portfolio-4.jpg', category: 'Digital', client_name: null },
  { id: 'p5', title: 'Product Packaging', description: 'Premium packaging design for specialty food products — labels, boxes, and tissue wraps.', image_url: '/images/portfolio-5.jpg', category: 'Print', client_name: null },
  { id: 'p6', title: 'Display Typography', description: 'Custom lettering and type exploration for editorial spreads and brand headlines.', image_url: '/images/portfolio-6.jpg', category: 'Typography', client_name: null },
]

export async function getStaticProps() {
  let items = []

  // Skip Supabase entirely if env vars aren't configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { props: { items }, revalidate: 60 }
  }

  try {
    const supabase = getServiceSupabase()
    if (!supabase) return { props: { items }, revalidate: 60 }
    const { data, error } = await withTimeout(
      supabase
        .from('portfolio')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
    )

    if (!error && data && data.length > 0) {
      items = data
    }
  } catch {
    // empty portfolio — will use placeholders
  }

  return { props: { items }, revalidate: 60 }
}

/* ── Bento span classes for nice asymmetric layout ── */
const BENTO_SPANS = ['bento-span-wide', '', 'bento-span-tall', '', '', 'bento-span-wide']

export default function Portfolio({ items }) {
  const displayItems = items.length > 0 ? items : PLACEHOLDER_ITEMS
  const categories = [...new Set(displayItems.map(i => i.category).filter(Boolean))]

  return (
    <>
      <Head>
        <title>Design Portfolio — Malak Miqdad</title>
        <meta name="description" content="Browse my graphic design portfolio — logos, brand identities, illustrations, and more." />
        <link rel="canonical" href="https://malakmiqdad.com/portfolio" />
      </Head>

      <div className="max-w-6xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-14 sm:mb-16"
        >
          <div className="ornament mx-auto mb-6 max-w-[120px]"><span>Portfolio</span></div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df] mb-5 tracking-tight">Design Portfolio</h1>
          <p className="text-base sm:text-lg text-[#6b6560] dark:text-[#9b9590] max-w-2xl mx-auto leading-relaxed">
            A showcase of recent design projects. Each piece is crafted with attention to detail and brand strategy.
          </p>
        </m.div>

        {categories.length > 1 && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 justify-center mb-10"
          >
            {categories.map(cat => (
              <span key={cat} className="px-3.5 py-1.5 text-xs font-medium bg-white/50 dark:bg-white/[0.06] text-[#6b6560] dark:text-[#9b9590] rounded-full border border-white/60 dark:border-white/[0.08] backdrop-blur-sm">
                {cat}
              </span>
            ))}
          </m.div>
        )}

        {/* Liquid Glass Bento Grid */}
        <div className={`${b['liquid-glass-container']} rounded-[2rem] p-3 sm:p-4`}>
          <div className={b['bento-grid']}>
            {displayItems.map((item, i) => (
              <m.div
                key={item.id}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className={`${b['bento-card']} group ${BENTO_SPANS[i % BENTO_SPANS.length] ? b[BENTO_SPANS[i % BENTO_SPANS.length]] : ''}`}
              >
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className="group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-[#1e1c19] dark:to-[#2a2725] flex items-center justify-center">
                    <svg className="w-10 h-10 text-brand-300 dark:text-[#4a4540]" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5a2.25 2.25 0 002.25 2.25z" /></svg>
                  </div>
                )}
                {/* Beige blur overlay — clears on hover */}
                <div className={b['bento-beige-overlay']} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <h3 className={`${b['bento-title']} text-sm sm:text-base mb-1 drop-shadow-sm`}>{item.title}</h3>
                  {item.description && (
                    <p className={`${b['bento-desc']} text-white/60 text-xs line-clamp-2 mb-2 group-hover:text-white/75 transition-colors`}>{item.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    {item.category && (
                      <span className={`${b['bento-pill-btn']} text-[11px] px-2.5 py-1`}>
                        {item.category}
                      </span>
                    )}
                    {item.client_name && (
                      <span className={`${b['bento-cat']} text-white/40 group-hover:text-white/60 transition-colors`}>for {item.client_name}</span>
                    )}
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <Link href="/services" className="btn">
            View Design Services
          </Link>
        </div>
      </div>
    </>
  )
}
