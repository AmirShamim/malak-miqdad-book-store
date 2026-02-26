import Link from 'next/link'

export default function ServicesCTA() {
  return (
    <section className="mt-24 sm:mt-32">
      <div className="prose-card bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-[#1a1816] dark:via-[#1d1b18] dark:to-[#1a1816] border border-brand-100 dark:border-[#2a2725] px-8 sm:px-12 py-10 sm:py-14">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
          <div className="flex-1">
            <div className="ornament mb-5 max-w-[140px]"><span>Services</span></div>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold mb-4 text-[#2d2a26] dark:text-[#e8e4df]">Need a Logo or Brand Identity?</h2>
            <p className="text-sm text-[#8a8580] dark:text-[#9b9590] mb-7 max-w-lg leading-relaxed">
              Professional graphic design services — logos, brand identity kits, social media packs, and custom illustrations. Crafted with care and cultural sensitivity.
            </p>
            <Link href="/services" className="btn">View Packages &amp; Pricing</Link>
          </div>
          <div className="w-24 h-24 rounded-2xl bg-brand-100 dark:bg-[#2a2725] flex items-center justify-center flex-shrink-0">
            <svg className="w-11 h-11 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>
          </div>
        </div>
      </div>
    </section>
  )
}
