import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../components/AuthContext'
import { formatPrice } from '../../../lib/products'
import { useToast } from '../../../components/ToastContext'

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  payment_pending: 'Payment Pending',
  in_progress: 'In Progress',
  revision: 'Revision',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function AdminBookings() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const showToast = useToast()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active')

  useEffect(() => {
    if (authLoading) return
    if (!user || !isAdmin) { router.replace('/'); return }
    fetchBookings()
  }, [user, isAdmin, authLoading, router])

  async function fetchBookings() {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/bookings', {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })
    const data = await res.json()
    if (res.ok) setBookings(data.bookings || [])
    setLoading(false)
  }

  if (authLoading || !isAdmin) return null

  const activeStatuses = ['pending', 'accepted', 'payment_pending', 'in_progress', 'revision']
  const filtered = filter === 'active'
    ? bookings.filter(b => activeStatuses.includes(b.status))
    : filter === 'completed'
    ? bookings.filter(b => b.status === 'completed')
    : filter === 'cancelled'
    ? bookings.filter(b => b.status === 'cancelled')
    : bookings

  return (
    <>
      <Head><title>Bookings — Admin</title></Head>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Service Bookings</h1>
          <Link href="/admin" className="text-sm text-brand-600">← Dashboard</Link>
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'active', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${filter === f ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="prose-card animate-pulse h-20" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">No bookings found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map(booking => (
              <Link key={booking.id} href={`/admin/bookings/${booking.id}`} className="block">
                <div className="prose-card hover:border-brand-300 dark:hover:border-brand-600 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {booking.service_packages?.title || 'Service'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {booking.brand_name && `${booking.brand_name} — `}
                        {booking.profiles?.full_name || 'Client'} •{' '}
                        {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{booking.brief}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {booking.amount && (
                        <p className="text-sm font-medium">{formatPrice(booking.amount, booking.currency)}</p>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
