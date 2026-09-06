import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useGetSettings } from '@workspace/api-client-react';
import { ShinyCta } from './shiny-cta';

const links = [
  { href: '#services', label: 'Services' },
  { href: '#work',     label: 'Work'     },
  { href: '#pricing',  label: 'Pricing'  },
  { href: '/contact',  label: 'Contact Us' },
];

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { data: settings } = useGetSettings();
  const sectionHref = (href: string) => location === '/' ? href : `/${href}`;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  return (
    <>
      {/* Top gradient blur overlay */}
      <div className="gradient-blur" />

      {/* Floating pill navbar */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-full z-50 pt-6 px-4"
      >
        <nav className={`max-w-5xl mx-auto flex items-center justify-between rounded-full px-6 py-3 transition-all duration-500 ${
          scrolled
            ? 'bg-white/[0.06] backdrop-blur-2xl border border-white/[0.14] shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.10)]'
            : 'bg-white/[0.04] backdrop-blur-xl border border-white/[0.09] shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.07)]'
        }`}>
          {/* Logo */}
          <Link href="/">
            <span className="flex items-center gap-2 group cursor-pointer">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName || 'Espy Media'}
                  className="h-8 w-auto object-contain max-w-[120px]"
                />
              ) : (
                <>
                  <span className="w-5 h-5 bg-[#7c3aed] rounded-sm rotate-45 flex-shrink-0" />
                  <span className="text-lg font-bold tracking-tight font-manrope text-white">
                    {settings?.siteName || 'Espy Media'}
                  </span>
                </>
              )}
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href.startsWith('#') ? sectionHref(l.href) : l.href}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 font-inter"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Book a Call — visible on ALL screen sizes */}
            <a href="/contact" onClick={() => setMobileOpen(false)}>
              <ShinyCta variant="header" showArrow={false} className="whitespace-nowrap">Get Quote →</ShinyCta>
            </a>

            {/* Mobile toggle */}
            <button
              className="md:hidden text-white p-1"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/98 backdrop-blur-2xl flex flex-col pt-[88px] px-6 pb-10"
          >
            <div className="flex flex-col gap-1">
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <a
                    href={l.href.startsWith('#') ? sectionHref(l.href) : l.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-4xl font-bold py-3 text-white hover:text-[#7c3aed] transition-colors font-manrope"
                  >
                    {l.label}
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
