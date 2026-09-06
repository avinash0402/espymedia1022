import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { NavBar } from '@/components/nav-bar';
import { Footer } from '@/components/footer';
import { useGetGraphicCategories, useGetGraphicWorks } from '@workspace/api-client-react';

type Category = string;

interface PortfolioItem {
  id: number;
  image: string;
  title: string;
  category: Exclude<Category, 'All'>;
  aspect: 'portrait' | 'square' | 'wide' | 'tall';
}

const PORTFOLIO: PortfolioItem[] = [
  { id: 1,  image: 'https://picsum.photos/seed/p1/600/800',  title: 'Luxe Brand Identity',      category: 'Branding', aspect: 'portrait' },
  { id: 2,  image: 'https://picsum.photos/seed/p2/900/506',  title: 'Campaign Banner Series',   category: 'Social',   aspect: 'wide'     },
  { id: 3,  image: 'https://picsum.photos/seed/p3/600/600',  title: 'Logo System',              category: 'Branding', aspect: 'square'   },
  { id: 4,  image: 'https://picsum.photos/seed/p4/506/900',  title: 'Instagram Story Pack',     category: 'Social',   aspect: 'tall'     },
  { id: 5,  image: 'https://picsum.photos/seed/p5/800/600',  title: 'Product Launch Poster',    category: 'Print',    aspect: 'wide'     },
  { id: 6,  image: 'https://picsum.photos/seed/p6/600/800',  title: 'Annual Report Cover',      category: 'Print',    aspect: 'portrait' },
  { id: 7,  image: 'https://picsum.photos/seed/p7/600/600',  title: 'App UI Concept',           category: 'UI',       aspect: 'square'   },
  { id: 8,  image: 'https://picsum.photos/seed/p8/900/506',  title: 'Brand Guidelines Doc',     category: 'Branding', aspect: 'wide'     },
  { id: 9,  image: 'https://picsum.photos/seed/p9/506/900',  title: 'Reel Cover Template',      category: 'Social',   aspect: 'tall'     },
  { id: 10, image: 'https://picsum.photos/seed/p10/600/800', title: 'Event Poster',             category: 'Print',    aspect: 'portrait' },
  { id: 11, image: 'https://picsum.photos/seed/p11/600/600', title: 'Icon Set Design',          category: 'UI',       aspect: 'square'   },
  { id: 12, image: 'https://picsum.photos/seed/p12/800/600', title: 'Ad Creative — Meta',       category: 'Social',   aspect: 'wide'     },
  { id: 13, image: 'https://picsum.photos/seed/p13/600/800', title: 'Packaging Design',         category: 'Print',    aspect: 'portrait' },
  { id: 14, image: 'https://picsum.photos/seed/p14/506/900', title: 'Story Ad — Swipe Up',      category: 'Social',   aspect: 'tall'     },
  { id: 15, image: 'https://picsum.photos/seed/p15/900/506', title: 'Website Hero Mockup',      category: 'UI',       aspect: 'wide'     },
  { id: 16, image: 'https://picsum.photos/seed/p16/600/600', title: 'Brand Pattern',            category: 'Branding', aspect: 'square'   },
  { id: 17, image: 'https://picsum.photos/seed/p17/600/800', title: 'Menu Design',              category: 'Print',    aspect: 'portrait' },
  { id: 18, image: 'https://picsum.photos/seed/p18/900/506', title: 'Carousel Ad Set',          category: 'Social',   aspect: 'wide'     },
];

function getAspectStyle(aspect: PortfolioItem['aspect']) {
  switch (aspect) {
    case 'portrait': return { aspectRatio: '3 / 4' };
    case 'square':   return { aspectRatio: '1 / 1' };
    case 'wide':     return { aspectRatio: '16 / 9' };
    case 'tall':     return { aspectRatio: '9 / 16' };
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  Branding: 'rgba(124,58,237,0.85)',
  Social:   'rgba(99,102,241,0.85)',
  Print:    'rgba(168,85,247,0.85)',
  UI:       'rgba(139,92,246,0.85)',
};

function categoryColor(category: string) {
  return CATEGORY_COLORS[category] || 'rgba(124,58,237,0.85)';
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

interface LightboxProps {
  items: PortfolioItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const [direction, setDirection] = useState(0); // -1 = prev, 1 = next
  const touchStartX = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const item = items[index];

  const go = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= items.length) return;
    setDirection(newIndex > index ? 1 : -1);
    onNavigate(newIndex);
  }, [index, items.length, onNavigate]);

  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  // Scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Scroll active thumbnail into view
  useEffect(() => {
    const container = thumbsRef.current;
    if (!container) return;
    const active = container.children[index] as HTMLElement;
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [index]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) delta > 0 ? next() : prev();
    touchStartX.current = null;
  };

  // Mouse drag (desktop swipe)
  const dragStartX = useRef<number | null>(null);
  const onMouseDown = (e: React.MouseEvent) => { dragStartX.current = e.clientX; };
  const onMouseUp = (e: React.MouseEvent) => {
    if (dragStartX.current === null) return;
    const delta = dragStartX.current - e.clientX;
    if (Math.abs(delta) > 60) delta > 0 ? next() : prev();
    dragStartX.current = null;
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? '55%' : '-55%', opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit:  (d: number) => ({ x: d > 0 ? '-55%' : '55%', opacity: 0, scale: 0.95 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(24px)' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Category + title */}
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="shrink-0 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white/90 tracking-wider uppercase"
            style={{ background: CATEGORY_COLORS[item.category] }}
          >
            {item.category}
          </span>
          <span className="text-sm font-medium text-white/80 truncate">{item.title}</span>
        </div>

        {/* Counter + close */}
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-xs text-slate-500 tabular-nums">
            {index + 1} <span className="text-slate-700">/</span> {items.length}
          </span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 text-slate-400 hover:text-white"
            aria-label="Close lightbox"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Main image area ── */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden select-none"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        style={{ cursor: 'grab' }}
      >
        {/* Prev arrow */}
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          disabled={index === 0}
          className="absolute left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          aria-label="Previous"
        >
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Image */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={item.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 340, damping: 36, mass: 0.9 }}
            className="absolute inset-0 flex items-center justify-center p-6 md:p-12"
            style={{ cursor: 'grab' }}
          >
            <div className="relative max-h-full max-w-full" style={{ maxHeight: 'calc(100vh - 220px)' }}>
              <img
                src={item.image}
                alt={item.title}
                draggable={false}
                className="rounded-xl object-contain w-full h-full"
                style={{
                  maxHeight: 'calc(100vh - 220px)',
                  maxWidth: '100%',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
                }}
                crossOrigin="anonymous"
              />
              {/* Subtle purple rim on image */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(167,139,250,0.12)' }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next arrow */}
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          disabled={index === items.length - 1}
          className="absolute right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          aria-label="Next"
        >
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ── Thumbnail strip ── */}
      <div
        className="shrink-0 px-4 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          ref={thumbsRef}
          className="flex gap-2 overflow-x-auto scrollbar-none py-1 px-0.5"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {items.map((thumb, i) => (
            <button
              key={thumb.id}
              onClick={() => { setDirection(i > index ? 1 : -1); onNavigate(i); }}
              className="shrink-0 relative overflow-hidden rounded-lg transition-all duration-200"
              style={{
                width: 56,
                height: 40,
                scrollSnapAlign: 'center',
                opacity: i === index ? 1 : 0.35,
                transform: i === index ? 'scale(1.06)' : 'scale(1)',
                outline: i === index ? '2px solid rgba(167,139,250,0.7)' : '2px solid transparent',
                outlineOffset: '2px',
                transition: 'opacity 0.2s, transform 0.2s, outline 0.2s',
              }}
              aria-label={thumb.title}
            >
              <img
                src={thumb.image}
                alt={thumb.title}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function GraphicDesign() {
  const { data: cmsWorks } = useGetGraphicWorks();
  const { data: cmsCategories } = useGetGraphicCategories();
  const [active, setActive] = useState<Category>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const cmsItems: PortfolioItem[] = (cmsWorks || [])
    .filter((work) => work.published && work.imageUrl)
    .map((work, index) => ({
      id: work.id,
      image: work.imageUrl,
      title: work.title,
      category: cmsCategories?.find((category) => category.id === work.categoryId)?.name || 'Uncategorized',
      aspect: (['portrait', 'square', 'wide', 'tall'] as const)[index % 4],
    }));
  const portfolio = cmsItems.length > 0 ? cmsItems : PORTFOLIO;
  const categories: Category[] = ['All', ...(cmsItems.length > 0
    ? (cmsCategories || []).filter((category) => cmsItems.some((work) => work.category === category.name)).map((category) => category.name)
    : ['Branding', 'Social', 'Print', 'UI'])];
  const filtered = active === 'All' ? portfolio : portfolio.filter(p => p.category === active);

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full opacity-[0.08]"
          style={{ background: '#7c3aed', filter: 'blur(160px)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center relative z-10"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-8 group"
          >
            <svg className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Home
          </Link>

          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium tracking-wide text-slate-300 backdrop-blur-sm mb-6">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]"
              style={{ boxShadow: '0 0 8px 2px rgba(167,139,250,0.8)' }}
            />
            Graphic Design Portfolio
          </span>

          <h1 className="font-manrope text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl mb-6">
            Work that{' '}
            <span style={{
              background: 'linear-gradient(100deg, #7c3aed 0%, #a78bfa 55%, #c084fc 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent', color: 'transparent',
            }}>
              speaks
            </span>
            <br />before you do.
          </h1>

          <p className="text-base leading-relaxed text-slate-400 max-w-xl mx-auto">
            A curated collection of graphic design work spanning brand identities, social creatives, print, and digital UI — all crafted with intention.
          </p>
        </motion.div>
      </section>

      {/* ── Filter bar ── */}
      <div
        className="sticky top-0 z-30 backdrop-blur-xl border-b border-white/[0.06]"
        style={{ background: 'rgba(0,0,0,0.75)' }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-1.5 py-4 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => { setActive(cat); setLightboxIndex(null); }}
                whileTap={{ scale: 0.95 }}
                className={`relative shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                  active === cat ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {active === cat && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(167,139,250,0.2) 100%)',
                      border: '1px solid rgba(167,139,250,0.3)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{cat}</span>
              </motion.button>
            ))}
            <div className="ml-auto pl-4 shrink-0 text-xs text-slate-600">
              {filtered.length} works
            </div>
          </div>
        </div>
      </div>

      {/* ── Masonry Gallery ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4"
            style={{ columnFill: 'balance' }}
          >
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                onClick={() => openLightbox(i)}
                className="break-inside-avoid group relative overflow-hidden rounded-3xl md:rounded-2xl cursor-pointer mb-4"
                style={getAspectStyle(item.aspect)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  crossOrigin="anonymous"
                  loading="lazy"
                />

                {/* Gradient */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)' }}
                />
                {/* Hover tint */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'rgba(124,58,237,0.12)' }}
                />
                {/* Hover ring */}
                <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-1 ring-[#a78bfa]/30 transition-all duration-300" />

                {/* Category chip */}
                <div className="absolute top-3 left-3">
                  <span
                    className="inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-sm tracking-wider uppercase"
                       style={{ background: categoryColor(item.category) }}
                  >
                    {item.category}
                  </span>
                </div>

                {/* Expand icon on hover */}
                <div
                  className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100"
                  style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                >
                  <svg className="h-3.5 w-3.5 text-white/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-end justify-between gap-2">
                    <p className="text-sm font-medium text-white leading-snug">{item.title}</p>
                    <div
                      className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
                      style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.3)' }}
                    >
                      <svg className="h-3 w-3 text-[#a78bfa]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-600">
            <p className="text-4xl mb-3">✦</p>
            <p className="text-sm">No works in this category yet.</p>
          </div>
        )}
      </section>

      {/* ── CTA strip ── */}
      <section className="relative overflow-hidden border-t border-white/[0.06] py-16 sm:py-24 px-4 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 0%, #7c3aed, transparent)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-xl text-center relative z-10"
        >
          <h2 className="font-manrope text-3xl font-bold text-white mb-4">Like what you see?</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Let's create something that makes your brand unforgettable. We're currently taking on new projects.
          </p>
          <Link href="/contact">
            <button className="espy-cta espy-cta--hero">
              <span className="inner-glow" />
              <span className="label">Start a Project →</span>
            </button>
          </Link>
        </motion.div>
      </section>

      <Footer />

      {/* ── Lightbox portal ── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={filtered}
            index={lightboxIndex}
            onClose={closeLightbox}
            onNavigate={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
