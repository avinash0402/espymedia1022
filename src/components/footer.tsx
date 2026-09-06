import type { ReactElement } from 'react';
import {
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaFacebookF,
  FaBehance,
  FaDribbble,
  FaYoutube,
  FaGithub,
  FaWhatsapp,
} from 'react-icons/fa';
import { useGetSettings } from '@workspace/api-client-react';

export function Footer() {
  const { data: settings } = useGetSettings();
  const socials = [
    { href: settings?.instagramUrl, icon: <FaInstagram size={16} />, label: 'Instagram' },
    { href: settings?.twitterUrl, icon: <FaTwitter size={16} />, label: 'Twitter' },
    { href: settings?.linkedinUrl, icon: <FaLinkedinIn size={16} />, label: 'LinkedIn' },
    { href: settings?.facebookUrl, icon: <FaFacebookF size={16} />, label: 'Facebook' },
    { href: settings?.behanceUrl, icon: <FaBehance size={16} />, label: 'Behance' },
    { href: settings?.dribbbleUrl, icon: <FaDribbble size={16} />, label: 'Dribbble' },
    { href: settings?.youtubeUrl, icon: <FaYoutube size={16} />, label: 'YouTube' },
    { href: settings?.githubUrl, icon: <FaGithub size={16} />, label: 'GitHub' },
    {
      href: settings?.whatsapp
        ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hi Espy Media, I would like to discuss a project.')}`
        : undefined,
      icon: <FaWhatsapp size={16} />,
      label: 'WhatsApp',
    },
  ].filter((social): social is { href: string; icon: ReactElement; label: string } => Boolean(social.href));
  return (
    <footer className="bg-black relative overflow-hidden">
      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-8 md:pb-10">
        {/* Big headline */}
        <h2
          className="font-manrope font-black text-white leading-none tracking-tighter mb-8 md:mb-12 select-none"
          style={{ fontSize: 'clamp(40px, 10vw, 160px)' }}
        >
          {(settings?.footerText || 'START\nDOMINATING.').split(/\r?\n/).map((line, index) => (
            <span key={`${line}-${index}`} className="footer-cta-gradient block">{line || '\u00a0'}</span>
          ))}
        </h2>

        {/* Email + socials row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-6">
          {/* Left: email + location */}
          <div>
            <a
              href={`mailto:${settings?.contactEmail || 'hello@espymedia.in'}`}
              className="text-white font-bold font-inter text-lg md:text-xl hover:opacity-70 transition-opacity block mb-3"
            >
              {settings?.contactEmail || 'hello@espymedia.in'}
            </a>
            <p className="text-zinc-500 text-sm font-inter flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {settings?.address || 'Based out of Hyderabad, serving clients globally.'}
            </p>
          </div>

          {/* Right: social icons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {socials.map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-400 transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-900 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between text-zinc-600 text-[10px] uppercase tracking-widest font-inter gap-4">
          <p>{settings?.siteName || 'ESPY MEDIA'} · {settings?.footerText?.split(/\r?\n/)[0] || 'BUILT WITH PERFORMANCE IN MIND.'}</p>
          <div className="flex gap-6">
            <a href="/contact" className="hover:text-zinc-400 transition-colors">Contact</a>
            <a href="/privacy-policy" className="hover:text-zinc-400 transition-colors">Privacy</a>
            <a href="/terms-conditions" className="hover:text-zinc-400 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
