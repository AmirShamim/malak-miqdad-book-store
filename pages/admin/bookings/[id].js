import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../components/AuthContext'
import { formatPrice } from '../../../lib/products'
import { useToast } from '../../../components/ToastContext'

const statusLabels = {
  pending: 'Pending Review',
  accepted: 'Accepted',
  payment_pending: 'Payment Required',
  in_progress: 'In Progress',
  revision: 'Revision',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusTransitions = {
  pending: ['accepted', 'cancelled'],
  accepted: ['payment_pending', 'in_progress', 'cancelled'],
  payment_pending: ['in_progress', 'cancelled'],
  in_progress: ['revision', 'completed', 'cancelled'],
  revision: ['in_progress', 'completed'],
  completed: [],
  cancelled: [],
}

export default function AdminBookingDetail() {
  const router = useRouter()
  const { id } = router.query
  const { user, isAdmin, loading: authLoading } = useAuth()
  const showToast = useToast()

  const [booking, setBooking] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (authLoading) return
    if (!user || !isAdmin) { router.replace('/'); return }
    if (!id) return

    fetchBooking()
    fetchMessages()

    const channel = supabase
      .channel(`admin-booking-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'booking_messages',
        filter: `booking_id=eq.${id}`,
      }, async (payload) => {
        const { data } = await supabase
          .from('booking_messages')
          .select('*, profiles(full_name)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages(prev => [...prev, data])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id, user, isAdmin, authLoading, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchBooking() {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`/api/admin/bookings/${id}`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })
    const data = await res.json()
    if (res.ok) setBooking(data.booking)
    setLoading(false)
  }

  async function fetchMessages() {
    const { data } = await supabase
      .from('booking_messages')
      .select('*, profiles(full_name)')
      .eq('booking_id', id)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  async function updateStatus(newStatus) {
    setUpdating(true)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
    const data = await res.json()
    if (res.ok) {
      setBooking(data.booking)
      showToast(`Status updated to ${statusLabels[newStatus]}`)
    } else {
      showToast(data.error || 'Failed to update status')
    }
    setUpdating(false)
  }

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || sending) return
    setSending(true)
    const { error } = await supabase
      .from('booking_messages')
      .insert({ booking_id: id, sender_id: user.id, message: newMessage.trim() })
    if (error) showToast('Failed to send')
    else setNewMessage('')
    setSending(false)
  }

  if (authLoading || loading) {
    return <div className="max-w-4xl mx-auto"><div className="animate-pulse h-48 bg-slate-100 dark:bg-slate-800 rounded-xl" /></div>
  }

  if (!booking) return null

  const pkg = booking.service_packages
  const client = booking.profiles
  const nextStatuses = statusTransitions[booking.status] || []

  return (
    <>
      <Head><title>Booking: {pkg?.title} — Admin</title></Head>
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/bookings" className="text-sm text-brand-600 hover:text-brand-700 mb-4 inline-block">
          ← Back to Bookings
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="prose-card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{pkg?.title}</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Client: {client?.full_name || client?.email || 'Unknown'} •{' '}
                    {booking.brand_name && `Brand: ${booking.brand_name}`}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  booking.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{statusLabels[booking.status]}</span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mb-4">
                <p className="text-slate-500 text-xs mb-1">Brief</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{booking.brief}</p>
              </div>

              {booking.reference_urls?.length > 0 && (
                <div className="mb-4">
                  <p className="text-slate-500 text-xs mb-1">References</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.reference_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-brand-600 hover:underline">{url}</a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Actions */}
              {nextStatuses.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                  <p className="text-xs text-slate-500 mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {nextStatuses.map(s => (
                      <button key={s} onClick={() => updateStatus(s)} disabled={updating}
                        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-50 ${
                          s === 'cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                          s === 'completed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                          'bg-brand-100 text-brand-700 hover:bg-brand-200'
                        }`}>
                        → {statusLabels[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="prose-card">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Messages</h2>
              <div className="max-h-80 overflow-y-auto mb-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">No messages yet.</p>
                ) : messages.map(msg => {
                  const isMe = msg.sender_id === user.id
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        isMe ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}>
                        {!isMe && <p className="text-xs font-medium mb-1 opacity-70">{msg.profiles?.full_name || 'Client'}</p>}
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              {!['completed', 'cancelled'].includes(booking.status) && (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                    placeholder="Reply to client..." className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  <button type="submit" disabled={!newMessage.trim() || sending} className="btn px-4 py-2 text-sm disabled:opacity-50">
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="prose-card">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-3">Details</h3>
              <dl className="text-xs space-y-2">
                {booking.amount && (
                  <div><dt className="text-slate-500">Amount</dt><dd className="font-medium">{formatPrice(booking.amount, booking.currency)}</dd></div>
                )}
                <div><dt className="text-slate-500">Created</dt><dd>{new Date(booking.created_at).toLocaleDateString()}</dd></div>
                {booking.deadline && (
                  <div><dt className="text-slate-500">Deadline</dt><dd>{new Date(booking.deadline).toLocaleDateString()}</dd></div>
                )}
                {pkg?.delivery_days && (
                  <div><dt className="text-slate-500">Est. Delivery</dt><dd>{pkg.delivery_days} days</dd></div>
                )}
                {pkg?.revisions && (
                  <div><dt className="text-slate-500">Revisions</dt><dd>{pkg.revisions} included</dd></div>
                )}
              </dl>
            </div>

            <div className="prose-card">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-3">Client</h3>
              <dl className="text-xs space-y-2">
                <div><dt className="text-slate-500">Name</dt><dd>{client?.full_name || 'Not provided'}</dd></div>
                <div><dt className="text-slate-500">Email</dt><dd className="truncate">{client?.email || '—'}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
