import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useToast } from '../components/ToastContext'

export default function Support() {
  const showToast = useToast()

  async function handleContactSubmit(e) {
    e.preventDefault()
    const f = e.currentTarget
    const data = { name: f.name.value, email: f.email.value, message: f.message.value }
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (res.ok) {
        f.reset()
        showToast('Message sent - thank you!')
      } else {
        const body = await res.json().catch(() => null)
        const err = body?.errors ? Object.values(body.errors).join(', ') : 'Failed to send message'
        showToast(err)
      }
    } catch {
      showToast('Failed to send message')
    }
  }

  return (
    <>
      <Head>
        <title>Support Malak and Family - Malak Miqdad</title>
        <meta name="description" content="Support Malak's family in Gaza - purchase recipe books, donate, or share. Every contribution helps with relocation, education, and safety." />
      </Head>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}>
            <div className="prose-card p-7 sm:p-8">
              <div className="ornament mb-6 max-w-[120px]"><span>Support</span></div>
              <h1 className="text-2xl sm:text-3xl font-display font-semibold mb-5 tracking-tight text-[#2d2a26] dark:text-[#e8e4df]">Support Malak &amp; Family</h1>
              <p className="text-[#5a5550] dark:text-[#a5a09a] leading-relaxed mb-4">
                My family of 10 is seeking safety and a future outside daily danger. Our goal is relocation to Egypt, rebuilding a home, and continuing education. Each member&apos;s target is <strong className="text-[#2d2a26] dark:text-[#e8e4df]">$5,000</strong> for documents, travel, housing basics, and medical/security needs.
              </p>
              <p className="text-[#8a8580] dark:text-[#9b9590] leading-relaxed text-sm">
                Purchasing the recipe books directly contributes. If you can, an additional donation, no matter how small, helps us replace what was lost and reduce the risk we face each day.
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
            <div className="prose-card p-7 sm:p-8">
              <h2 className="text-xl font-display font-semibold mb-5 text-[#2d2a26] dark:text-[#e8e4df]">How Contributions Are Used</h2>
              <ul className="space-y-3 text-sm text-[#6b6560] dark:text-[#9b9590]">
                {['Travel & relocation documents', 'Temporary safe housing & essentials', 'Medical supplies & health support', 'Connectivity & e-learning equipment', 'Rebuilding a stable learning environment'].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
            <div className="prose-card p-7 sm:p-8">
              <h2 className="text-xl font-display font-semibold mb-5 text-[#2d2a26] dark:text-[#e8e4df]">Non-Financial Help</h2>
              <ul className="space-y-3 text-sm text-[#6b6560] dark:text-[#9b9590]">
                {['Share this website & story', 'Recommend affordable education resources', 'Offer translation or editing help', 'Signal boost on social platforms'].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-[#b5afa8] mt-0.5 flex-shrink-0">&mdash;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        <aside className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="prose-card p-6">
            <h3 className="font-display font-semibold mb-3 text-[#2d2a26] dark:text-[#e8e4df]">Get the Books</h3>
            <p className="text-sm text-[#8a8580] dark:text-[#9b9590] mb-5 leading-relaxed">Instant digital download. Every purchase goes directly toward relocation &amp; education.</p>
            <Link href="/" className="btn text-center w-full">Browse Books</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="prose-card p-6">
            <h3 className="font-display font-semibold mb-3 text-[#2d2a26] dark:text-[#e8e4df]">Donate</h3>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://chuffed.org/project/136236-help-me-and-my-family-get-out-of-gaza"
              className="btn-outline w-full text-center text-sm inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
              Donate via Chuffed
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="prose-card p-6" id="contact">
            <h3 className="font-display font-semibold mb-5 text-[#2d2a26] dark:text-[#e8e4df]">Send a Message</h3>
            <form className="space-y-4" onSubmit={handleContactSubmit}>
              <div>
                <label htmlFor="name" className="label">Name</label>
                <input id="name" name="name" className="input" required />
              </div>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input id="email" name="email" type="email" className="input" required />
              </div>
              <div>
                <label htmlFor="message" className="label">Message</label>
                <textarea id="message" name="message" rows="4" className="input" required />
              </div>
              <button type="submit" className="btn w-full">Send Message</button>
            </form>
          </motion.div>
        </aside>
      </div>
    </>
  )
}