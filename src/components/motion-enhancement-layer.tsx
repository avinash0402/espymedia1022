import { useEffect, useRef } from 'react';

interface MotionEnhancementLayerProps {
  location: string;
  disabled?: boolean;
}

export function MotionEnhancementLayer({ location, disabled = false }: MotionEnhancementLayerProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;

    const progress = progressRef.current;
    if (!progress) return;

    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const amount = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        progress.style.transform = `scaleX(${Math.max(0, Math.min(1, amount))})`;
      });
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [disabled, location]);

  useEffect(() => {
    if (disabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-advanced-scroll-reveal]'),
    );
    if (targets.length === 0) return;

    const staggerChildren = new Map<HTMLElement, HTMLElement[]>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target as HTMLElement;
        target.classList.remove('advanced-scroll-pending');
        target.classList.add('advanced-scroll-visible');
        staggerChildren.get(target)?.forEach((child) => {
          child.classList.remove('advanced-scroll-stagger-pending');
          child.classList.add('advanced-scroll-stagger-visible');
        });
        observer.unobserve(target);
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -6% 0px' });

    targets.forEach((target) => {
      target.classList.add('advanced-scroll-pending');
      if (target.hasAttribute('data-advanced-scroll-stagger')) {
        const children = Array.from(target.children).filter(
          (child): child is HTMLElement => child instanceof HTMLElement,
        );
        children.forEach((child, index) => {
          child.style.setProperty('--advanced-scroll-stagger-index', String(index));
          child.classList.add('advanced-scroll-stagger-pending');
        });
        staggerChildren.set(target, children);
      }
      observer.observe(target);
    });

    return () => {
      observer.disconnect();
      targets.forEach((target) => {
        target.classList.remove('advanced-scroll-pending', 'advanced-scroll-visible');
        staggerChildren.get(target)?.forEach((child) => {
          child.classList.remove('advanced-scroll-stagger-pending', 'advanced-scroll-stagger-visible');
          child.style.removeProperty('--advanced-scroll-stagger-index');
        });
      });
    };
  }, [disabled, location]);

  return disabled ? null : (
    <div
      ref={progressRef}
      aria-hidden="true"
      className="advanced-scroll-progress"
    />
  );
}
