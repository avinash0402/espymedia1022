import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { NavBar } from '@/components/nav-bar';
import { Footer } from '@/components/footer';
import { Link } from 'wouter';

const CATEGORIES = [
  'All',
  'Business Website',
  'E-commerce',
  'Landing Page',
  'Portfolio',
  'Healthcare',
  'Restaurant & Food',
];

const PROJECTS = [
  {
    id: 1,
    title: 'Aurum Jewellers',
    category: 'E-commerce',
    url: '#',
    gradient: 'from-yellow-950 via-amber-950 to-orange-950',
    accentColor: '#F59E0B',
    accentText: 'text-amber-400',
    description: 'Luxury jewellery e-commerce with custom product configurator and immersive gallery.',
    tags: ['Shopify', 'Custom UI'],
    featured: true,
  },
  {
    id: 2,
    title: 'NovaSpark Technologies',
    category: 'Business Website',
    url: '#',
    gradient: 'from-violet-950 via-purple-950 to-indigo-950',
    accentColor: '#8B5CF6',
    accentText: 'text-violet-400',
    description: 'B2B SaaS marketing site engineered for lead capture with animated data visualisations.',
    tags: ['React', 'Framer Motion'],
    featured: true,
  },
  {
    id: 3,
    title: 'Drift Collective',
    category: 'E-commerce',
    url: '#',
    gradient: 'from-rose-950 via-pink-950 to-purple-950',
    accentColor: '#F43F5E',
    accentText: 'text-rose-400',
    description: 'Lifestyle streetwear brand store with lookbook integration and seamless checkout.',
    tags: ['Shopify', 'Custom Theme'],
    featured: true,
  },
  {
    id: 4,
    title: 'Meridian Aesthetic Clinic',
    category: 'Healthcare',
    url: '#',
    gradient: 'from-teal-950 via-emerald-950 to-cyan-950',
    accentColor: '#14B8A6',
    accentText: 'text-teal-400',
    description: 'Premium aesthetics clinic with online booking, service pages and lead funnels.',
    tags: ['WordPress', 'Custom Design'],
    featured: false,
  },
  {
    id: 5,
    title: 'Zephyr Architecture',
    category: 'Portfolio',
    url: '#',
    gradient: 'from-zinc-900 via-stone-950 to-neutral-950',
    accentColor: '#A1A1AA',
    accentText: 'text-zinc-400',
    description: 'Minimalist architect portfolio with full-screen project galleries and smooth transitions.',
    tags: ['React', 'GSAP'],
    featured: false,
  },
  {
    id: 6,
    title: 'Ember & Oak Restaurant',
    category: 'Restaurant & Food',
    url: '#',
    gradient: 'from-orange-950 via-red-950 to-rose-950',
    accentColor: '#F97316',
    accentText: 'text-orange-400',
    description: 'Fine-dining restaurant website with online reservations and an animated menu showcase.',
    tags: ['WordPress', 'OpenTable'],
    featured: false,
  },
  {
    id: 7,
    title: 'PulseFlow SaaS',
    category: 'Landing Page',
    url: '#',
    gradient: 'from-blue-950 via-sky-950 to-indigo-950',
    accentColor: '#3B82F6',
    accentText: 'text-blue-400',
    description: 'High-converting SaaS landing page with animated hero, pricing table and demo booking.',
    tags: ['React', 'Tailwind'],
    featured: false,
  },
  {
    id: 8,
    title: 'Vega Legal Group',
    category: 'Business Website',
    url: '#',
    gradient: 'from-slate-950 via-zinc-950 to-gray-950',
    accentColor: '#64748B',
    accentText: 'text-slate-400',
    description: 'Professional law firm website with practice area pages and consultation intake forms.',
    tags: ['WordPress', 'Custom Design'],
    featured: false,
  },
  {
    id: 9,
    title: 'Solara Skincare',
    category: 'E-commerce',
    url: '#',
    gradient: 'from-pink-950 via-fuchsia-950 to-rose-950',
    accentColor: '#EC4899',
    accentText: 'text-pink-400',
    description: 'Clean-beauty brand store with ingredient transparency pages and subscription billing.',
    tags: ['Shopify', 'Custom UI'],
    featured: false,
  },
  {
    id: 10,
    title: 'Atlas Fitness',
    category: 'Landing Page',
    url: '#',
    gradient: 'from-green-950 via-emerald-950 to-teal-950',
    accentColor: '#10B981',
    accentText: 'text-emerald-400',
    description: 'Fitness coaching funnel with quiz flow, testimonials carousel and payment integration.',
    tags: ['React', 'Stripe'],
    featured: false,
  },
  {
    id: 11,
    title: 'Luminary Studio',
    category: 'Portfolio',
    url: '#',
    gradient: 'from-purple-950 via-violet-950 to-indigo-950',
    accentColor: '#A78BFA',
    accentText: 'text-purple-400',
    description: 'Creative studio portfolio with 3D-inspired card interactions and project case studies.',
    tags: ['React', 'Three.js'],
    featured: false,
  },
  {
    id: 12,
    title: 'Haven Dental Care',
    category: 'Healthcare',
    url: '#',
    gradient: 'from-cyan-950 via-sky-950 to-blue-950',
    accentColor: '#06B6D4',
    accentText: 'text-cyan-400',
    description: 'Friendly dental practice site with online appointment booking and patient resources.',
    tags: ['WordPress', 'Custom Design'],
    featured: false,
  },
];

export default function WebDesignProjects() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered =
    activeCategory === 'All'
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <NavBar />

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#160a24] via-black to-black" />
        <div className="absolute top-0 left-0 w-px h-px bg-transparent stars-1" aria-hidden="true" />
        <div className="absolute top-0 left-0 w-0.5 h-0.5 bg-transparent stars-2" aria-hidden="true" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/5 blur-[120px]" />
        <div className="absolute inset-0 global-reference-grid" />
      </div>

      <main className="relative z-10 pt-28 sm:pt-36 pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <p className="section-label mb-5">Web Design Portfolio</p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold font-manrope tracking-tighter leading-[1.05]">
                Real projects.<br />
                <span className="text-[#7c3aed]">Real results.</span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-sm md:text-right leading-relaxed">
                Every website is built around one goal — turning visitors into customers.
              </p>
            </div>
          </motion.div>

          {/* Category filter pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-wrap gap-2 mb-14"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeCategory === cat
                    ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Project grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-24 text-zinc-500">
              No projects in this category yet.
            </div>
          )}

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-24 text-center border-t border-white/[0.06] pt-24"
          >
            <p className="text-zinc-500 text-sm uppercase tracking-widest mb-4">Ready to build yours?</p>
            <h2 className="text-4xl md:text-5xl font-bold font-manrope tracking-tighter mb-8">
              Let's create something <span className="text-[#7c3aed]">exceptional.</span>
            </h2>
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 bg-[#7c3aed] hover:bg-purple-700 text-white font-bold rounded-full px-8 py-4 transition-all text-sm">
                Start Your Project
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function ProjectCard({ project }: { project: typeof PROJECTS[0] }) {
  return (
    <div className="group relative rounded-2xl overflow-hidden border border-white/[0.07] bg-zinc-950 hover:border-white/[0.14] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
      {/* Visual area */}
      <div className={`relative h-52 bg-gradient-to-br ${project.gradient} overflow-hidden`}>
        {/* Browser chrome mockup */}
        <div className="absolute inset-3 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 overflow-hidden">
          {/* Browser bar */}
          <div className="h-7 bg-black/60 border-b border-white/10 flex items-center px-3 gap-2 flex-shrink-0">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/70" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
              <div className="w-2 h-2 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 mx-2 h-3.5 rounded bg-white/10 flex items-center px-2">
              <div className="w-2 h-2 rounded-full mr-1.5" style={{ background: project.accentColor, opacity: 0.8 }} />
              <div className="h-1.5 w-24 rounded-full bg-white/20" />
            </div>
          </div>
          {/* Content lines */}
          <div className="p-3 space-y-2">
            <div className="h-4 rounded" style={{ background: project.accentColor, opacity: 0.25, width: '60%' }} />
            <div className="h-2 rounded bg-white/10" style={{ width: '90%' }} />
            <div className="h-2 rounded bg-white/10" style={{ width: '75%' }} />
            <div className="h-2 rounded bg-white/10" style={{ width: '80%' }} />
            <div className="mt-3 flex gap-2">
              <div className="h-6 w-20 rounded-full" style={{ background: project.accentColor, opacity: 0.5 }} />
              <div className="h-6 w-16 rounded-full bg-white/10" />
            </div>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

        {/* View site icon */}
        <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          <ExternalLink className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] ${project.accentText}`}>
            {project.category}
          </span>
          <div className="flex gap-1">
            {project.tags.map((tag) => (
              <span key={tag} className="text-[10px] text-zinc-600 bg-white/[0.03] border border-white/[0.05] rounded px-1.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white font-manrope tracking-tight mb-1.5">
          {project.title}
        </h3>
        <p className="text-sm text-zinc-500 leading-relaxed mb-4">
          {project.description}
        </p>

        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-white border border-white/10 bg-white/[0.05] hover:bg-white/10 hover:border-white/20 rounded-full px-4 py-2 transition-all duration-200 group/btn"
        >
          View Site
          <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
}
