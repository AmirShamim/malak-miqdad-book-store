import Head from 'next/head'
import Link from 'next/link'
import { m } from 'framer-motion'

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

export default function About() {
  return (
    <>
      <Head>
        <title>About Malak — Author, Student & Designer</title>
        <meta name="description" content="Malak Miqdad is a student and graphic designer from Gaza. She writes recipe books, studies online, and supports her family of ten." />
      </Head>

      <div className="max-w-3xl mx-auto">
        <m.div {...fade} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}>
          <div className="ornament mb-6 max-w-[240px]"><span>Author &middot; Student &middot; Designer</span></div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold mb-4 tracking-tight text-[#2d2a26] dark:text-[#e8e4df]">
            Meet Malak
          </h1>
          <p className="text-[#8a8580] dark:text-[#9b9590] mb-12 text-sm">From Gaza — building a future through creativity and learning</p>
        </m.div>

        <m.div {...fade} transition={{ delay: 0.15, duration: 0.6, ease: [0.4, 0, 0.2, 1] }} className="space-y-8">
          <div className="prose-card p-7 sm:p-8">
            <h2 className="text-xl font-display font-semibold mb-4 text-[#2d2a26] dark:text-[#e8e4df]">Who I Am</h2>
            <p className="text-[#5a5550] dark:text-[#a5a09a] leading-relaxed mb-4">
              My name is <strong className="text-[#2d2a26] dark:text-[#e8e4df]">Malak Miqdad</strong>. I&apos;m a university student from Gaza studying through e-learning after my campus was destroyed. Alongside my studies I write recipe books that capture Palestinian flavors and teach practical cooking when ingredients and fuel are limited.
            </p>
            <p className="text-[#5a5550] dark:text-[#a5a09a] leading-relaxed">
              I also offer professional graphic design services — logos, brand identities, and illustrations — as a way to earn income, grow creatively, and support my family of ten as we work toward safety and stability.
            </p>
          </div>

          <div className="prose-card p-7 sm:p-8">
            <h2 className="text-xl font-display font-semibold mb-5 text-[#2d2a26] dark:text-[#e8e4df]">What Drives Me</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { label: 'Education', text: 'Continuing my degree online despite connectivity and power challenges.' },
                { label: 'Heritage', text: 'Documenting recipes and traditions so they aren\u2019t lost to displacement.' },
                { label: 'Design', text: 'Creating thoughtful visual work for clients worldwide.' },
                { label: 'Family', text: 'Working toward relocation and a safe home for all ten of us.' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#2d2a26] dark:text-[#e8e4df]">{item.label}</p>
                    <p className="text-sm text-[#8a8580] dark:text-[#9b9590] leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="prose-card text-center py-10">
            <p className="text-[#6b6560] dark:text-[#9b9590] text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Want to know the full story behind the books, or find ways to help?
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/story" className="btn">Read the Full Story</Link>
              <Link href="/support" className="btn-outline">Ways to Support</Link>
            </div>
          </div>
        </m.div>
      </div>
    </>
  )
}
