import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getServiceSupabase } from '../../lib/supabase-server'
import { formatPrice } from '../../lib/products'

const fallbackPackages = [
  {
    id: 'logo-design',
    title: 'Logo Design',
    description: 'A unique, professional logo for your brand. Includes multiple concepts and revisions.',
    price: 15000,
    currency: 'usd',
    delivery_days: 7,
    revisions: 3,
    features: ['3 initial concepts', 'Vector files (SVG, AI)', 'PNG & JPG exports', 'Brand color palette', 'Black & white versions'],
    is_active: true,
  },
  {
    id: 'brand-identity',
    title: 'Brand Identity Package',
    description: 'Complete brand identity including logo, typography, colors, and brand guidelines.',
    price: 40000,
    currency: 'usd',
    delivery_days: 14,
    revisions: 5,
    features: ['Logo design + variations', 'Typography system', 'Color palette', 'Brand guidelines PDF', 'Business card design', 'Social media templates'],
    is_active: true,
  },
  {
    id: 'social-media',
    title: 'Social Media Kit',
    description: 'Eye-catching social media graphics for your brand across all platforms.',
    price: 10000,
    currency: 'usd',
    delivery_days: 5,
    revisions: 2,
    features: ['10 post templates', 'Story templates', 'Profile & cover images', 'Editable Figma files', 'Platform-optimized sizes'],
    is_active: true,
  },
  {
    id: 'custom-illustration',
    title: 'Custom Illustration',
    description: 'Bespoke digital illustrations tailored to your project or brand.',
    price: 20000,
    currency: 'usd',
    delivery_days: 10,
    revisions: 3,
    features: ['Custom digital illustration', 'High-res PNG/JPG', 'Vector source file', 'Commercial license', 'Print-ready resolution'],
    is_active: true,
  },
]

function withTimeout(promise, ms = 4000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

export async function getStaticProps() {
  let packages = fallbackPackages

  try {
    const supabase = getServiceSupabase()
    const { data, error } = await withTimeout(
      supabase
        .from('service_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
    )

    if (!error && data && data.length > 0) {
      packages = data
    }
  } catch {
    // fallback
  }

  return { props: { packages }, revalidate: 60 }
}

export default function Services({ packages }) {
  return (
    <>
      <Head>
        <title>Design Services — Malak Miqdad</title>
        <meta name="description" content="Professional graphic design services including logo design, brand identity, social media kits, and custom illustrations." />
        <meta property="og:title" content="Design Services — Malak Miqdad" />
        <meta property="og:description" content="Professional graphic design services for brands and businesses." />
      </Head>

      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="ornament mx-auto mb-6 max-w-[180px]"><span>Professional Design</span></div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df] mb-6 tracking-tight">
            Design Services
          </h1>
          <p className="text-base sm:text-lg text-[#6b6560] dark:text-[#9b9590] max-w-2xl mx-auto leading-relaxed">
            Need a stunning logo or brand identity? I offer professional graphic design services
            tailored to your brand. Choose a package below or get in touch for custom work.
          </p>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 mb-24 sm:mb-32">
          {packages.map((pkg, i) => {
            const features = Array.isArray(pkg.features) ? pkg.features : []

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="prose-card flex flex-col p-7 sm:p-8"
              >
                <div className="flex-1">
                  <h2 className="text-xl font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df] mb-3">
                    {pkg.title}
                  </h2>
                  <p className="text-sm text-[#8a8580] dark:text-[#9b9590] mb-6 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-display font-bold text-[#2d2a26] dark:text-[#e8e4df]">
                      {formatPrice(pkg.price, pkg.currency)}
                    </span>
                  </div>

                  <div className="flex gap-6 text-xs text-[#8a8580] dark:text-[#8a8580] mb-6 pb-6 border-b border-brand-100 dark:border-[#2a2725]">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                      {pkg.delivery_days} day delivery
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.182-3.182" /></svg>
                      {pkg.revisions} revisions
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-[#5a5550] dark:text-[#a5a09a]">
                        <svg className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/services/book/${pkg.id}`}
                  className="btn w-full text-center justify-center"
                >
                  Book This Package
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTAs */}
        <div className="grid sm:grid-cols-2 gap-8 sm:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="prose-card text-center flex flex-col items-center justify-center py-12"
          >
            <h2 className="text-xl font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df] mb-3">
              Need Something Custom?
            </h2>
            <p className="text-sm text-[#8a8580] dark:text-[#9b9590] mb-6 max-w-xs leading-relaxed">
              Don&apos;t see exactly what you need? Let&apos;s discuss your project.
            </p>
            <Link href="/support" className="btn-outline">
              Contact Me
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="prose-card text-center flex flex-col items-center justify-center py-12"
          >
            <h2 className="text-xl font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df] mb-3">
              View My Work
            </h2>
            <p className="text-sm text-[#8a8580] dark:text-[#9b9590] mb-6 max-w-xs leading-relaxed">
              Check out some of my recent design projects.
            </p>
            <Link href="/services/portfolio" className="btn-outline">
              View Portfolio
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  )
}
