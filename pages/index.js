import Link from 'next/link'
import Image from 'next/image'
import products from '../lib/products'

export default function Home(){
  return (
    <>
      <section className="gradient-hero rounded-3xl px-6 py-20 mb-14 relative overflow-hidden ring-1 ring-slate-200">
        <div className="max-w-3xl">
          <span className="badge mb-4">Cooking • Resilience • Heritage</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6">Preserving Heritage Through Food Under Unimaginable Circumstances</h1>
          <p className="text-lg md:text-xl leading-relaxed text-slate-700 dark:text-slate-200 mb-8">Two recipe volumes created while studying online in Gaza—capturing resourceful, nourishing meals that kept hope alive. Your purchase directly supports continuing education and daily needs.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#books" className="btn">Browse the Books</Link>
            <Link href="/story" className="btn-outline">Read the Story</Link>
          </div>
        </div>
      </section>

      <section id="books" className="site-grid">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Books</h2>
          <p className="text-slate-600 dark:text-slate-200 mb-8 max-w-2xl">Carefully written guides with ingredient substitutions, low-fuel methods, and culturally rooted flavors. Choose a volume to learn more.</p>
          <div className="product-grid">
            {products.map(p => (
              <div key={p.id} className="product-card group overflow-hidden">
                <div className={`relative h-40 w-full rounded-lg mb-4 bg-gradient-to-br ${p.accentColor} opacity-90 group-hover:opacity-100 transition-opacity`}> 
                  {p.cover && (
                    <Image src={p.cover} alt={`${p.title} cover`} layout="fill" objectFit="cover" className="mix-blend-multiply dark:mix-blend-normal" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-brand-400 dark:group-hover:text-brand-300 transition-colors">{p.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-3">{p.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {p.categories?.slice(0,3).map(c => (
                    <span key={c} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-medium tracking-wide text-slate-600 dark:text-slate-300">{c}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.currency} {p.price}</span>
                  <div className="flex gap-2">
                    <Link href={`/product/${p.id}`} className="btn-outline px-3 py-2 text-xs">Details</Link>
                    <a href={p.gumroadUrl} target="_blank" rel="noreferrer" className="btn px-3 py-2 text-xs">Buy</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-20 grid gap-10 md:grid-cols-3">
        <div className="prose-card">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Resourceful Techniques</h3>
          <p className="text-sm text-slate-600 dark:text-slate-200">Fuel-saving cooking, substitutions for scarce ingredients, and improvisation strategies refined under restriction.</p>
        </div>
        <div className="prose-card">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Cultural Preservation</h3>
          <p className="text-sm text-slate-600 dark:text-slate-200">Traditional flavors adapted for limited supplies—keeping identity alive even when resources are not.</p>
        </div>
        <div className="prose-card">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Direct Impact</h3>
          <p className="text-sm text-slate-600 dark:text-slate-200">Every purchase supports ongoing e-learning and basic essentials in Gaza.</p>
        </div>
      </section>
    </>
  )
}
