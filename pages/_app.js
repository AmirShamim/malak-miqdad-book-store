import '../styles/globals.css'
import Layout from '../components/Layout'
import { ToastProvider } from '../components/ToastContext'
import { CartProvider } from '../components/CartContext'

export default function App({ Component, pageProps }) {
  return (
    <ToastProvider>
      <CartProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </CartProvider>
    </ToastProvider>
  )
}
