import '../styles/globals.css'
import localFont from 'next/font/local'
import { LazyMotion } from 'framer-motion'

const loadFeatures = () => import('../lib/framer-features').then(mod => mod.default)
import Layout from '../components/Layout'
import { ToastProvider } from '../components/ToastContext'
import { CartProvider } from '../components/CartContext'
import { AuthProvider } from '../components/AuthContext'

const inter = localFont({
  src: '../fonts/Inter-latin-wght-normal.woff2',
  weight: '300 700',
  style: 'normal',
  variable: '--font-inter',
  display: 'swap',
})

const playfair = localFont({
  src: [
    { path: '../fonts/Playfair-Display-latin-wght-normal.woff2', weight: '400 700', style: 'normal' },
    { path: '../fonts/Playfair-Display-latin-wght-italic.woff2', weight: '400 700', style: 'italic' },
  ],
  variable: '--font-playfair',
  display: 'swap',
})

export default function App({ Component, pageProps }) {
  return (
    <div className={`${inter.variable} ${playfair.variable}`}>
      <LazyMotion features={loadFeatures} strict>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </LazyMotion>
    </div>
  )
}
