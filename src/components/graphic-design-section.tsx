import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { CircularGallery } from '@/components/circular-gallery';
import { useGetGraphicWorks } from '@workspace/api-client-react';

export function GraphicDesignSection() {
  const { data: cmsWorks, isLoading, error } = useGetGraphicWorks();
  const galleryItems = cmsWorks?.filter((work) => work.published && work.imageUrl).map((work) => ({
    image: work.imageUrl,
    text: '',
  })) || [];
  const items = galleryItems;

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  const bend = isMobile ? 1 : 3;

  return (
    <section className="relative overflow-hidden bg-black py-16 md:py-24 lg:py-32">
      {/* Ambient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-[480px] w-[480px] rounded-full opacity-10"
        style={{ background: '#7c3aed', filter: 'blur(140px)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -left-32 h-[520px] w-[520px] rounded-full opacity-10"
        style={{ background: '#a78bfa', filter: 'blur(150px)' }}
      />

      {/* Section header — headline only, no button */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 mb-10 md:mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium tracking-wide text-slate-300 backdrop-blur-sm mb-5">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]"
              style={{ boxShadow: '0 0 8px 2px rgba(167,139,250,0.8)' }}
            />
            Creative Design Work
          </span>

          <h2 className="font-manrope text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.08] tracking-tight text-white">
            Designs that make your{' '}
            <span className="testimonial-aurora-text">brand impossible to ignore</span>
          </h2>
        </motion.div>
      </div>

      {/* ── CircularGallery ── */}
      {items.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative w-full h-[340px] sm:h-[420px] md:h-[500px]"
        >
          <CircularGallery
            items={items}
            bend={bend}
            textColor="#ffffff"
            borderRadius={0.05}
            scrollSpeed={2}
            scrollEase={0.05}
            font="bold 28px Glacial Indifference"
          />
        </motion.div>
      ) : (
        <div className="mx-auto flex h-[240px] max-w-7xl items-center justify-center px-6 text-sm text-zinc-400">
          {isLoading ? 'Loading graphic portfolio...' : error ? `Graphic portfolio unavailable: ${error.message}` : 'No published graphic works yet.'}
        </div>
      )}

      {/* Drag hint + View All Works button — centred at bottom */}
      <div className="relative z-10 flex flex-col items-center gap-5 mt-8">
        <p className="flex items-center gap-2 text-xs text-zinc-600 select-none">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M17 8l4 4-4 4M7 8l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Drag or scroll to explore — our design portfolio in motion
        </p>

        <Link
          href="/graphic-design"
          className="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-[#a78bfa]/40 hover:bg-[#7c3aed]/10"
        >
          View All Works
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
