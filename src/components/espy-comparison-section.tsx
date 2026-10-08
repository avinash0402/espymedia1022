import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Link } from 'wouter';
import { ShinyCta } from '@/components/shiny-cta';

const comparisons = [
  { feature: 'Custom solutions', others: 'Generic, one-size-fits-all approach', espy: 'Custom-built around your goals' },
  { feature: 'Premium design', others: 'Basic templates', espy: 'Brand-focused, considered design' },
  { feature: 'Mobile optimization', others: 'Often treated as an afterthought', espy: 'Mobile-first responsive experience' },
  { feature: 'Performance', others: 'Basic implementation', espy: 'Speed and performance built in' },
  { feature: 'SEO', others: 'Basic SEO setup', espy: 'Technical and on-page SEO foundations' },
  { feature: 'Conversion focus', others: 'Design without a clear user journey', espy: 'Experiences built to turn visits into action' },
  { feature: 'Ongoing support', others: 'Limited post-launch support', espy: 'Ongoing support and maintenance' },
  { feature: 'Digital services', others: 'Multiple vendors required', espy: 'Design, development, marketing and creative' },
  { feature: 'Communication', others: 'Slow or limited updates', espy: 'Direct, transparent communication' },
  { feature: 'Long-term partnership', others: 'Project ends at delivery', espy: 'Built to support your long-term growth' },
];

export function EspyComparisonSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="espy-comparison relative overflow-hidden border-y border-white/[0.05] bg-zinc-950/40 py-16 md:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -top-48 left-1/2 h-[420px] w-[min(90vw,900px)] -translate-x-1/2 rounded-full bg-[#7c3aed]/[0.08] blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.3 }}
          className="espy-comparison-header mx-auto mb-10 max-w-3xl text-center md:mb-14"
        >
          <p className="section-label justify-center mb-4">The Espy difference</p>
          <h2 className="section-headline mb-5">Why Choose Espy Media?</h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            More than just another agency. We build, design, optimize, and support digital experiences that are built to perform.
          </p>
        </motion.header>

        <div className="espy-comparison-grid relative overflow-hidden rounded-2xl border border-white/[0.09] bg-black/80 p-3 sm:p-5 md:p-7">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[32%] bg-gradient-to-b from-[#7c3aed]/[0.10] via-[#7c3aed]/[0.035] to-transparent md:block" />
          <div className="relative">
            <div className="mb-3 hidden grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1.25fr)] items-center gap-3 px-5 md:grid">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">What matters</span>
              <span className="flex items-center gap-2 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                <X aria-hidden="true" className="h-4 w-4" />
                Others
              </span>
              <span className="flex items-center gap-2 rounded-t-xl border-x border-t border-[#7c3aed]/25 bg-[#7c3aed]/[0.08] px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#c4b5fd]">
                <Check aria-hidden="true" className="h-4 w-4" />
                Espy Media
              </span>
            </div>

            <div className="space-y-2.5">
              {comparisons.map((item, index) => (
                <motion.article
                  key={item.feature}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -1 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.45, delay: prefersReducedMotion ? 0 : index * 0.045, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="espy-comparison-row group grid grid-cols-1 gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 transition-colors duration-300 hover:border-[#a78bfa]/25 hover:bg-white/[0.035] sm:p-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1.25fr)] md:items-center md:gap-3 md:border-transparent md:bg-transparent md:px-5 md:py-3.5 md:hover:border-[#a78bfa]/15"
                >
                  <h3 className="espy-comparison-feature font-manrope text-base font-semibold capitalize tracking-tight text-white sm:text-lg">
                    {item.feature}
                  </h3>
                  <div className="espy-comparison-others min-h-11 rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2.5 md:border-0 md:bg-transparent md:px-4">
                    <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600 md:hidden">Others</span>
                    <div className="flex items-center gap-3">
                      <motion.span
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.65 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : index * 0.045 }}
                        viewport={{ once: true }}
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-zinc-500"
                      >
                        <X aria-hidden="true" className="h-3.5 w-3.5" />
                        <span className="sr-only">Others:</span>
                      </motion.span>
                      <span className="text-sm leading-snug text-zinc-500">{item.others}</span>
                    </div>
                  </div>
                  <div className="espy-comparison-espy min-h-11 rounded-lg border border-[#7c3aed]/15 bg-[#7c3aed]/[0.055] px-3 py-2.5 transition-colors duration-300 group-hover:bg-[#7c3aed]/[0.10] md:border-y-0 md:border-r-0 md:border-l md:border-l-[#7c3aed]/15 md:bg-transparent md:px-4">
                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#a78bfa] md:hidden">Espy Media</span>
                    <div className="flex items-center gap-3">
                      <motion.span
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.65 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : index * 0.045 + 0.04 }}
                        viewport={{ once: true }}
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7c3aed]/20 text-[#c4b5fd] transition-transform duration-300 group-hover:scale-110"
                      >
                        <Check aria-hidden="true" className="h-3.5 w-3.5" />
                        <span className="sr-only">Espy Media:</span>
                      </motion.span>
                      <span className="text-sm leading-snug text-zinc-200">{item.espy}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          viewport={{ once: true, amount: 0.4 }}
          className="mt-12 text-center md:mt-16"
        >
          <h3 className="font-manrope text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to build something better?
          </h3>
          <p className="mx-auto mb-7 mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Let&apos;s turn your idea into a digital experience that actually stands out.
          </p>
          <Link href="/contact">
            <ShinyCta variant="contact">Work With Espy Media</ShinyCta>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
