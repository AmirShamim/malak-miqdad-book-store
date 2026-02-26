import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from './CartContext'
import { useAuth } from './AuthContext'

const CartModal = dynamic(() => import('./CartModal'), { ssr: false })

/* ── SVG Icons ──────────────────────────────────── */
function SunIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}
function MoonIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}
function MenuIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5M3.75 15.75h16.5" />
    </svg>
  )
}
function XIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
function ShoppingBagIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

/* ── Nav Links ──────────────────────────────────── */
const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/story', label: 'Story' },
  { href: '/services', label: 'Services' },
  { href: '/support', label: 'Support' },
]

/* ── Cart Button ────────────────────────────────── */
function CartButton() {
  const { items, toggleOpen } = useCart()
  const count = items.reduce((s, i) => s + i.qty, 0)
  return (
    <button
      onClick={() => toggleOpen(true)}
      aria-label={`Open cart${count > 0 ? `, ${count} items` : ''}`}
      className="nav-icon-btn group"
    >
      <ShoppingBagIcon className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-brand-700 text-white rounded-full px-1 ring-2 ring-white dark:ring-[#121110]"
        >
          {count}
        </motion.span>
      )}
    </button>
  )
}

/* ── User Menu ──────────────────────────────────── */
function UserMenu() {
  const { user, profile, isAdmin, signOut, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  if (loading) return <div className="w-8 h-8 rounded-full skeleton" />

  if (!user) {
    return (
      <Link href="/auth/signin" className="text-xs font-medium tracking-wide uppercase text-brand-700 dark:text-brand-400 hover:text-brand-900 dark:hover:text-brand-300 transition-colors px-3 py-1.5 border border-brand-200 dark:border-brand-800 rounded-full">
        Sign In
      </Link>
    )
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Account'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-brand-200 dark:hover:ring-brand-800 transition-all"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-[#1a1816]" />
        ) : (
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-[#1a1816]">{initials}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#1a1816] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl shadow-premium-xl py-1.5 z-50"
          >
            <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <p className="text-sm font-semibold text-[#2d2a26] dark:text-[#e8e4df] truncate">{displayName}</p>
              <p className="text-xs text-[#7a756e] truncate mt-0.5">{user.email}</p>
            </div>

            <div className="py-1.5">
              <Link href="/account/purchases" onClick={() => setOpen(false)} className="dropdown-item">
                <svg className="w-4 h-4 text-[#b5b0a8]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                My Purchases
              </Link>
              <Link href="/account/bookings" onClick={() => setOpen(false)} className="dropdown-item">
                <svg className="w-4 h-4 text-[#b5b0a8]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                My Bookings
              </Link>
            </div>

            {isAdmin && (
              <>
                <div className="border-t border-black/[0.06] dark:border-white/[0.06] my-1" />
                <Link href="/admin" onClick={() => setOpen(false)} className="dropdown-item text-brand-700 dark:text-brand-400 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
                  Admin Dashboard
                </Link>
              </>
            )}

            <div className="border-t border-black/[0.06] dark:border-white/[0.06] my-1" />
            <button
              onClick={async () => {
                setOpen(false)
                await signOut()
                router.push('/')
              }}
              className="dropdown-item text-red-600 dark:text-red-400 w-full text-left"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── NavLink with active state ──────────────────── */
function NavLink({ href, children }) {
  const router = useRouter()
  const isActive = router.pathname === href || router.pathname.startsWith(href + '/')
  return (
    <Link
      href={href}
      className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
    >
      {children}
    </Link>
  )
}

/* ── MobileNavLink ──────────────────────────────── */
function MobileNavLink({ href, children, onClick }) {
  const router = useRouter()
  const isActive = router.pathname === href || router.pathname.startsWith(href + '/')
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center px-4 py-2.5 mx-2 text-sm font-medium rounded-xl transition-all ${
        isActive
          ? 'text-[#2d2a26] dark:text-[#e8e4df] bg-black/[0.05] dark:bg-white/[0.06]'
          : 'text-[#7a756e] dark:text-[#9b9590] hover:text-[#2d2a26] dark:hover:text-[#e8e4df] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
      }`}
    >
      {children}
    </Link>
  )
}

/* ── Theme Toggle ───────────────────────────────── */
function ThemeToggle({ theme, mounted, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="nav-icon-btn group"
    >
      {mounted ? (
        <motion.span key={theme} initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
          {theme === 'dark' ? <SunIcon className="w-[17px] h-[17px]" /> : <MoonIcon className="w-[17px] h-[17px]" />}
        </motion.span>
      ) : (
        <div className="w-[17px] h-[17px]" />
      )}
    </button>
  )
}

/* ── Layout ─────────────────────────────────────── */
export default function Layout({ children }) {
  const [theme, setTheme] = useState('light')
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    if (stored === 'dark') {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    } else if (stored === 'light') {
      setTheme('light')
      document.documentElement.classList.remove('dark')
    } else if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 12) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [router.asPath])

  // Prefetch all nav routes on mount for instant navigation
  useEffect(() => {
    NAV_LINKS.forEach(link => router.prefetch(link.href))
    router.prefetch('/')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    if (next === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    if (typeof window !== 'undefined') localStorage.setItem('theme', next)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="skip-link">Skip to content</a>

      {/* Header — Floating pill navbar (Spline-style) */}
      <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="flex justify-center px-4 pt-3 md:pt-4">
          <div className={`pointer-events-auto flex items-center h-11 md:h-12 px-1.5 rounded-full transition-all duration-300
            bg-white/70 dark:bg-[#1a1816]/70 backdrop-blur-2xl backdrop-saturate-[1.4]
            border border-black/[0.06] dark:border-white/[0.06]
            shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_-2px_rgba(0,0,0,0.06)]
            dark:shadow-[0_1px_2px_rgba(0,0,0,0.15),0_4px_16px_-2px_rgba(0,0,0,0.25)]
            ${scrolled ? 'bg-white/90 dark:bg-[#1a1816]/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_8px_24px_-4px_rgba(0,0,0,0.35)]' : ''}
          `}>
            {/* Logo */}
            <Link href="/" className="flex items-center px-2.5 md:px-3 group">
              <span className="font-display text-[15px] font-semibold tracking-tight text-[#2d2a26] dark:text-[#e8e4df] group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors whitespace-nowrap">
                Malak Miqdad
              </span>
            </Link>

            {/* Divider */}
            <div className="hidden md:block h-4 w-px bg-black/[0.1] dark:bg-white/[0.1] shrink-0" />

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5 px-1">
              {NAV_LINKS.map(link => (
                <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
              ))}
            </nav>

            {/* Divider */}
            <div className="hidden md:block h-4 w-px bg-black/[0.1] dark:bg-white/[0.1] shrink-0" />

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-0.5 px-1">
              <CartButton />
              <ThemeToggle theme={theme} mounted={mounted} onClick={toggleTheme} />
              <UserMenu />
            </div>

            {/* Mobile actions */}
            <div className="flex md:hidden items-center gap-0.5 pr-1">
              <CartButton />
              <ThemeToggle theme={theme} mounted={mounted} onClick={toggleTheme} />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="nav-icon-btn"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={mobileMenuOpen ? 'x' : 'm'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav panel — floating glass dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="pointer-events-auto md:hidden mx-4 mt-2 rounded-2xl overflow-hidden
                bg-white/80 dark:bg-[#1a1816]/80 backdrop-blur-2xl backdrop-saturate-[1.4]
                border border-black/[0.06] dark:border-white/[0.06]
                shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]"
            >
              <div className="py-2.5">
                {NAV_LINKS.map(link => (
                  <MobileNavLink key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                    {link.label}
                  </MobileNavLink>
                ))}
                <div className="px-3 pt-3 mt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                  <UserMenu />
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <div className="flex-1 layout-container w-full pt-20 sm:pt-24 pb-10 sm:pb-14 lg:pb-16">
        <main id="main">
          {children}
        </main>
      </div>

      <CartModal />

      {/* Footer */}
      <footer className="footer layout-container">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-lg font-semibold text-[#2d2a26] dark:text-[#e8e4df] mb-4">Malak Miqdad</p>
            <p className="text-sm text-[#7a756e] dark:text-[#6b6560] leading-relaxed max-w-xs">
              Recipe books & design services born from resilience. Every purchase supports education and a path forward.
            </p>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2d2a26] dark:text-[#e8e4df] mb-5">Explore</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="footer-link">Digital Products</Link></li>
              <li><Link href="/services" className="footer-link">Design Services</Link></li>
              <li><Link href="/services/portfolio" className="footer-link">Portfolio</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2d2a26] dark:text-[#e8e4df] mb-5">Learn More</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="footer-link">About Malak</Link></li>
              <li><Link href="/story" className="footer-link">The Story</Link></li>
              <li><Link href="/support" className="footer-link">Ways to Help</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2d2a26] dark:text-[#e8e4df] mb-5">Connect</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/support#contact" className="footer-link">Contact</Link></li>
              <li><a href="https://chuffed.org/project/136236-help-me-and-my-family-get-out-of-gaza" target="_blank" rel="noopener noreferrer" className="footer-link">Donate via Chuffed</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-black/[0.04] dark:border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#b5b0a8] dark:text-[#544f49]">&copy; {new Date().getFullYear()} Malak Miqdad. All rights reserved.</p>
          <p className="text-xs text-[#b5b0a8] dark:text-[#544f49] italic">Made with purpose from Gaza</p>
        </div>
      </footer>
    </div>
  )
}
