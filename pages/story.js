import Head from 'next/head'
import Link from 'next/link'
import { m } from 'framer-motion'

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

export default function Story() {
  return (
    <>
      <Head>
        <title>The Story Behind the Books — Malak Miqdad</title>
        <meta name="description" content="How two Palestinian recipe books were born from loss, displacement, and the determination to preserve heritage through food." />
      </Head>

      <div className="max-w-3xl mx-auto">
        <m.div {...fade} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}>
          <div className="ornament mb-6 max-w-[160px]"><span>Behind the Books</span></div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold mb-4 tracking-tight text-[#2d2a26] dark:text-[#e8e4df]">
            Why These Books Exist
          </h1>
          <p className="text-[#8a8580] dark:text-[#9b9590] mb-12 text-sm">A story of food, loss, and quiet defiance</p>
        </m.div>

        <m.article {...fade} transition={{ delay: 0.15, duration: 0.6, ease: [0.4, 0, 0.2, 1] }} className="space-y-8">
          <div className="prose-card p-7 sm:p-8">
            <h2 className="text-xl font-display font-semibold mb-4 text-[#2d2a26] dark:text-[#e8e4df]">When Everything Changed</h2>
            <p className="text-[#5a5550] dark:text-[#a5a09a] leading-relaxed mb-4">
              Our home was destroyed by fire. We lost family members and belongings overnight. For months we moved from one temporary shelter to another — sometimes a tent, sometimes a friend&apos;s floor — carrying only what we could hold.
            </p>
            <p className="text-[#5a5550] dark:text-[#a5a09a] leading-relaxed">
              In that chaos, two things kept me grounded: the routines of e-learning after my university was destroyed, and the daily act of preparing food with whatever we could find.
            </p>
          </div>

          <div className="prose-card p-7 sm:p-8">
            <h2 className="text-xl font-display font-semibold mb-4 text-[#2d2a26] dark:text-[#e8e4df]">Cooking as Survival</h2>
            <p className="text-[#5a5550] dark:text-[#a5a09a] leading-relaxed mb-4">
              Fuel was scarce. Ingredients shifted daily — some weeks no spices, some weeks only one grain. We learned to adapt fast: shorter cook times, one-pot methods, creative substitutions. Every family around us was doing the same.
            </p>
            <p className="text-[#5a5550] dark:text-[#a5a09a] leading-relaxed">
              I started writing things down. Not formal recipes at first — just notes so we wouldn&apos;t forget what worked. Eventually those notes grew into the two volumes you can read today.
            </p>
          </div>

          <div className="prose-card p-7 sm:p-8 bg-brand-50/60 dark:bg-[#1e1c19] border-brand-100 dark:border-[#2a2725]">
            <h2 className="text-xl font-display font-semibold mb-5 text-[#2d2a26] dark:text-[#e8e4df]">What You&apos;ll Find Inside</h2>
            <div className="grid gap-3.5 sm:grid-cols-2">
              {[
                'Fuel-saving one-pot techniques',
                'Substitution guides for scarce ingredients',
                'Traditional Palestinian flavors',
                'Comfort dishes that sustain morale',
                'Water conservation methods',
                'Practical tips for limited kitchens',
              ].map(theme => (
                <div key={theme} className="flex items-start gap-2.5 text-sm text-[#6b6560] dark:text-[#9b9590]">
                  <svg className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  {theme}
                </div>
              ))}
            </div>
          </div>

          <div className="prose-card p-7 sm:p-8">
            <h2 className="text-xl font-display font-semibold mb-4 text-[#2d2a26] dark:text-[#e8e4df]">More Than Recipes</h2>
            <p className="text-[#5a5550] dark:text-[#a5a09a] leading-relaxed">
              These pages are proof that something constructive can come from destruction. They preserve a piece of our food culture and give practical tools to anyone cooking under constraints. Your purchase turns these notes into real support — for education, safety, and a path forward.
            </p>
          </div>

          <div className="prose-card text-center py-10">
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/" className="btn">Get the Books</Link>
              <Link href="/about" className="btn-outline">About Malak</Link>
            </div>
          </div>
        </m.article>
      </div>
    </>
  )
}
