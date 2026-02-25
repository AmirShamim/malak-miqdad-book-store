import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password
    })
    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password')
    } else {
      router.push(router.query.callbackUrl || '/')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="prose-card">
        <h1 className="text-2xl font-bold mb-6 tracking-tight text-slate-900 dark:text-slate-100">Sign In</h1>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-sm text-red-700 dark:text-red-300">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm block mb-1 text-slate-700 dark:text-slate-300">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded px-3 py-2 w-full text-sm" required />
          </div>
          <div>
            <label htmlFor="password" className="text-sm block mb-1 text-slate-700 dark:text-slate-300">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="border rounded px-3 py-2 w-full text-sm" required />
          </div>
          <button type="submit" className="btn w-full justify-center" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 text-center">
          Don&apos;t have an account? <Link href="/auth/signup" className="text-brand-600 dark:text-brand-400 underline">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}
