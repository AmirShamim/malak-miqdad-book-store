import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

// This page handles OAuth redirect callbacks from Google, etc.
// Supabase appends tokens as URL hash fragments after OAuth sign-in.
export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Supabase client automatically picks up the tokens from the URL hash
    // and establishes the session. We just need to wait for it and redirect.
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth callback error:', error)
        router.replace('/auth/signin?error=callback_failed')
        return
      }

      if (session) {
        // Successfully authenticated — go to homepage or returnTo
        const returnTo = sessionStorage.getItem('auth_return_to') || '/'
        sessionStorage.removeItem('auth_return_to')
        router.replace(returnTo)
      } else {
        // No session yet — Supabase may still be processing the hash
        // Wait a bit and check again
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          if (retrySession) {
            router.replace('/')
          } else {
            router.replace('/auth/signin')
          }
        }, 1000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="prose-card text-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Completing sign in…</p>
      </div>
    </div>
  )
}
