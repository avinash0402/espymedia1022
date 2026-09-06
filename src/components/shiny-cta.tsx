import { ArrowRight } from 'lucide-react';

type ShinyCtaVariant = 'hero' | 'header' | 'contact' | 'footer';

interface ShinyCtaProps {
  children: React.ReactNode;
  className?: string;
  showArrow?: boolean;
  variant?: ShinyCtaVariant;
}

export function ShinyCta({ children, className = '', showArrow = true, variant = 'hero' }: ShinyCtaProps) {
  return (
    <button className={`espy-cta espy-cta--${variant} ${className}`}>
      <span className="inner-glow" />
      <span className="label">
        {children}
        {showArrow && <ArrowRight className="h-4 w-4" />}
      </span>
    </button>
  );
}
