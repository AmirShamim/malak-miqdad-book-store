import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function SignUp() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors(data.errors || { general: 'Something went wrong' })
        setLoading(false)
        return
      }
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      })
      setLoading(false)
      if (result?.error) {
        setErrors({ general: 'Account created but sign in failed. Please sign in manually.' })
      } else {
        router.push('/')
      }
    } catch (err) {
      setLoading(false)
      setErrors({ general: 'Network error. Please try again.' })
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="prose-card">
        <h1 className="text-2xl font-bold mb-6 tracking-tight text-slate-900 dark:text-slate-100">Create Account</h1>
        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-sm text-red-700 dark:text-red-300">{errors.general}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm block mb-1 text-slate-700 dark:text-slate-300">Name</label>
            <input id="name" value={name} onChange={e => setName(e.target.value)} className="border rounded px-3 py-2 w-full text-sm" required />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="text-sm block mb-1 text-slate-700 dark:text-slate-300">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded px-3 py-2 w-full text-sm" required />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="text-sm block mb-1 text-slate-700 dark:text-slate-300">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="border rounded px-3 py-2 w-full text-sm" required minLength={6} />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
          <button type="submit" className="btn w-full justify-center" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 text-center">
          Already have an account? <Link href="/auth/signin" className="text-brand-600 dark:text-brand-400 underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
