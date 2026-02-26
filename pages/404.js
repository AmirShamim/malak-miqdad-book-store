import Link from 'next/link'
import Head from 'next/head'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found — Malak Miqdad</title>
      </Head>
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">Page Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn">Go Home</Link>
          <Link href="/services" className="btn-outline">View Services</Link>
        </div>
      </div>
    </>
  )
}
