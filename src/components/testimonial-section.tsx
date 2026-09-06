import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetTestimonials } from '@workspace/api-client-react';

const STATIC_SLIDES = [
  {
    name: 'Rahul Sharma',
    role: 'Founder',
    company: 'TechNova Solutions',
    initial: 'R',
    quote: '"Espy Media rebuilt our entire online presence in under a month. Our enquiries went from a trickle to a flood — the lead volume hasn\'t dropped since day one."',
  },
  {
    name: 'Sarah Lin',
    role: 'Head of Growth',
    company: 'Helix SaaS',
    initial: 'S',
    quote: '"The web redesign doubled our demo bookings within 6 weeks of launch. Zero bloat, pure performance. Best investment we made all year."',
  },
  {
    name: 'Marcus Webb',
    role: 'Founder',
    company: 'Fortis Legal',
    initial: 'M',
    quote: '"Our Google Ads went from burning cash to printing it — 8x ROAS in month three. I genuinely didn\'t think that was possible at our budget."',
  },
  {
    name: 'Priya Nair',
    role: 'Managing Director',
    company: 'Meridian Aesthetic Clinic',
    initial: 'P',
    quote: '"Espy built a lead machine that fills our CRM every single week. The pipeline quality and brand presentation they delivered is exceptional."',
  },
];

const STATS = [
  { value: '4.9', suffix: '/5', label: 'avg. client rating' },
  { value: '50+',  suffix: '',   label: 'projects delivered' },
  { value: '3x',   suffix: '',   label: 'avg. revenue growth' },
];

export function TestimonialSection() {
  const { data: dbTestimonials } = useGetTestimonials({ published: true });
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const slides = (dbTestimonials && dbTestimonials.length > 0)
    ? dbTestimonials.map((t) => ({
        name: t.clientName,
        role: t.role || '',
        company: t.company,
        initial: t.clientName.charAt(0).toUpperCase(),
        quote: `"${t.quote}"`,
      }))
    : STATIC_SLIDES;

  const go = (next: number) => {
    const n = (next + slides.length) % slides.length;
    setDir(n > active ? 1 : -1);
    setActive(n);
  };

  const slide = slides[active] || STATIC_SLIDES[0];

  return (
    <section className="relative overflow-hidden bg-black py-16 md:py-28 lg:py-36">
      {/* Ambient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full opacity-10"
        style={{ background: '#7c3aed', filter: 'blur(140px)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full opacity-10"
        style={{ background: '#a78bfa', filter: 'blur(150px)' }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium tracking-wide text-slate-300 backdrop-blur-sm">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]"
              style={{ boxShadow: '0 0 8px 2px rgba(167,139,250,0.8)' }}
            />
            Trusted by growing brands across India
          </span>

          <h2 className="mt-5 font-manrope text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
            Clients who stopped{' '}
            <br />
            <span className="testimonial-aurora-text">settling for average results</span>
          </h2>

          <p className="mt-5 max-w-lg mx-auto text-base leading-relaxed text-slate-400 font-inter">
            Real businesses. Real growth. See what happens when design, ads, and strategy work as one.
          </p>
        </div>

        {/* Carousel stage */}
        <div className="relative mx-auto max-w-4xl">
          {/* Ghost peek cards — lg only */}
          <div
            aria-hidden
            className="testimonial-ghost-card pointer-events-none absolute -left-24 top-10 hidden -rotate-6 lg:block xl:-left-32"
          >
            <div className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full bg-[#7c3aed]/60" />
            <svg className="mb-3 h-8 w-8 text-[#7c3aed]/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
            </svg>
            <p className="text-sm leading-relaxed text-slate-300">"Incredible results from day one."</p>
            <p className="mt-2 text-xs text-slate-500">— D. Mehta, Founder</p>
          </div>

          <div
            aria-hidden
            className="testimonial-ghost-card-2 pointer-events-none absolute -right-24 bottom-8 hidden rotate-6 lg:block xl:-right-32"
          >
            <div className="absolute right-0 top-6 bottom-6 w-0.5 rounded-full bg-[#a78bfa]/60" />
            <svg className="mb-3 h-8 w-8 text-[#a78bfa]/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
            </svg>
            <p className="text-sm leading-relaxed text-slate-300">"Best agency we've ever worked with."</p>
            <p className="mt-2 text-xs text-slate-500">— A. Kapoor, CEO</p>
          </div>

          {/* Stage glow halo */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 -z-10 opacity-70"
            style={{
              background:
                'radial-gradient(60% 60% at 20% 20%, rgba(124,58,237,0.35) 0%, transparent 100%), radial-gradient(60% 60% at 80% 80%, rgba(167,139,250,0.38) 0%, transparent 100%)',
              filter: 'blur(60px)',
            }}
          />

          {/* Stage card */}
          <figure className="testimonial-stage-card relative z-10 overflow-hidden rounded-2xl sm:rounded-[2rem] px-5 py-8 sm:px-14 sm:py-14">
            {/* Decorative quote glyph */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-6 right-6 select-none font-manrope font-black leading-none text-white/[0.04]"
              style={{ fontSize: 'clamp(8rem, 16vw, 14rem)', lineHeight: 0.7 }}
            >
              "
            </span>

            {/* Avatar + meta + stars */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative inline-block shrink-0">
                <div
                  aria-hidden
                  className="absolute -inset-0.5 rounded-full opacity-80"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                    filter: 'blur(1px)',
                  }}
                />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 ring-2 ring-black">
                  <span className="font-manrope text-xl font-bold text-white">{slide.initial}</span>
                </div>
              </div>

              <div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`name-${active}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="font-manrope text-base font-semibold text-white"
                  >
                    {slide.name}
                  </motion.p>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`role-${active}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-sm text-slate-400 font-inter"
                  >
                    {slide.role && <>{slide.role} — </>}
                    <span className="text-[#a78bfa]">{slide.company}</span>
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Stars */}
              <div className="ml-auto hidden items-center gap-1 sm:flex" aria-label="Rated 5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="h-4 w-4 fill-[#a78bfa] text-[#a78bfa]" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
            </div>

            {/* Pull quote */}
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={`quote-${active}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="mt-8 font-manrope text-2xl font-medium leading-[1.32] tracking-tight text-white sm:text-[2rem] lg:text-[2.1rem]"
              >
                {slide.quote}
              </motion.blockquote>
            </AnimatePresence>

            {/* Divider */}
            <div className="mt-9 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Dots + arrows */}
            <div className="mt-7 flex items-center justify-between">
              <div className="flex items-center gap-2.5" role="tablist" aria-label="Testimonial slides">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => go(i)}
                    className={`testimonial-dot rounded-full transition-all duration-[350ms] cubic-bezier-smooth ${
                      i === active
                        ? 'h-2 w-7'
                        : 'h-2 w-2 bg-white/20 hover:bg-white/40'
                    }`}
                    style={
                      i === active
                        ? { background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }
                        : undefined
                    }
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  aria-label="Previous testimonial"
                  onClick={() => go(active - 1)}
                  className="testimonial-glass-btn flex h-11 w-11 items-center justify-center rounded-full text-slate-200 transition-all active:scale-95 hover:text-[#a78bfa]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Next testimonial"
                  onClick={() => go(active + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-all hover:bg-[#a78bfa] active:scale-95"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </figure>
        </div>

        {/* Trust stats */}
        <div className="mx-auto mt-20 max-w-3xl border-t border-white/[0.06] pt-10">
          <div className="grid grid-cols-3 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-manrope text-3xl font-semibold text-white">
                  {s.value}
                  <span className="text-[#a78bfa]">{s.suffix}</span>
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400 font-inter">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
