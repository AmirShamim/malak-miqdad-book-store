import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../components/AuthContext'
import { formatPrice } from '../../../lib/format'
import { useToast } from '../../../components/ToastContext'

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

export default function BookingDetail() {
  const router = useRouter()
  const { id } = router.query
  const { user, loading: authLoading } = useAuth()
  const showToast = useToast()

  const [booking, setBooking] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/auth/signin?returnTo=/account/bookings/${id}`)
      return
    }
    if (!id) return

    async function fetchBooking() {
      const { data, error } = await supabase
        .from('service_bookings')
        .select('*, service_packages(*)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        router.replace('/account/bookings')
        return
      }
      setBooking(data)
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

    fetchBooking()
    fetchMessages()

    // Real-time message subscription
    const channel = supabase
      .channel(`booking-${id}`)
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

        if (data) {
          setMessages(prev => [...prev, data])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, user, authLoading, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    const { error } = await supabase
      .from('booking_messages')
      .insert({
        booking_id: id,
        sender_id: user.id,
        message: newMessage.trim(),
      })

    if (error) {
      showToast('Failed to send message')
    } else {
      setNewMessage('')
    }
    setSending(false)
  }

  async function handlePayment() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/bookings/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ bookingId: id }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        showToast(data.error || 'Payment failed')
      }
    } catch {
      showToast('Payment failed')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
      </div>
    )
  }

  if (!booking) return null

  const pkg = booking.service_packages

  return (
    <>
      <Head>
        <title>{`${pkg?.title || 'Booking'} — Malak Miqdad`}</title>
      </Head>

      <div className="max-w-3xl mx-auto">
        <Link href="/account/bookings" className="text-sm text-brand-600 hover:text-brand-700 mb-4 inline-block">
          ← Back to Bookings
        </Link>

        {/* Booking Info Card */}
        <div className="prose-card mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{pkg?.title}</h1>
              {booking.brand_name && (
                <p className="text-slate-600 dark:text-slate-400 mt-1">Brand: {booking.brand_name}</p>
              )}
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${statusColors[booking.status] || statusColors.pending}`}>
              {statusLabels[booking.status] || booking.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
            {booking.amount && (
              <div>
                <p className="text-slate-500 text-xs">Amount</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{formatPrice(booking.amount, booking.currency)}</p>
              </div>
            )}
            <div>
              <p className="text-slate-500 text-xs">Booked</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {booking.deadline && (
              <div>
                <p className="text-slate-500 text-xs">Deadline</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {new Date(booking.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}
            {pkg?.delivery_days && (
              <div>
                <p className="text-slate-500 text-xs">Delivery</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{pkg.delivery_days} days</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
            <p className="text-slate-500 text-xs mb-1">Project Brief</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{booking.brief}</p>
          </div>

          {booking.reference_urls && booking.reference_urls.length > 0 && (
            <div className="mt-4">
              <p className="text-slate-500 text-xs mb-1">Reference Links</p>
              <div className="flex flex-wrap gap-2">
                {booking.reference_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-brand-600 hover:underline truncate max-w-[200px]">
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Payment CTA */}
          {booking.status === 'payment_pending' && (
            <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                Payment required to start work
              </p>
              <button onClick={handlePayment} className="btn text-sm">
                Pay {booking.amount ? formatPrice(booking.amount, booking.currency) : 'Now'}
              </button>
            </div>
          )}

          {/* Deliverable download */}
          {booking.deliverable_url && ['completed', 'revision'].includes(booking.status) && (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                Your deliverables are ready!
              </p>
              <a href={booking.deliverable_url} target="_blank" rel="noopener noreferrer" className="btn text-sm">
                Download Files
              </a>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="prose-card">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Messages</h2>

          <div className="max-h-96 overflow-y-auto mb-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No messages yet. Send a message to discuss your project.
              </p>
            ) : (
              messages.map(msg => {
                const isMe = msg.sender_id === user.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      isMe
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}>
                      {!isMe && (
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {msg.profiles?.full_name || 'Admin'}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('en-US', {
                          hour: 'numeric', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {!['completed', 'cancelled'].includes(booking.status) && (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="btn px-4 py-2 text-sm disabled:opacity-50"
              >
                {sending ? '...' : 'Send'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
