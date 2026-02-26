import Image from 'next/image'
import Link from 'next/link'
import { m } from 'framer-motion'
import b from '../../styles/bento.module.css'

const ITEMS = [
  { src: '/images/portfolio-1.jpg', alt: 'Brand identity project', span: 'bento-span-wide', label: 'Brand Identity', cat: 'Branding' },
  { src: '/images/portfolio-2.jpg', alt: 'Logo design collection',  span: '',                label: 'Logo Design',     cat: 'Logo' },
  { src: '/images/portfolio-3.jpg', alt: 'Illustration artwork',    span: 'bento-span-tall', label: 'Illustration',    cat: 'Art' },
  { src: '/images/portfolio-4.jpg', alt: 'Social media templates',  span: '',                label: 'Social Media',    cat: 'Digital' },
  { src: '/images/portfolio-5.jpg', alt: 'Packaging mockup',        span: '',                label: 'Packaging',       cat: 'Print' },
  { src: '/images/portfolio-6.jpg', alt: 'Typography exploration',  span: 'bento-span-wide', label: 'Typography',      cat: 'Type' },
]

export default function PortfolioShowcase() {
  return (
    <section className="mt-24 sm:mt-32 mb-8">
      <div className="text-center mb-14">
        <div className="ornament mx-auto mb-5 max-w-[140px]"><span>Design Work</span></div>
        <h2 className="text-3xl sm:text-4xl font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df]">Portfolio Highlights</h2>
        <p className="text-sm text-[#8a8580] dark:text-[#8a8580] mt-3 max-w-lg mx-auto leading-relaxed">Logos, brand identities, and visual systems crafted with purpose.</p>
      </div>
      <div className={`${b['liquid-glass-container']} rounded-[2rem] p-3 sm:p-4`}>
        <div className={b['bento-grid']}>
          {ITEMS.map((item, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className={`${b['bento-card']} group ${item.span ? b[item.span] : ''}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                style={{ objectFit: 'cover' }}
                className="group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className={b['bento-beige-overlay']} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex items-end justify-between">
                <span className={b['bento-pill-btn']}>
                  {item.label}
                </span>
                <span className={`${b['bento-cat']} text-white/50 group-hover:text-white/70 transition-colors`}>{item.cat}</span>
              </div>
            </m.div>
          ))}
        </div>
      </div>
      <div className="text-center mt-10">
        <Link href="/portfolio" className="btn-outline">View Full Portfolio</Link>
      </div>
    </section>
  )
}
