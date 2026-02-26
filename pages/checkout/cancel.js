import Link from 'next/link'
import Head from 'next/head'
import { motion } from 'framer-motion'

export default function CheckoutCancel() {
  return (
    <>
      <Head>
        <title>Checkout Cancelled — Malak Miqdad</title>
        <meta name="description" content="Your checkout was cancelled. No charges were made." />
      </Head>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-lg mx-auto text-center">
        <div className="prose-card">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
          </div>
          <h1 className="text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">Checkout Cancelled</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            No worries — your payment was cancelled and you haven&apos;t been charged. Your cart items are still saved.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/" className="btn justify-center">
              Back to Store
            </Link>
            <Link href="/support" className="btn-outline justify-center">
              Need Help?
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  )
}
