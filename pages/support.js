export default function Support(){
  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-8">
        <div className="prose-card">
          <h1 className="text-3xl font-bold mb-5 tracking-tight text-slate-900 dark:text-slate-100">Support Malak & Family</h1>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">My family of 10 is seeking safety and a future outside daily danger. Our goal is relocation to Egypt, rebuilding a home, and continuing education. Each member’s target is <strong>$5,000</strong> for documents, travel, housing basics, and medical/security needs.</p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">Purchasing the recipe books directly contributes. If you can, an additional donation—no matter how small—helps us replace what was lost and reduce the risk we face each day.</p>
        </div>
        <div className="prose-card">
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">How Contributions Are Used</h2>
          <ul className="list-disc ml-5 text-slate-700 dark:text-slate-400 space-y-2 text-sm">
            <li>Travel & relocation documents</li>
            <li>Temporary safe housing & essentials</li>
            <li>Medical supplies & health support</li>
            <li>Connectivity & e‑learning equipment</li>
            <li>Rebuilding a stable learning environment</li>
          </ul>
        </div>
        <div className="prose-card">
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Non‑Financial Help</h2>
          <ul className="list-disc ml-5 text-slate-700 dark:text-slate-400 space-y-2 text-sm">
            <li>Share this website & story</li>
            <li>Recommend affordable education resources</li>
            <li>Offer translation or editing help</li>
            <li>Signal boost on social platforms</li>
          </ul>
        </div>
      </div>
      <aside className="space-y-6">
        <div className="prose-card">
          <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">Get the Books</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Instant digital download via Gumroad. Supports relocation & study needs.</p>
          <a href="/" className="btn text-center w-full">Browse Books</a>
        </div>
        <div className="prose-card">
          <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">Direct Impact</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Every action (purchase, share, donation) moves us closer to safety.</p>
        </div>
        <div className="prose-card">
          <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">Contact / Outreach</h3>
          <a target="_blank" href="https://chuffed.org/project/136236-help-me-and-my-family-get-out-of-gaza" className="text-xs text-slate-600 dark:text-slate-400 dark:hover:text-slate-100 underline"><b>https://chuffed.org/project/136236-help-me-and-my-family-get-out-of-gaza</b></a>
        </div>
        <div className="prose-card">
          <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">Send a Message</h3>
          <form id="contact" className="space-y-3" onSubmit={async (e) => {
            e.preventDefault()
            const f = e.currentTarget
            const data = { name: f.name.value, email: f.email.value, message: f.message.value }
            const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
            if (res.ok) {
              f.reset()
              const evt = await res.json()
              const notice = (evt && evt.ok) ? 'Message sent — thank you' : 'Message sent'
              window.dispatchEvent(new CustomEvent('toast', { detail: notice }))
            } else {
              const body = await res.json().catch(() => null)
              const err = body && body.errors ? Object.values(body.errors).join(', ') : 'Failed to send message'
              window.dispatchEvent(new CustomEvent('toast', { detail: err }))
            }
          }}>
            <div>
              <label htmlFor="name" className="text-xs block mb-1">Name</label>
              <input id="name" name="name" className="border rounded px-3 py-2 w-full text-sm" required />
            </div>
            <div>
              <label htmlFor="email" className="text-xs block mb-1">Email</label>
              <input id="email" name="email" type="email" className="border rounded px-3 py-2 w-full text-sm" required />
            </div>
            <div>
              <label htmlFor="message" className="text-xs block mb-1">Message</label>
              <textarea id="message" name="message" rows="4" className="border rounded px-3 py-2 w-full text-sm" required />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn">Send Message</button>
              <a target="_blank" href="https://chuffed.org/project/136236-help-me-and-my-family-get-out-of-gaza" className="btn-outline">Donate</a>
            </div>
          </form>
        </div>
      </aside>
    </div>
  )
}
