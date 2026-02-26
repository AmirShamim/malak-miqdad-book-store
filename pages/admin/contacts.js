import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthContext'
import { useToast } from '../../components/ToastContext'

export default function AdminContacts() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const showToast = useToast()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user || !isAdmin) { router.replace('/'); return }
    fetchContacts()
  }, [user, isAdmin, authLoading, router])

  async function fetchContacts() {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/contacts', {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })
    const data = await res.json()
    if (res.ok) setContacts(data.contacts || [])
    setLoading(false)
  }

  async function markRead(contactId) {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/admin/contacts', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ id: contactId, is_read: true }),
    })
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, is_read: true } : c))
  }

  function toggleExpand(contactId) {
    setExpanded(prev => prev === contactId ? null : contactId)
    const contact = contacts.find(c => c.id === contactId)
    if (contact && !contact.is_read) markRead(contactId)
  }

  if (authLoading || !isAdmin) return null

  return (
    <>
      <Head><title>Contacts — Admin</title></Head>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Contact Messages</h1>
          <Link href="/admin" className="text-sm text-brand-600">← Dashboard</Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="prose-card animate-pulse h-16" />)}
          </div>
        ) : contacts.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">No messages yet.</p>
        ) : (
          <div className="space-y-3">
            {contacts.map(c => (
              <div key={c.id} className={`prose-card cursor-pointer ${!c.is_read ? 'border-brand-300 dark:border-brand-600' : ''}`}
                onClick={() => toggleExpand(c.id)}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!c.is_read && <span className="w-2 h-2 bg-brand-500 rounded-full shrink-0" />}
                      <p className={`text-sm truncate ${!c.is_read ? 'font-semibold' : 'font-medium'} text-slate-900 dark:text-slate-100`}>
                        {c.name}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{c.email}</p>
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                {expanded === c.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{c.message}</p>
                    <div className="mt-3">
                      <a href={`mailto:${c.email}`}
                        className="btn-outline text-xs px-3 py-1.5">
                        Reply via Email
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
