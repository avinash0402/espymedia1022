import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowUpRight, ArrowRight, Briefcase,
  LayoutTemplate, Megaphone, Palette, LayoutDashboard,
  Gauge, MousePointerClick, Smartphone, Search, Timer, Layers,
  Check, ExternalLink,
} from 'lucide-react';
import { TestimonialSection } from '@/components/testimonial-section';
import { GraphicDesignSection } from '@/components/graphic-design-section';
import { CountUp } from '@/components/count-up';
import { NavBar } from '@/components/nav-bar';
import { Footer } from '@/components/footer';
import { ShinyCta } from '@/components/shiny-cta';
import { HeroRichText } from '@/components/hero-rich-text';
import { normalizeHeroHeadline } from '@/components/rich-text-highlight-editor';
import {
  useGetTestimonials,
  useGetServices,
  useGetPlatforms,
  useGetPricingPlans,
  useGetSettings,
  useGetFeaturedProjects,
} from '@workspace/api-client-react';

// ── Static fallback data ─────────────────────────────────────────────────────

const serviceIcons = [LayoutTemplate, Megaphone, Palette, LayoutDashboard];
const serviceGlows = [
  'radial-gradient(circle at top right, rgba(124,58,237,0.2), transparent 70%)',
  'radial-gradient(circle at top right, rgba(59,130,246,0.15), transparent 70%)',
  'radial-gradient(circle at top right, rgba(234,179,8,0.15), transparent 70%)',
  'radial-gradient(circle at top right, rgba(168,85,247,0.15), transparent 70%)',
];
const serviceIconColors = ['text-[#7c3aed]', 'text-blue-400', 'text-yellow-400', 'text-purple-400'];

const FEATURED_WEB_PROJECTS = [
  {
    id: 1,
    title: 'NovaSpark Technologies',
    category: 'Business Website',
    categoryColor: 'text-violet-400',
    accentColor: '#8B5CF6',
    gradient: 'from-violet-950 via-purple-950 to-indigo-950',
    description: 'B2B SaaS site built for lead capture with animated data visualisations and custom CMS.',
    tags: ['React', 'Framer Motion'],
    url: '#',
  },
  {
    id: 2,
    title: 'Aurum Jewellers',
    category: 'E-commerce',
    categoryColor: 'text-amber-400',
    accentColor: '#F59E0B',
    gradient: 'from-yellow-950 via-amber-950 to-orange-950',
    description: 'Luxury jewellery store with bespoke product configurator and an immersive visual gallery.',
    tags: ['Shopify', 'Custom UI'],
    url: '#',
  },
  {
    id: 3,
    title: 'Drift Collective',
    category: 'E-commerce',
    categoryColor: 'text-rose-400',
    accentColor: '#F43F5E',
    gradient: 'from-rose-950 via-pink-950 to-purple-950',
    description: 'Lifestyle streetwear brand store with lookbook integration and seamless checkout flow.',
    tags: ['Shopify', 'Custom Theme'],
    url: '#',
  },
];

const WEB_DESIGN_CARDS = [
  {
    icon: Gauge,
    iconColor: 'text-[#A78BFA]',
    glow: 'radial-gradient(circle at top right, rgba(124,58,237,0.2), transparent 70%)',
    title: 'Performance-First Architecture',
    desc: 'Every site we build is engineered for Core Web Vitals — sub-2s load times, perfect Lighthouse scores, and zero layout shift.',
    badge: 'Speed',
    large: true,
  },
  {
    icon: MousePointerClick,
    iconColor: 'text-blue-400',
    glow: 'radial-gradient(circle at top right, rgba(59,130,246,0.15), transparent 70%)',
    title: 'Conversion-Optimised Layouts',
    desc: 'We design with one goal: turn visitors into customers. Every scroll, button, and headline is tested against conversion psychology.',
    badge: 'CRO',
    large: false,
    wide: true,
  },
  {
    icon: Smartphone,
    iconColor: 'text-emerald-400',
    glow: 'radial-gradient(circle at top right, rgba(16,185,129,0.15), transparent 70%)',
    title: 'Mobile-First',
    desc: 'Pixel-perfect on every screen — from 320px phones to 4K displays.',
    badge: 'Responsive',
    large: false,
  },
  {
    icon: Search,
    iconColor: 'text-yellow-400',
    glow: 'radial-gradient(circle at top right, rgba(234,179,8,0.15), transparent 70%)',
    title: 'SEO-Ready Structure',
    desc: 'Schema markup, semantic HTML, and technical SEO baked in from day one.',
    badge: 'SEO',
    large: false,
  },
  {
    icon: Palette,
    iconColor: 'text-pink-400',
    glow: 'radial-gradient(circle at top right, rgba(236,72,153,0.15), transparent 70%)',
    title: 'Brand Identity Integration',
    desc: 'Your design system, brought to life — cohesive, scalable, unforgettable.',
    badge: 'Branding',
    large: false,
  },
  {
    icon: Timer,
    iconColor: 'text-orange-400',
    glow: 'radial-gradient(circle at top right, rgba(249,115,22,0.15), transparent 70%)',
    title: 'Rapid Delivery',
    desc: 'Most projects delivered in 3–6 weeks. No bloated agencies, no endless revisions.',
    badge: 'Fast Track',
    large: false,
  },
];

const PRICING_PLANS = [
  {
    name: 'Starter Plan',
    price: '₹7,000',
    period: '',
    description: 'Perfect for startups, freelancers, and small businesses looking to establish a professional online presence with a custom website built around your business requirements.',
    features: [
      'Custom Website Designed Around Your Requirements',
      'Premium Responsive Design',
      'Mobile & Tablet Optimised',
      'Contact Form Integration',
      'WhatsApp Integration',
      'Basic E-commerce Website',
      'Basic On-Page SEO',
      'Fast Loading Performance',
      'Google Maps Integration',
      'Free Domain (1 Year)',
      'Free Hosting (1 Year)',
      '6 Months Free Support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Business Plan',
    price: '₹13,000',
    period: '',
    description: 'Perfect for growing businesses that need a premium website or e-commerce store built to generate leads, increase sales, and scale with their business.',
    features: [
      'Everything in Starter Plan',
      'Custom Website Designed Around Your Requirements',
      'Premium Custom UI/UX Design',
      'Business Website or E-commerce Website',
      'Admin Panel (CMS)',
      'Advanced Lead & Contact Forms',
      'Google Analytics Setup',
      'Meta Pixel Integration',
      'Speed & Performance Optimisation',
      'Enhanced SEO Optimisation',
      'Free Domain (1 Year)',
      'Free Hosting (1 Year)',
      '1 Year Free Support & Maintenance',
    ],
    cta: 'Start Your Project',
    popular: true,
  },
  {
    name: 'Custom Plan',
    price: 'Custom Pricing',
    period: '',
    description: 'Built for businesses that require completely custom web solutions, advanced functionality, automations, or enterprise-level development.',
    features: [
      'Fully Custom Website or Web Application',
      'Custom Design Tailored to Your Brand',
      'Advanced E-commerce Solutions',
      'Custom Admin Dashboard',
      'Booking & Appointment Systems',
      'Payment Gateway Integration',
      'API & CRM Integrations',
      'Custom Features & Automations',
      'Advanced SEO & Performance Optimisation',
      'Priority Development & Consultation',
      'Free Domain (1 Year)',
      'Free Hosting (1 Year)',
      '1 Year Free Support & Maintenance',
    ],
    cta: 'Request a Quote',
  },
];

// ────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { data: testimonials } = useGetTestimonials({ published: true });
  const { data: services } = useGetServices();
  const { data: platforms } = useGetPlatforms();
  const { data: pricingPlans } = useGetPricingPlans();
  const { data: settings } = useGetSettings();
  const { data: featuredProjects } = useGetFeaturedProjects();
  const waNumber = settings?.whatsapp?.replace(/\D/g, '') || '';
  const whatsappHref = (serviceName: string) => waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi Espy Media, I want to know more about your ${serviceName} service.`)}`
    : '/contact';
  const pricingWhatsappHref = (planName: string) => waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi Espy Media, I want to get started with the ${planName}. Please share more details.`)}`
    : '/contact';
  const displayTestimonials = testimonials?.slice(0, 6) || [];
  const featuredTestimonial = displayTestimonials[0];
  const gridTestimonials    = displayTestimonials.slice(1, 4);

  const serviceList = services || [
    { id: 1, slug: 'web-design',       name: 'Web Design & Build',    headline: 'Sites engineered to convert, not just look good',      description: 'From storefronts to admin panels, we design and ship fast, conversion-focused sites — fully responsive, on-brand, and built to be handed off with zero friction.' },
    { id: 2, slug: 'paid-ads',         name: 'Paid Ads & Lead Gen',   headline: 'Meta and Google campaigns built around a real funnel', description: 'Shipped with tracking in place so every lead is traceable back to spend.' },
    { id: 3, slug: 'graphic-design',   name: 'Graphic Design',        headline: 'Brand identity, social creative, and print',           description: 'Designed to stay consistent across every touchpoint.' },
    { id: 4, slug: 'admin-panels',     name: 'Admin Panels',          headline: 'Custom dashboards so you can manage content and leads', description: 'Orders and leads without touching code.' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <NavBar />

      {/* ── GLOBAL BACKGROUND ──────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#160a24] to-black" />
        <div className="absolute top-0 left-0 w-px h-px bg-transparent stars-1" aria-hidden="true" />
        <div className="absolute top-0 left-0 w-0.5 h-0.5 bg-transparent stars-2" aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-600/5 blur-[120px]" />
        <div className="absolute inset-0 global-reference-grid" />
      </div>

      <main className="relative z-10">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden min-h-screen flex flex-col items-center pt-20 md:pt-32 pb-0 px-4 md:px-6">

          {/* ── Hero atmosphere layers ── */}
          {/* Nebula glow — large soft purple ellipse behind text */}
          <div className="reference-hero-nebula absolute pointer-events-none" aria-hidden="true" />
          {/* Subtle purple-tinted grid */}
          <div className="absolute inset-0 reference-hero-grid pointer-events-none" aria-hidden="true" />
          {/* Drifting stars with purple tints */}
          <div className="reference-stars reference-stars-one absolute pointer-events-none" aria-hidden="true" />
          <div className="reference-stars reference-stars-two absolute pointer-events-none" aria-hidden="true" />
          {/* Orbit rings */}
          <div className="reference-orbit absolute reference-orbit-one pointer-events-none" aria-hidden="true" />
          <div className="reference-orbit absolute reference-orbit-two pointer-events-none" aria-hidden="true" />
          {/* Glowing orbit nodes */}
          <div className="reference-orbit-node absolute pointer-events-none" aria-hidden="true" />
          <div className="reference-orbit-node absolute reference-orbit-node-two pointer-events-none" aria-hidden="true" />
          {/* Edge vignette */}
          <div className="reference-hero-vignette absolute inset-0 pointer-events-none" aria-hidden="true" />

          {/* Top spacer — pushes hero content to vertical centre */}
          <div className="flex-1" aria-hidden="true" />

          <div className="relative z-10 text-center max-w-5xl mx-auto w-full flex flex-col items-center py-6 md:py-0">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 md:mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7c3aed]" />
              </span>
              <span className="text-xs font-medium text-purple-100/90 tracking-wide font-manrope">
                {settings?.heroBadge || 'Now booking Q4 client slots'}
              </span>
              <ArrowRight className="w-3 h-3 text-purple-400" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[2rem] sm:text-6xl md:text-[5.5rem] font-semibold tracking-tighter font-manrope leading-[1.08] mb-3 md:mb-6"
            >
              <span className="hero-headline-render block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
                <HeroRichText
                  html={normalizeHeroHeadline(
                    settings?.heroHeadline1 || 'Design & Growth',
                    settings?.heroHeadline2 || 'for Ambitious Brands',
                  )}
                />
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-sm sm:text-xl md:text-xl text-zinc-400 max-w-xl mx-auto mb-5 md:mb-10 leading-relaxed font-inter line-clamp-3 sm:line-clamp-none"
            >
              {settings?.heroSubheadline || 'Espy Media is a full-stack creative studio building web design, paid ads, lead generation, and graphic design under one roof — so your brand ships faster and looks sharper doing it.'}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6"
            >
              <Link href="/contact">
                <ShinyCta>Start a Project</ShinyCta>
              </Link>
              <Link href="/work/1">
                <button className="group px-6 py-3 md:px-8 md:py-4 text-sm md:text-base rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.14] text-zinc-300 font-medium hover:text-white hover:bg-white/[0.11] hover:border-white/[0.22] transition-all duration-300 flex items-center gap-2 font-manrope shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_6px_32px_rgba(124,58,237,0.18),inset_0_1px_0_rgba(255,255,255,0.12)]">
                  <Briefcase className="w-4 h-4 md:w-5 md:h-5" />
                  View Our Work
                </button>
              </Link>
            </motion.div>

            {/* Social proof strip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-8 md:mt-10 flex items-center justify-center gap-3.5"
            >
              {/* Stacked avatars */}
              <div className="flex items-center flex-shrink-0">
                {[
                  'https://i.pravatar.cc/76?img=11',
                  'https://i.pravatar.cc/76?img=32',
                  'https://i.pravatar.cc/76?img=47',
                  'https://i.pravatar.cc/76?img=5',
                  'https://i.pravatar.cc/76?img=21',
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    loading="lazy"
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-[#0e0b18] flex-shrink-0"
                    style={{ marginLeft: i === 0 ? 0 : '-10px', zIndex: 5 - i }}
                  />
                ))}
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-white/10 flex-shrink-0" />

              {/* Text + stars */}
              <div className="flex flex-col items-start gap-0.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-[#a78bfa]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs md:text-sm font-inter leading-tight">
                  <span className="font-bold text-white">100+ clients</span>
                  <span className="text-zinc-400"> trusted globally</span>
                </p>
              </div>
            </motion.div>
          </div>

          {/* Platform strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="w-full flex-1 flex flex-col items-center justify-center gap-4"
          >
            <p className="text-xs font-inter font-medium tracking-[0.18em] uppercase text-zinc-500">
              We work on
            </p>
            {(() => {
              const items = (platforms?.filter((p) => p.published && p.logoUrl) || []);
              if (!items.length) return null;
              // Guarantee each strip is wider than any viewport regardless of logo count.
              // Assume each logo occupies ~140 px (100 px image + 40 px gap).
              // Target minimum strip width: 1800 px (covers 4 K screens).
              const reps = Math.max(4, Math.ceil(1800 / (items.length * 140)));
              const repeated = Array.from({ length: reps }, () => items).flat();
              const strip = (ariaHidden?: boolean) => (
                <div
                  className="flex shrink-0 gap-10 items-center pr-10"
                  style={{ animation: 'marquee 50s linear infinite' }}
                  aria-hidden={ariaHidden || undefined}
                >
                  {repeated.map((platform: any, i: number) => (
                    <a
                      key={i}
                      href={platform.linkUrl || '#'}
                      target={platform.linkUrl ? '_blank' : undefined}
                      rel={platform.linkUrl ? 'noreferrer' : undefined}
                      className="shrink-0"
                    >
                      <img src={platform.logoUrl} alt={platform.name || ''} className="h-8 w-auto object-contain" />
                    </a>
                  ))}
                </div>
              );
              return (
                <div className="relative w-full flex overflow-hidden">
                  {strip()}
                  {strip(true)}
                </div>
              );
            })()}
          </motion.div>
        </section>

        {/* ── SERVICES — BENTO GRID ─────────────────────────────────── */}
        <section id="services" className="px-4 md:px-6 py-14 md:py-32">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-10 md:mb-20 text-center max-w-3xl mx-auto"
            >
              <p className="section-label justify-center mb-5">Our Services</p>
              <h2 className="section-headline mb-6">
                Everything your<br />
                <span className="text-[#7c3aed]">brand needs.</span>
              </h2>
              <p className="text-zinc-400 text-lg font-inter font-light">
                Replace five freelancers and three tools with one team that ships end to end.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-auto lg:h-[700px]">
              {serviceList[0] && (() => {
                const Icon = serviceIcons[0];
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="lg:col-span-2 lg:row-span-2 bento-card group flex flex-col"
                  >
                    <div className="bento-glow" />
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="mb-6 inline-flex p-3 rounded-lg bg-white/5 border border-white/10 text-[#A78BFA] w-fit">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white font-manrope mb-4 tracking-tight">
                        {serviceList[0].name}
                      </h3>
                      <p className="text-zinc-400 text-base leading-relaxed font-inter mb-3">
                        {serviceList[0].headline}
                      </p>
                      {serviceList[0].description && (
                        <p className="text-zinc-500 text-sm leading-relaxed font-inter">
                          {serviceList[0].description}
                        </p>
                      )}
                        <a href={whatsappHref(serviceList[0].name)} target={settings?.whatsapp ? '_blank' : undefined} rel={settings?.whatsapp ? 'noreferrer' : undefined} className="mt-auto flex items-center justify-between pt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-xs font-mono text-[#A78BFA] tracking-widest font-manrope">EXPLORE SERVICE</span>
                        <ArrowRight className="w-4 h-4 text-[#A78BFA]" />
                        </a>
                    </div>
                  </motion.div>
                );
              })()}

              {serviceList.slice(1).map((service, index) => {
                const Icon = serviceIcons[index + 1] || Layers;
                const iconColor = serviceIconColors[index + 1] || 'text-violet-400';
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (index + 1) * 0.08 }}
                    viewport={{ once: true }}
                    className={`bento-card group flex flex-col ${index === 0 ? 'lg:col-span-2' : ''}`}
                  >
                    <div className="bento-glow" style={{ background: serviceGlows[index + 1] }} />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className={`mb-4 inline-flex p-3 rounded-lg bg-white/5 border border-white/10 w-fit ${iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white font-manrope mb-2 tracking-tight">
                        {service.name}
                      </h3>
                       <p className="text-zinc-400 text-sm leading-relaxed font-inter">
                        {service.headline}
                      </p>
                       <a href={whatsappHref(service.name)} target={settings?.whatsapp ? '_blank' : undefined} rel={settings?.whatsapp ? 'noreferrer' : undefined} className="mt-auto pt-4 text-[10px] font-mono tracking-widest text-[#A78BFA] opacity-0 group-hover:opacity-100 transition-opacity">EXPLORE SERVICE →</a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SELECTED WORK — WEB DESIGN SHOWCASE ─────────────────── */}
        <section id="work" className="py-14 md:py-32 bg-black">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10 md:mb-16"
             >
              <div>
                <p className="section-label mb-4">Selected work</p>
                <h2 className="section-headline">Real projects.<br />Real results.</h2>
              </div>
              <Link href="/projects">
                <button className="hidden md:flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors group">
                  View all projects
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>

            {/* 3-column web design project cards — real CMS data with static fallback */}
            {(() => {
              const GRADIENTS = [
                'from-violet-950 via-purple-950 to-indigo-950',
                'from-yellow-950 via-amber-950 to-orange-950',
                'from-rose-950 via-pink-950 to-purple-950',
                'from-cyan-950 via-sky-950 to-blue-950',
                'from-emerald-950 via-teal-950 to-cyan-950',
                'from-orange-950 via-red-950 to-rose-950',
              ];
              const ACCENTS = ['#8B5CF6', '#F59E0B', '#F43F5E', '#38BDF8', '#34D399', '#FB923C'];
              const displayProjects = (featuredProjects && featuredProjects.length > 0)
                ? featuredProjects
                : FEATURED_WEB_PROJECTS.map((p, i) => ({
                    id: p.id, title: p.title, category: p.category,
                    imageUrl: undefined, liveUrl: p.url,
                    challenge: p.description, techStack: p.tags, slug: String(p.id),
                  }));
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayProjects.map((project: any, i: number) => {
                    const gradient = GRADIENTS[i % GRADIENTS.length];
                    const accent = ACCENTS[i % ACCENTS.length];
                    const tags = project.techStack || [];
                    const desc = project.challenge || project.description || '';
                    const url = project.liveUrl || '#';
                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="group relative rounded-3xl overflow-hidden border border-white/[0.07] bg-zinc-950 hover:border-white/[0.15] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
                      >
                        {/* Visual — image or browser mockup (16:9) */}
                        <div className={`relative w-full overflow-hidden ${project.imageUrl ? '' : `bg-gradient-to-br ${gradient}`}`} style={{ aspectRatio: '16/9' }}>
                          {project.imageUrl ? (
                            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-3 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 overflow-hidden">
                              <div className="h-7 bg-black/60 border-b border-white/10 flex items-center px-3 gap-2">
                                <div className="flex gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-red-500/60" />
                                  <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                                  <div className="w-2 h-2 rounded-full bg-green-500/60" />
                                </div>
                                <div className="flex-1 mx-2 h-3.5 rounded bg-white/10 flex items-center px-2 gap-1.5">
                                  <div className="w-2 h-2 rounded-full" style={{ background: accent, opacity: 0.7 }} />
                                  <div className="h-1.5 w-20 rounded-full bg-white/20" />
                                </div>
                              </div>
                              <div className="p-3 space-y-2">
                                <div className="h-4 rounded" style={{ background: accent, opacity: 0.3, width: '55%' }} />
                                <div className="h-2 rounded bg-white/10" style={{ width: '88%' }} />
                                <div className="h-2 rounded bg-white/10" style={{ width: '72%' }} />
                                <div className="h-2 rounded bg-white/10" style={{ width: '80%' }} />
                                <div className="mt-3 flex gap-2">
                                  <div className="h-6 w-20 rounded-full" style={{ background: accent, opacity: 0.55 }} />
                                  <div className="h-6 w-16 rounded-full bg-white/10" />
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                          <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                            <ExternalLink className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        {/* Card info */}
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-violet-400">
                              {project.category}
                            </span>
                            <div className="flex gap-1">
                              {tags.slice(0, 2).map((tag: string) => (
                                <span key={tag} className="text-[10px] text-zinc-600 bg-white/[0.03] border border-white/[0.05] rounded px-1.5 py-0.5">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-white font-manrope tracking-tight mb-1.5">
                            {project.title}
                          </h3>
                          <p className="text-sm text-zinc-500 leading-relaxed mb-4 line-clamp-2">
                            {desc}
                          </p>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-white border border-white/10 bg-white/[0.05] hover:bg-white/10 hover:border-white/20 rounded-full px-4 py-2 transition-all duration-200 group/btn"
                          >
                            View Project
                            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </a>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })()}

            {/* View all — mobile + desktop bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-10 text-center"
            >
              <Link href="/projects">
                <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-sm font-medium text-zinc-300 hover:text-white transition-all duration-200">
                  View all web design projects
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── GRAPHIC DESIGN WORK ───────────────────────────────────── */}
        <GraphicDesignSection />

        {/* ── WEB DESIGN — CAPABILITY CARDS ────────────────────────── */}
        <section className="py-14 md:py-32 border-t border-white/[0.05]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-10 md:mb-20 text-center max-w-3xl mx-auto"
            >
              <p className="section-label justify-center mb-5">Web Design</p>
              <h2 className="section-headline mb-5">
                What we build<br />
                <span className="text-gradient-purple">into every site.</span>
              </h2>
              <p className="text-zinc-400 text-lg font-inter">
                Every site is engineered for speed, conversions, and brand impact from day one.
              </p>
            </motion.div>

            {/* Bento layout: 1 large + 2 medium + 3 small */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Large card — Performance */}
              {(() => {
                const card = WEB_DESIGN_CARDS[0];
                const Icon = card.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="sm:col-span-2 lg:col-span-2 bento-card group flex flex-col min-h-[240px] sm:min-h-[280px]"
                  >
                    <div className="bento-glow" style={{ background: card.glow }} />
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`inline-flex p-3 rounded-lg bg-white/5 border border-white/10 ${card.iconColor}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 border border-zinc-800 rounded-full px-3 py-1 font-manrope">
                          {card.badge}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white font-manrope mb-4 tracking-tight">
                        {card.title}
                      </h3>
                      <p className="text-zinc-400 text-base leading-relaxed font-inter">
                        {card.desc}
                      </p>
                      <div className="mt-auto flex items-center gap-2 pt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-xs font-mono text-[#A78BFA] tracking-widest">LEARN MORE</span>
                        <ArrowRight className="w-4 h-4 text-[#A78BFA]" />
                      </div>
                    </div>
                  </motion.div>
                );
              })()}

              {/* CRO card — wide on md */}
              {(() => {
                const card = WEB_DESIGN_CARDS[1];
                const Icon = card.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                    viewport={{ once: true }}
                    className="bento-card group flex flex-col"
                  >
                    <div className="bento-glow" style={{ background: card.glow }} />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`inline-flex p-3 rounded-lg bg-white/5 border border-white/10 ${card.iconColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 border border-zinc-800 rounded-full px-3 py-1 font-manrope">
                          {card.badge}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white font-manrope mb-2 tracking-tight">{card.title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed font-inter">{card.desc}</p>
                    </div>
                  </motion.div>
                );
              })()}

              {/* Remaining 4 small cards */}
              {WEB_DESIGN_CARDS.slice(2).map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (index + 2) * 0.07 }}
                    viewport={{ once: true }}
                    className="bento-card group flex flex-col"
                  >
                    <div className="bento-glow" style={{ background: card.glow }} />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`inline-flex p-2.5 rounded-lg bg-white/5 border border-white/10 ${card.iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 border border-zinc-800 rounded-full px-2.5 py-0.5 font-manrope">
                          {card.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white font-manrope mb-2 tracking-tight">{card.title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed font-inter">{card.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA under web design */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <Link href="/contact">
                <button className="pill-btn-primary">
                  Get a free design audit
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── STATS BAND ───────────────────────────────────────────── */}
        <div className="bg-[#7c3aed]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4">
              {(settings?.homepageStats?.length ? settings.homepageStats : [
                { end: 120,   suffix: '+',  label: 'Clients Served' },
                { end: 340,   suffix: '+',  label: 'Campaigns Run' },
                { end: 4.8,   suffix: 'x',  label: 'Average ROAS' },
                { end: 28000, suffix: '+',  label: 'Leads Generated' },
              ]).map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className={[
                    'py-10 md:py-16 px-5 md:px-8 text-center border-white/20',
                    /* right border: odd items on mobile, all except last on desktop */
                    i % 2 === 0 ? 'border-r' : 'md:border-r',
                    /* bottom border: top row on mobile only */
                    i < 2 ? 'border-b md:border-b-0' : '',
                  ].join(' ')}
                >
                  <div className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-2 md:mb-3 tabular-nums font-manrope">
                    <CountUp end={stat.end} suffix={stat.suffix} />
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-white/70 uppercase tracking-[0.15em] font-inter">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PROCESS ──────────────────────────────────────────────── */}
        <section id="process" className="py-14 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-10 md:mb-16"
            >
              <p className="section-label mb-4">How it works</p>
              <h2 className="section-headline">How we work.</h2>
            </motion.div>

            {/* Solid black cards with vertical line separators */}
            <div className="flex flex-col md:flex-row border border-white/[0.06] rounded-xl overflow-hidden">
              {[
                { num: '01', title: 'Discover',    desc: 'Deep dive into your business, audience, and competitive landscape.' },
                { num: '02', title: 'Strategise',  desc: 'We map the fastest path from where you are to where you want to be.' },
                { num: '03', title: 'Design',      desc: 'Creative that balances beauty with conversion psychology.' },
                { num: '04', title: 'Build',       desc: 'Technical execution with obsessive attention to detail and performance.' },
                { num: '05', title: 'Grow',        desc: 'Continuous optimisation driven by real data and relentless testing.' },
              ].map((step, index) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.07 }}
                  viewport={{ once: true }}
                  className={`flex-1 basis-full sm:basis-auto bg-black p-6 sm:p-8 group hover:bg-zinc-950 transition-colors duration-300 flex flex-col gap-4 sm:gap-5 ${
                    index < 4 ? 'border-b sm:border-b-0 sm:border-r border-white/[0.06]' : ''
                  }`}
                >
                  {/* Number — large, bold, clean */}
                  <span className="block text-7xl font-black font-manrope leading-none tracking-tight text-[#A78BFA] group-hover:text-[#c4b5fd] transition-colors duration-300">
                    {step.num}
                  </span>

                  <div>
                    <h3 className="text-lg font-bold mb-2.5 group-hover:text-[#A78BFA] transition-colors duration-300 font-manrope text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
        <TestimonialSection />

        {/* ── PRICING ───────────────────────────────────────────────── */}
        <section id="pricing" className="bg-black px-4 md:px-6 py-14 md:py-32">
          <div className="mx-auto max-w-7xl">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-10 md:mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6"
            >
              <div>
                <p className="section-label mb-5">Pricing</p>
                <h2 className="section-headline">
                  Simple pricing.
                </h2>
              </div>
              <p className="text-zinc-500 text-sm max-w-xs md:text-right leading-relaxed">
                One-time project pricing. No retainers, no hidden fees — just results.
              </p>
            </motion.div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden">
              {(pricingPlans?.filter((plan) => plan.published).map((plan) => ({
                name: plan.name,
                price: plan.price,
                period: plan.period,
                description: plan.description,
                features: plan.features,
                cta: plan.ctaText,
                popular: plan.highlighted,
              })) || PRICING_PLANS).map((plan, index) => (
                <motion.article
                  key={plan.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className={`relative flex flex-col p-5 sm:p-8 transition-colors duration-300 ${
                    plan.popular
                      ? 'bg-[#0a0612]'
                      : 'bg-[#060408] hover:bg-zinc-950'
                  }`}
                >
                  {/* Popular glow */}
                  {plan.popular && (
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.14) 0%, transparent 65%)',
                      }}
                    />
                  )}

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Plan header */}
                    <div className="mb-8 pb-8 border-b border-white/[0.06]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-manrope text-base font-semibold text-white tracking-tight">
                          {plan.name}
                        </h3>
                        {plan.popular && (
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full bg-[#7c3aed]/20 text-[#a78bfa] border border-[#7c3aed]/30">
                            Most Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-4xl font-bold font-manrope tracking-tight ${plan.popular ? 'text-white' : 'text-zinc-100'}`}>
                          {plan.price}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-1.5 uppercase tracking-widest">One-time</p>
                    </div>

                    {/* Features */}
                    <ul className="mb-10 flex-1 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <span
                            className="mt-[3px] flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{
                              background: plan.popular ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                              border: plan.popular ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                              <path d="M1 3l2 2 4-4" stroke={plan.popular ? '#a78bfa' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span className={`text-sm leading-relaxed ${plan.popular ? 'text-zinc-300' : 'text-zinc-400'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {plan.popular ? (
                      <a
                        href={pricingWhatsappHref(plan.name)}
                        target={waNumber ? '_blank' : undefined}
                        rel={waNumber ? 'noreferrer' : undefined}
                        className="espy-cta espy-cta--contact w-full"
                      >
                        <span className="inner-glow" />
                        <span className="label">{plan.cta} <ArrowRight className="h-4 w-4" /></span>
                      </a>
                    ) : (
                      <a
                        href={pricingWhatsappHref(plan.name)}
                        target={waNumber ? '_blank' : undefined}
                        rel={waNumber ? 'noreferrer' : undefined}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/[0.12] bg-white/[0.04] text-zinc-300 text-sm font-semibold font-manrope hover:bg-white/[0.08] hover:border-white/[0.2] hover:text-white transition-all duration-300"
                      >
                        {plan.cta} <ArrowRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Footer note */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-6 text-center text-xs text-zinc-600"
            >
              All plans include a free discovery call. Prices shown are starting points — final quote after scope review.
            </motion.p>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="py-14 md:py-32 px-4 md:px-6 bg-zinc-950/40 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold font-manrope mb-6 md:mb-8 tracking-tighter text-white">
              Ready to <span className="text-[#7c3aed]">Grow?</span>
            </h2>
            <p className="text-base sm:text-xl text-zinc-400 mb-8 md:mb-12 font-inter">
              Tell us about your brand and we'll get back to you within one business day.
            </p>

            <form
              className="max-w-md mx-auto flex flex-col gap-3 sm:flex-row sm:gap-4"
              onSubmit={(e) => { e.preventDefault(); window.location.href = '/contact'; }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-[#7C3AED] transition-all font-inter text-sm"
              />
              <Link href="/contact">
                <button
                  type="button"
                  className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-bold rounded-full px-8 py-4 transition-all font-manrope text-sm whitespace-nowrap"
                >
                  Get in touch
                </button>
              </Link>
            </form>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
