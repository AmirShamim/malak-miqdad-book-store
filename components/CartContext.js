import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('cart')
        if (raw) setItems(JSON.parse(raw))
      } catch (e) {}
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items))
    } catch (e) {}
  }, [items])

  function addItem(item, qty = 1) {
    setItems(current => {
      const found = current.find(i => i.id === item.id)
      if (found) {
        return current.map(i => i.id === item.id ? { ...i, qty: i.qty + qty } : i)
      }
      return [...current, { ...item, qty }]
    })
  }

  function removeItem(id) {
    setItems(current => current.filter(i => i.id !== id))
  }

  function clearCart() {
    setItems([])
  }

  function toggleOpen(next) {
    if (typeof next === 'boolean') setOpen(next)
    else setOpen(v => !v)
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, open, toggleOpen }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(){
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
