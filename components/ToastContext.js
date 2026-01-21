import React, { createContext, useContext, useEffect, useState } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(id)
    }
  }, [toast])

  // allow other parts of the app to fire window.dispatchEvent(new CustomEvent('toast',{detail: '...'}))
  useEffect(() => {
    function onToast(e){
      const data = e && e.detail
      if (!data) return
      if (typeof data === 'string') setToast({ message: data })
      else setToast(data)
    }
    window.addEventListener('toast', onToast)
    return () => window.removeEventListener('toast', onToast)
  }, [])

  const showToast = (message, opts = {}) => {
    if (typeof message === 'object' && message !== null) setToast(message)
    else setToast({ message, ...opts })
  } 

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div aria-live="polite" className={`toast ${toast ? 'toast--visible' : ''}`} role="status">
        {toast?.message}
        {toast?.action && (
          <button className="toast-action" onClick={() => { try { toast.action() } catch(e){}; setToast(null) }}>{toast.actionLabel || 'Undo'}</button>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.showToast
}
