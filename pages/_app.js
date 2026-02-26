import '../styles/globals.css'
import Layout from '../components/Layout'
import { ToastProvider } from '../components/ToastContext'
import { CartProvider } from '../components/CartContext'
import { AuthProvider } from '../components/AuthContext'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
