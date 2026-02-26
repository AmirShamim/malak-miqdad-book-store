import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthContext'
import { useToast } from '../../components/ToastContext'
import { formatPrice } from '../../lib/format'

export default function AdminProducts() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const showToast = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', price: '', cover_url: '', accent_color: '#3b82f6' })

  useEffect(() => {
    if (authLoading) return
    if (!user || !isAdmin) { router.replace('/'); return }
    fetchProducts()
  }, [user, isAdmin, authLoading, router])

  async function fetchProducts() {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/products', {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })
    const data = await res.json()
    if (res.ok) setProducts(data.products || [])
    setLoading(false)
  }

  function startEdit(product) {
    setEditing(product?.id || 'new')
    setForm({
      title: product?.title || '',
      description: product?.description || '',
      price: product ? (product.price / 100).toFixed(2) : '',
      cover_url: product?.cover_url || '',
      accent_color: product?.accent_color || '#3b82f6',
    })
  }

  async function saveProduct(e) {
    e.preventDefault()
    const { data: { session } } = await supabase.auth.getSession()

    const body = {
      title: form.title,
      description: form.description,
      price: Math.round(parseFloat(form.price) * 100),
      cover_url: form.cover_url,
      accent_color: form.accent_color,
    }

    const isNew = editing === 'new'
    const url = isNew ? '/api/admin/products' : `/api/admin/products?id=${editing}`
    const method = isNew ? 'POST' : 'PATCH'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      showToast(isNew ? 'Product created' : 'Product updated')
      setEditing(null)
      fetchProducts()
    } else {
      const data = await res.json()
      showToast(data.error || 'Failed to save')
    }
  }

  if (authLoading || !isAdmin) return null

  return (
    <>
      <Head><title>Products — Admin</title></Head>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Products</h1>
          <div className="flex gap-3">
            <button onClick={() => startEdit(null)} className="btn text-xs">+ Add Product</button>
            <Link href="/admin" className="btn-outline text-xs">← Dashboard</Link>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <form onSubmit={saveProduct} className="prose-card mb-6 space-y-3">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">{editing === 'new' ? 'New Product' : 'Edit Product'}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">Title</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Price (USD)</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-y" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">Cover Image URL</label>
                <input type="url" value={form.cover_url} onChange={e => setForm(p => ({ ...p, cover_url: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Accent Color</label>
                <div className="flex gap-2">
                  <input type="color" value={form.accent_color} onChange={e => setForm(p => ({ ...p, accent_color: e.target.value }))}
                    className="h-9 w-12 rounded cursor-pointer" />
                  <input type="text" value={form.accent_color} onChange={e => setForm(p => ({ ...p, accent_color: e.target.value }))}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn text-xs">Save</button>
              <button type="button" onClick={() => setEditing(null)} className="btn-outline text-xs">Cancel</button>
            </div>
          </form>
        )}

        {/* Product List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="prose-card animate-pulse h-16" />)}
          </div>
        ) : products.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">No products. Add your first one above.</p>
        ) : (
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="prose-card">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {p.cover_url ? (
                        <Image src={p.cover_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: p.accent_color || '#3b82f6' }} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{p.title}</p>
                      <p className="text-xs text-slate-500">{formatPrice(p.price, p.currency)}</p>
                    </div>
                  </div>
                  <button onClick={() => startEdit(p)} className="btn-outline text-xs px-3 py-1">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
