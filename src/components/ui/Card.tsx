import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'sunken' | 'gold-accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  spotlight?: boolean;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, variant = 'default', padding = 'md', spotlight = true, interactive = true, className = '', onPointerMove, onPointerLeave, style, ...props }) => {
  const reducedMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const variantStyles = {
    default: 'bg-black border border-white/[0.08] shadow-[0_12px_32px_-20px_rgba(0,0,0,0.9)]',
    elevated: 'bg-black border border-white/[0.13] shadow-[0_18px_42px_-24px_rgba(0,0,0,0.95)]',
    sunken: 'bg-black border border-white/[0.055]',
    'gold-accent': 'bg-black border border-white/[0.08] shadow-[0_12px_32px_-20px_rgba(0,0,0,0.9)]',
  };
  const paddingStyles = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };
  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!reducedMotion && interactive && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      ref.current.style.setProperty('--apex-card-x', `${(-y * 2).toFixed(2)}deg`);
      ref.current.style.setProperty('--apex-card-y', `${(x * 2).toFixed(2)}deg`);
      ref.current.style.setProperty('--apex-spot-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
      ref.current.style.setProperty('--apex-spot-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
    }
    onPointerMove?.(event);
  };
  const handleLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    if (ref.current) { ref.current.style.setProperty('--apex-card-x', '0deg'); ref.current.style.setProperty('--apex-card-y', '0deg'); }
    onPointerLeave?.(event);
  };
  return <motion.div
    ref={ref}
    onPointerMove={handleMove}
    onPointerLeave={handleLeave}
    className={`group relative overflow-hidden rounded-xl transition-all duration-200 ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
    style={{ '--apex-card-x': '0deg', '--apex-card-y': '0deg', '--apex-spot-x': '50%', '--apex-spot-y': '50%', transform: interactive && !reducedMotion ? 'perspective(900px) rotateX(var(--apex-card-x)) rotateY(var(--apex-card-y))' : undefined, ...style } as React.CSSProperties}
    whileHover={interactive && !reducedMotion ? { y: -1 } : undefined}
    transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 30 }}
    {...props}
  >
    {spotlight && !reducedMotion && <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ background: 'radial-gradient(280px circle at var(--apex-spot-x) var(--apex-spot-y), rgba(255,255,255,0.07), transparent 70%)' }} />}
    <div className="relative z-[1]">{children}</div>
  </motion.div>;
};
