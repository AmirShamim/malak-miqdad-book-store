import { useState, useCallback } from 'react'
import { useCart } from '../components/CartContext'
import { useToast } from '../components/ToastContext'
import { track } from '../lib/track'

/**
 * Shared cart add / remove / confirm logic.
 * Used by index.js and product/[id].js.
 */
export function useCartActions() {
  const { addItem, removeItem, items } = useCart()
  const showToast = useToast()
  const [confirmModal, setConfirmModal] = useState({ open: false, product: null })
  const [animatingId, setAnimatingId] = useState(null)

  const handleAdd = useCallback((product, qty = 1) => {
    addItem(product, qty)
    showToast('Added to cart', {
      actionLabel: 'Undo',
      action: () => { removeItem(product.id); track(`/cart/undo/${product.id}`) },
    })
    setAnimatingId(product.id)
    setTimeout(() => setAnimatingId(null), 380)
    track(`/cart/add/${product.id}`)
  }, [addItem, removeItem, showToast])

  const requestRemove = useCallback((product) => {
    setConfirmModal({ open: true, product })
  }, [])

  const handleRemoveConfirmed = useCallback(() => {
    const p = confirmModal.product
    if (!p) return
    const removed = items.find(i => i.id === p.id)
    const qty = removed?.qty || 1
    removeItem(p.id)
    setConfirmModal({ open: false, product: null })
    showToast('Removed from cart', {
      actionLabel: 'Undo',
      action: () => { addItem(p, qty); track(`/cart/undo/${p.id}`) },
    })
    track(`/cart/remove/${p.id}`)
  }, [confirmModal.product, items, removeItem, addItem, showToast])

  const cancelRemove = useCallback(() => {
    setConfirmModal({ open: false, product: null })
  }, [])

  return {
    items,
    confirmModal,
    animatingId,
    handleAdd,
    requestRemove,
    handleRemoveConfirmed,
    cancelRemove,
  }
}
