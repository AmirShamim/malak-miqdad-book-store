import products from '../../lib/products'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'

export default function Product(){
  const router = useRouter()
  const { id } = router.query
  const product = products.find(p => p.id === id)
  if(!product) return <div className="prose-card"><p>Product not found</p></div>

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-10">
        <div className="prose-card overflow-hidden">
          <div className={`relative h-56 w-full rounded-lg mb-6 bg-gradient-to-br ${product.accentColor}`}>
            {product.cover && (
              <Image src={product.cover} alt={`${product.title} cover`} layout="fill" objectFit="cover" className="mix-blend-multiply dark:mix-blend-normal" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight text-slate-900 dark:text-slate-100">{product.title}</h1>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 text-sm md:text-base">{product.description}</p>
            <div className="flex items-center flex-wrap gap-3 mb-8">
              <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">{product.currency} {product.price}</span>
              <a className="btn" href={product.gumroadUrl} target="_blank" rel="noreferrer">Buy on Gumroad</a>
              <Link href="/support" className="btn-outline">More Ways to Support</Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 uppercase tracking-wide">Inside This Volume</h3>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc ml-4">
                  <li>Ingredient substitutions</li>
                  <li>Fuel-saving methods</li>
                  <li>Low-cost meal frameworks</li>
                  <li>Flavor preservation tips</li>
                </ul>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 uppercase tracking-wide">Format & Delivery</h3>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc ml-4">
                  <li>Instant digital download</li>
                  <li>PDF (EPUB update planned)</li>
                  <li>Free future updates</li>
                  <li>Direct educational support</li>
                </ul>
              </div>
            </div>
        </div>
        <div className="prose-card">
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Why These Books Exist</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Created during online studies in Gaza, these recipes were written under restriction—carefully documenting ways to cook with limited supplies while honoring cultural memory. Each purchase supports continuity of education and essentials.</p>
        </div>
        <div className="prose-card">
          <h2 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">Sample Recipe Snippet</h2>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <p className="font-semibold tracking-wide text-slate-800 dark:text-slate-200">Spiced Lentil Flatbread Base</p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Soak 1 cup lentils (if time allows) or rinse thoroughly.</li>
              <li>Blend with 1.5 cups water, pinch salt, and spice mix.</li>
              <li>Cook thin layer on low heat pan until set; flip to finish.</li>
              <li>Serve with preserved herb oil or simple yogurt dressing.</li>
            </ol>
          </div>
        </div>
      </div>
      <aside className="space-y-6">
        <div className="prose-card">
          <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">Support Further</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Want to do more? Read the full story or explore support options.</p>
            <div className="flex flex-col gap-3">
              <Link href="/story" className="btn-outline text-center">Read the Story</Link>
              <Link href="/support" className="btn-outline text-center">Support Options</Link>
            </div>
        </div>
        <div className="prose-card">
          <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-100">At a Glance</h3>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc ml-5">
            <li>Resourceful techniques</li>
            <li>Cultural preservation</li>
            <li>Accessible ingredients</li>
            <li>Direct support impact</li>
          </ul>
        </div>
        <div className="prose-card">
          <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-100">Nutrition Focus</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Emphasis on fiber, sustaining energy, and adaptable spice balances while minimizing fuel usage.</p>
        </div>
      </aside>
    </div>
  )
}
