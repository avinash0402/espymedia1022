import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useGetGraphicWorks } from '@workspace/api-client-react';

export function GraphicDesignSection() {
  const { data: cmsWorks, isLoading, error } = useGetGraphicWorks();
  const publishedWorks = cmsWorks?.filter((work) => work.published && work.imageUrl) || [];
  const featuredWorks = publishedWorks.filter((work) => work.featured);
  const homepageWorks = (featuredWorks.length > 0 ? featuredWorks : publishedWorks).slice(0, 10);

  return (
    <section className="relative overflow-hidden bg-black py-16 md:py-24 lg:py-32" aria-busy={isLoading}>
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

      <div className="relative z-10 mx-auto mb-10 max-w-7xl px-6 lg:mb-14 lg:px-8">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium tracking-wide text-slate-300 backdrop-blur-sm">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]"
            style={{ boxShadow: '0 0 8px 2px rgba(167,139,250,0.8)' }}
          />
          Creative Design Work
        </span>

        <h2 className="font-manrope text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl">
          Designs that make your{' '}
          <span className="testimonial-aurora-text">brand impossible to ignore</span>
        </h2>
      </div>

      {error ? (
        <div className="mx-auto max-w-7xl px-6 text-sm text-red-300" role="alert">
          Graphic portfolio could not be loaded: {error.message}
        </div>
      ) : homepageWorks.length > 0 ? (
        <div className="relative z-10 overflow-hidden pb-[clamp(64px,9vw,150px)]">
          <div className="graphic-marquee flex w-max">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="graphic-marquee-group flex shrink-0 gap-4 pr-4 sm:gap-6 sm:pr-6"
                aria-hidden={copy === 1}
              >
                {homepageWorks.map((work, index) => {
                  const phase = (index / homepageWorks.length) * Math.PI * 2;
                  const arch = (1 + Math.cos(phase)) / 2;
                  const tilt = -Math.sin(phase) * 10;
                  const verticalOffset = `clamp(${(arch * 64).toFixed(1)}px, ${(arch * 10).toFixed(2)}vw, ${(arch * 150).toFixed(1)}px)`;

                  return (
                    <figure
                      key={`${copy}-${work.id}`}
                      className="w-[min(58vw,13rem)] shrink-0 overflow-hidden rounded-2xl sm:w-56"
                      style={{ transform: `translateY(${verticalOffset}) rotate(${tilt.toFixed(1)}deg)` }}
                    >
                      <img
                        src={work.imageUrl}
                        alt={copy === 1 ? '' : work.altText || work.title}
                        className="block aspect-[7/9] h-auto w-full object-cover"
                        loading={copy === 0 && index < 2 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    </figure>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        !isLoading && (
          <p className="mx-auto max-w-7xl px-6 text-sm text-zinc-400">
            No published graphic works yet.
          </p>
        )
      )}

      <div className="relative z-10 mt-8 flex justify-center">
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
