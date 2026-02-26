import Link from 'next/link'
import Head from 'next/head'

function ErrorPage({ statusCode }) {
  return (
    <>
      <Head>
        <title>Error — Malak Miqdad</title>
      </Head>
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          {statusCode ? `Error ${statusCode}` : 'Something Went Wrong'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {statusCode === 500
            ? 'An internal server error occurred. Please try again later.'
            : 'An unexpected error occurred. Please try refreshing the page.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.location.reload()} className="btn">Refresh</button>
          <Link href="/" className="btn-outline">Go Home</Link>
        </div>
      </div>
    </>
  )
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default ErrorPage
