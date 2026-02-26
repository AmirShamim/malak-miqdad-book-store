import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { getServiceSupabase } from '../../../lib/supabase-server'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../components/AuthContext'
import { useToast } from '../../../components/ToastContext'
import { formatPrice } from '../../../lib/format'

function withTimeout(promise, ms = 1500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { notFound: true }
  }

  try {
    const sb = getServiceSupabase()
    if (!sb) return { notFound: true }
    const { data, error } = await withTimeout(
      sb
        .from('service_packages')
        .select('*')
        .eq('id', params.packageId)
        .eq('is_active', true)
        .single()
    )

    if (error || !data) {
      return { notFound: true }
    }

    return { props: { pkg: data }, revalidate: 60 }
  } catch {
    return { notFound: true }
  }
}

export default function BookService({ pkg }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const showToast = useToast()

  const [form, setForm] = useState({
    brandName: '',
    brief: '',
    referenceUrls: '',
    deadline: '',
  })
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!user) {
      router.push(`/auth/signin?returnTo=/services/book/${pkg.id}`)
      return
    }

    if (!form.brief.trim() || form.brief.trim().length < 20) {
      showToast('Please provide a detailed project brief (at least 20 characters)')
      return
    }

    setSubmitting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          packageId: pkg.id,
          brandName: form.brandName.trim(),
          brief: form.brief.trim(),
          referenceUrls: form.referenceUrls
            .split('\n')
            .map(u => u.trim())
            .filter(Boolean),
          deadline: form.deadline || null,
        }),
      })

      const data = await res.json()

      if (res.ok && data.booking) {
        showToast('Booking submitted! We\'ll review it shortly.')
        router.push(`/account/bookings/${data.booking.id}`)
      } else {
        showToast(data.error || 'Failed to submit booking')
      }
    } catch {
      showToast('Something went wrong')
    }

    setSubmitting(false)
  }

  const features = Array.isArray(pkg.features) ? pkg.features : []

  return (
    <>
      <Head>
        <title>{`Book ${pkg.title} — Malak Miqdad`}</title>
        <meta name="description" content={`Book ${pkg.title} design service. ${pkg.description}`} />
      </Head>

      <div className="max-w-3xl mx-auto">
        <Link href="/services" className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 mb-6 inline-flex items-center gap-1.5 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Back to Services
        </Link>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Form */}
          <div className="md:col-span-3">
            <div className="ornament mb-5 max-w-[100px]"><span>Book</span></div>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df] mb-3">
              {pkg.title}
            </h1>
            <p className="text-sm text-[#8a8580] dark:text-[#9b9590] mb-8 leading-relaxed">
              Fill out the details below and I&apos;ll review your project within 24 hours.
            </p>

            {!user && !authLoading && (
              <div className="mb-8 p-5 bg-accent-50 dark:bg-accent-900/10 border border-accent-200 dark:border-accent-800/30 rounded-2xl">
                <p className="text-sm text-accent-800 dark:text-accent-200">
                  You need to <Link href={`/auth/signin?returnTo=/services/book/${pkg.id}`} className="font-medium underline">sign in</Link> to book a service.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="brandName" className="label">
                  Brand / Company Name <span className="text-[#b5afa8] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  id="brandName"
                  name="brandName"
                  value={form.brandName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Inc."
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="brief" className="label">
                  Project Brief <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="brief"
                  name="brief"
                  value={form.brief}
                  onChange={handleChange}
                  rows={5}
                  required
                  placeholder="Describe your project in detail. What style are you looking for? Target audience? Any preferences for colors, fonts, or mood?"
                  className="input resize-y"
                />
                <p className="text-[11px] text-[#b5afa8] mt-1.5">Minimum 20 characters</p>
              </div>

              <div>
                <label htmlFor="referenceUrls" className="label">
                  Reference Links <span className="text-[#b5afa8] font-normal">(optional)</span>
                </label>
                <textarea
                  id="referenceUrls"
                  name="referenceUrls"
                  value={form.referenceUrls}
                  onChange={handleChange}
                  rows={3}
                  placeholder={"https://example.com/design-i-like\nhttps://dribbble.com/inspiration"}
                  className="input resize-y"
                />
                <p className="text-[11px] text-[#b5afa8] mt-1.5">One URL per line</p>
              </div>

              <div>
                <label htmlFor="deadline" className="label">
                  Preferred Deadline <span className="text-[#b5afa8] font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  min={new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]}
                  className="input"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || (!user && !authLoading)}
                className="btn w-full justify-center disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Booking Request'}
              </button>
            </form>
          </div>

          {/* Package Summary Sidebar */}
          <div className="md:col-span-2">
            <div className="prose-card sticky top-24 p-6">
              <h3 className="font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df] mb-4">{pkg.title}</h3>
              <p className="text-2xl font-display font-bold text-[#2d2a26] dark:text-[#e8e4df] mb-4">
                {formatPrice(pkg.price, pkg.currency)}
              </p>
              <div className="text-xs text-[#8a8580] mb-5 space-y-2 pb-5 border-b border-brand-100 dark:border-[#2a2725]">
                <p className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                  {pkg.delivery_days} day delivery
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                  {pkg.revisions} revisions included
                </p>
              </div>
              <ul className="space-y-2">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[#6b6560] dark:text-[#9b9590]">
                    <svg className="w-3.5 h-3.5 text-brand-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
