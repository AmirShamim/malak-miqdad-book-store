import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from './CartContext'
import CartModal from './CartModal'

function CartButton(){
  const { items, toggleOpen } = useCart()
  return (
    <button onClick={() => toggleOpen(true)} aria-label="Open cart" className="btn-outline px-3 py-1.5 text-xs flex items-center gap-2">
      Cart
      {items.length > 0 && <span className="text-xs bg-brand-600 text-white rounded-full px-2 py-0.5">{items.reduce((s,i) => s + i.qty, 0)}</span>}
    </button>
  )
}

export default function Layout({ children }) {
  const [theme, setTheme] = useState('light')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    if(stored === 'dark') {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    } else if(stored === 'light'){
      setTheme('light')
      document.documentElement.classList.remove('dark')
    } else if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
      setTheme('dark')
      document.documentElement.classList.add('dark')
    }
  setMounted(true)
  }, [])

  function toggleTheme(){
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    if(next === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    if(typeof window !== 'undefined') localStorage.setItem('theme', next)
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="relative z-10 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
        <div className="layout-container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
            <span className="text-brand-600 dark:text-brand-400">Malak Miqdad</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link href="/about" className="hover:text-slate-900 dark:hover:text-slate-200">About</Link>
            <Link href="/story" className="hover:text-slate-900 dark:hover:text-slate-200">Story</Link>
            <Link href="/support" className="hover:text-slate-900 dark:hover:text-slate-200">Support</Link>
            <CartButton />
            <button onClick={toggleTheme} aria-label="Toggle theme" className="btn-outline px-3 py-1.5 text-xs">
              {mounted ? (theme === 'dark' ? 'Light' : 'Dark') : '…'}
            </button>
          </nav>
        </div>
      </header>
      <div className="flex-1 layout-container w-full py-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.main id="main"
            key={router.asPath}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
      <CartModal />
      <footer className="footer layout-container">
        <p>&copy; {new Date().getFullYear()} Malak Miqdad. All rights reserved.</p>
      </footer>
    </div>
  )
}
