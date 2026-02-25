import portfolio from '../lib/portfolio'
import { useState, useMemo } from 'react'

const categories = ['All', ...Array.from(new Set(portfolio.map(p => p.category)))]

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return portfolio
    return portfolio.filter(p => p.category === activeCategory)
  }, [activeCategory])

  return (
    <>
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-4 tracking-tight text-slate-900 dark:text-slate-100">Design Portfolio</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl">A showcase of graphic design work — from brand identities and book covers to social media campaigns and infographics. Every project tells a story of resilience, heritage, and creativity.</p>
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? 'btn px-3 py-1.5 text-xs' : 'btn-outline px-3 py-1.5 text-xs'}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <div className="product-grid">
        {filtered.map(item => (
          <div key={item.id} className="product-card group">
            <div className={`relative h-40 w-full rounded-lg mb-4 bg-gradient-to-br ${item.accentColor} opacity-90 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
              <span className="text-white/80 text-sm font-medium">{item.category}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-brand-400 dark:group-hover:text-brand-300 transition-colors">{item.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{item.description}</p>
            <div className="flex flex-wrap gap-1 mt-auto pt-2">
              {item.tools.map(tool => (
                <span key={tool} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-medium tracking-wide text-slate-600 dark:text-slate-300">{tool}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <section className="mt-16 prose-card">
        <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">Work With Me</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">I offer graphic design services including brand identity, social media graphics, book covers, posters, and digital product design. Every project is crafted with care and cultural sensitivity.</p>
        <div className="flex flex-wrap gap-3">
          <a href="/support" className="btn">Get in Touch</a>
          <a href="/" className="btn-outline">Browse Products</a>
        </div>
      </section>
    </>
  )
}
