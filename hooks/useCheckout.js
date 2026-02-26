import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { useCart } from '../components/CartContext'
import { track } from '../lib/track'

/**
 * Shared Stripe checkout logic.
 * Used by index.js, product/[id].js, and CartModal.js.
 */
export function useCheckout() {
  const { user, getAccessToken } = useAuth()
  const showToast = useToast()
  const router = useRouter()
  const { clearCart } = useCart()
  const [buyingId, setBuyingId] = useState(null)

  const buyProduct = useCallback(async (productId, returnTo = '/') => {
    if (!user) {
      router.push(`/auth/signin?returnTo=${encodeURIComponent(returnTo)}`)
      return
    }

    setBuyingId(productId)
    track(`/buy/${productId}`)

    try {
      const token = await getAccessToken()
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, userId: user.id }),
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        showToast(data.error || 'Failed to start checkout')
      }
    } catch {
      showToast('Checkout failed')
    }
    setBuyingId(null)
  }, [user, router, showToast, getAccessToken])

  const buyCart = useCallback(async (items) => {
    if (items.length === 0) { showToast('Cart is empty'); return }
    if (!user) {
      router.push('/auth/signin?returnTo=/')
      return
    }

    setBuyingId('cart')
    try {
      const token = await getAccessToken()
      const res = await fetch('/api/checkout/create-cart-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.id, quantity: i.qty })),
          userId: user.id,
        }),
      })
      const data = await res.json()
      if (data.url) {
        clearCart()
        window.location.href = data.url
      } else {
        showToast(data.error || 'Failed to start checkout')
      }
    } catch {
      showToast('Checkout failed')
    }
    setBuyingId(null)
  }, [user, router, showToast, clearCart, getAccessToken])

  return { buyProduct, buyCart, buyingId }
}
