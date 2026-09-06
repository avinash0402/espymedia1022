import { useParams } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { NavBar } from '@/components/nav-bar';
import { Footer } from '@/components/footer';
import { useGetProject } from '@workspace/api-client-react';

export default function CaseStudy() {
  const params = useParams();
  const projectId = params.id ? Number(params.id) : 0;
  const { data: project, isLoading } = useGetProject(projectId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-500 font-inter">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 font-manrope">Project not found</h1>
            <Link href="/">
              <button className="pill-btn-primary">Back to Home</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let metricsObj: Record<string, string> = {};
  if (project.metrics) {
    try { metricsObj = JSON.parse(project.metrics); } catch {}
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <NavBar />

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0514] to-black" />
        <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-[animStar_50s_linear_infinite]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-600/[0.05] rounded-full blur-[130px]" />
        <div className="grain-overlay absolute inset-0" />
      </div>

      <main className="relative z-10">

        {/* Hero */}
        <section className="pt-28 sm:pt-36 pb-16 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6">
            <Link href="/">
              <button className="mb-8 flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors font-inter" data-testid="link-back-home">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#A78BFA] text-xs font-semibold uppercase tracking-widest mb-6 font-manrope">
                {project.category}
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 font-manrope text-white" style={{ letterSpacing: '-0.03em' }}>
                {project.title}
              </h1>
              {project.clientName && (
                <p className="text-xl text-zinc-400 mb-12 font-inter">Client: {project.clientName}</p>
              )}
            </motion.div>

            {/* Cover */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-violet-950/40 to-purple-950/30 border border-white/[0.06]"
            >
              {project.coverVideo ? (
                <video src={project.coverVideo} autoPlay muted loop playsInline className="w-full h-full object-cover" />
              ) : project.coverImage ? (
                <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl font-bold text-gradient-purple mb-3 font-manrope leading-none">{project.title[0]}</div>
                    <div className="text-zinc-500 uppercase tracking-widest text-sm font-inter">{project.category}</div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Metrics band */}
        {Object.keys(metricsObj).length > 0 && (
          <div className="border-y border-white/[0.05] bg-white/[0.015]">
            <div className="container mx-auto px-6">
              <div className={`grid grid-cols-2 md:grid-cols-${Math.min(Object.keys(metricsObj).length, 4)} divide-x divide-white/[0.05]`}>
                {Object.entries(metricsObj).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="py-6 sm:py-10 px-3 sm:px-8 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-gradient-purple mb-2 font-manrope">{value}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-[0.15em] font-inter">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div className="space-y-20">
              {[
                { label: 'The Challenge', text: project.challenge },
                { label: 'Our Approach',  text: project.approach  },
                { label: 'The Result',    text: project.result    },
              ].map((block) => (
                <motion.div
                  key={block.label}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-[0.2em] mb-5 font-manrope">
                    {block.label}
                  </div>
                  <p className="text-xl leading-relaxed text-zinc-300 font-inter whitespace-pre-line">{block.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-32 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(124,58,237,0.15) 0%, transparent 70%)' }}
          />
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 sm:mb-8 font-manrope text-white" style={{ letterSpacing: '-0.03em' }}>
                Ready to start your own<br />
                <span className="text-gradient-purple">success story?</span>
              </h2>
              <Link href="/contact">
                <button className="shiny-cta" data-testid="button-start-project-cta">
                  <span className="relative z-10 flex items-center gap-2 text-base">
                    Start Your Project <ArrowRight className="w-5 h-5" />
                  </span>
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
