import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { APEXMOTION } from '../motion';

interface MotionProps {
  children: React.ReactNode;
  className?: string;
}

/** Unlumen-derived spring/layout behavior, expressed as an APEX3X primitive. */
export const APEXReveal: React.FC<MotionProps & { delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { ...APEXMOTION.spring.spatial, delay }}
    >
      {children}
    </motion.div>
  );
};

/** SmoothUI-derived press feedback with no visual identity leakage. */
export const APEXPressable: React.FC<MotionProps & { disabled?: boolean }> = ({ children, className = '', disabled = false }) => {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      whileHover={reducedMotion || disabled ? undefined : { y: -1 }}
      whileTap={reducedMotion || disabled ? undefined : { scale: 0.985 }}
      transition={APEXMOTION.spring.press}
    >
      {children}
    </motion.div>
  );
};

/** Magic UI-derived cursor spotlight, constrained to the APEX3X monochrome system. */
export const APEXSpotlight: React.FC<MotionProps & { intensity?: number }> = ({ children, className = '', intensity = 0.08 }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--apex-spot-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    ref.current.style.setProperty('--apex-spot-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={`group relative overflow-hidden ${className}`}
      style={{ '--apex-spot-x': '50%', '--apex-spot-y': '50%' } as React.CSSProperties}
    >
      {!reducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ background: `radial-gradient(280px circle at var(--apex-spot-x) var(--apex-spot-y), rgba(255,255,255,${intensity}), transparent 70%)` }}
        />
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
};

/** Unlumen/Magic UI-style animated value surface; the value itself remains business data. */
export const APEXMetric: React.FC<{ value: number; prefix?: string; suffix?: string; className?: string }> = ({ value, prefix = '', suffix = '', className = '' }) => {
  const reducedMotion = useReducedMotion();
  return (
    <motion.span
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : APEXMOTION.duration.fast / 1000, ease: APEXMOTION.ease.standard }}
    >
      {prefix}{value.toLocaleString()}{suffix}
    </motion.span>
  );
};

/** Unlumen Tilt Card / SmoothUI hover-card behavior without source styling. */
export const APEXHoverCard: React.FC<MotionProps & { maxTilt?: number }> = ({ children, className = '', maxTilt = 2 }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.setProperty('--apex-tilt-x', `${(-y * maxTilt).toFixed(2)}deg`);
    ref.current.style.setProperty('--apex-tilt-y', `${(x * maxTilt).toFixed(2)}deg`);
  };

  const reset = () => {
    if (!ref.current) return;
    ref.current.style.setProperty('--apex-tilt-x', '0deg');
    ref.current.style.setProperty('--apex-tilt-y', '0deg');
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={className}
      style={{ '--apex-tilt-x': '0deg', '--apex-tilt-y': '0deg', transform: 'perspective(900px) rotateX(var(--apex-tilt-x)) rotateY(var(--apex-tilt-y))' } as React.CSSProperties}
      transition={APEXMOTION.spring.spatial}
    >
      {children}
    </motion.div>
  );
};

/** SmoothUI-style shimmer/shine feedback, deliberately monochrome. */
export const APEXShimmer: React.FC<MotionProps> = ({ children, className = '' }) => {
  const reducedMotion = useReducedMotion();
  return (
  <div className={`relative overflow-hidden ${className}`}>
    {!reducedMotion && <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
      animate={{ x: ['0%', '420%'] }}
      transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 3.5, ease: APEXMOTION.ease.standard }}
    />}
    <div className="relative z-[1]">{children}</div>
  </div>
  );
};
