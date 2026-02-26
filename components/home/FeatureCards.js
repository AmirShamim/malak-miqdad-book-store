import { m } from 'framer-motion'
import b from '../../styles/bento.module.css'

const CARDS = [
  { title: 'Resourceful Techniques', desc: 'Fuel-saving cooking, substitutions for scarce ingredients, and improvisation strategies refined under restriction.', iconPath: 'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z' },
  { title: 'Cultural Preservation', desc: 'Traditional flavors adapted for limited supplies — keeping identity alive even when resources are not.', iconPath: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z' },
  { title: 'Real Impact', desc: 'Every purchase supports ongoing e-learning and basic essentials for a family navigating crisis.', iconPath: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
]

export default function FeatureCards() {
  return (
    <section className="mt-24 sm:mt-32 mb-8">
      <div className="text-center mb-14">
        <div className="ornament mx-auto mb-5 max-w-[100px]"><span>Why</span></div>
        <h2 className="text-3xl sm:text-4xl font-display font-semibold text-[#2d2a26] dark:text-[#e8e4df]">More Than Recipes</h2>
      </div>
      <div className={`${b['liquid-glass-container']} rounded-[2rem] p-3 sm:p-4`}>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          {CARDS.map((card, i) => (
            <m.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className={`${b['bento-feature-card']} text-center py-10 px-7`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/40 dark:bg-white/[0.06] flex items-center justify-center mx-auto mb-5 border border-white/30 dark:border-white/[0.08]">
                <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d={card.iconPath} /></svg>
              </div>
              <h3 className="font-semibold text-base tracking-tight text-[#2d2a26] dark:text-[#e8e4df] mb-2">{card.title}</h3>
              <p className="text-[13px] text-[#8a8580] dark:text-[#9b9590] leading-relaxed max-w-xs mx-auto">{card.desc}</p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
