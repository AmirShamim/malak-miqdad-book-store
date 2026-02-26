import Image from 'next/image'
import { m } from 'framer-motion'
import b from '../../styles/bento.module.css'

const ITEMS = [
  { src: '/images/book-preview-1.jpg', alt: 'Recipe pages spread — sweet pastries', span: 'bento-span-tall', label: 'Sweet Pastries' },
  { src: '/images/book-preview-2.jpg', alt: 'Cookbook flat lay with ingredients', span: 'bento-span-wide', label: 'Fresh Ingredients' },
  { src: '/images/cover1.jpg',          alt: 'Book 1 cover — A Book of Sweets', span: '',                label: 'Volume One' },
  { src: '/images/cover2.jpg',          alt: 'Book 2 cover — 15 Famous Palestinian Recipes', span: 'bento-span-tall',  label: 'Volume Two' },
  { src: '/images/book-preview-3.jpg', alt: 'Hands preparing traditional dough', span: 'bento-span-wide', label: 'Traditional Techniques' },
]

export default function BookPreviewBento() {
  return (
    <section className="mb-24 sm:mb-32">
      <div className="text-center mb-14">
        <div className="ornament mx-auto mb-5 max-w-[140px]"><span>Preview</span></div>
        <h2 className="text-3xl sm:text-4xl font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df]">Inside the Books</h2>
        <p className="text-sm text-[#8a8580] dark:text-[#8a8580] mt-3 max-w-lg mx-auto leading-relaxed">A glimpse into the pages — vibrant photography, step-by-step techniques, and stories behind every recipe.</p>
      </div>
      <div className={`${b['liquid-glass-container']} rounded-[2rem] p-3 sm:p-4`}>
        <div className={b['bento-grid']}>
          {ITEMS.map((item, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <span className={b['bento-pill-btn']}>
                  {item.label}
                </span>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
