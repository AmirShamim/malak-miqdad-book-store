import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../components/AuthContext'
import { formatPrice } from '../../../lib/format'

const statusLabels = {
  pending: 'Pending Review',
  accepted: 'Accepted',
  payment_pending: 'Payment Required',
  in_progress: 'In Progress',
  revision: 'Revision Submitted',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  payment_pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  in_progress: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  revision: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function Bookings() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/signin?returnTo=/account/bookings')
      return
    }

    async function fetchBookings() {
      const { data, error } = await supabase
        .from('service_bookings')
        .select('*, service_packages(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setBookings(data)
      }
      setLoading(false)
    }

    fetchBookings()
  }, [user, authLoading, router])

  if (authLoading || (!user && !authLoading)) return null

  return (
    <>
      <Head>
        <title>My Bookings — Malak Miqdad</title>
      </Head>

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Bookings</h1>
          <Link href="/services" className="btn text-xs">Book a Service</Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="prose-card animate-pulse">
                <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-2/3 mb-3" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="prose-card text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h2 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">No bookings yet</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Need a logo, brand identity, or social media design? Check out the available packages.
            </p>
            <Link href="/services" className="btn">View Design Services</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => {
              const pkg = booking.service_packages

              return (
                <Link key={booking.id} href={`/account/bookings/${booking.id}`} className="block">
                  <div className="prose-card hover:border-brand-300 dark:hover:border-brand-600 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {pkg?.title || 'Service'}
                        </h3>
                        {booking.brand_name && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Brand: {booking.brand_name}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{booking.brief}</p>
                        <div className="flex items-center gap-3 mt-3">
                          {booking.amount && (
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {formatPrice(booking.amount, booking.currency)}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[booking.status] || statusColors.pending}`}>
                            {statusLabels[booking.status] || booking.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(booking.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                          {booking.deadline && ` • Deadline: ${new Date(booking.deadline).toLocaleDateString()}`}
                        </p>
                      </div>
                      <span className="text-slate-400 text-lg">→</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
