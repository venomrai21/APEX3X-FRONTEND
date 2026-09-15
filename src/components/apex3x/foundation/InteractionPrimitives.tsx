import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

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
      transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34, delay }}
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
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

/** Magic UI-inspired cursor spotlight, constrained to the APEX3X monochrome system. */
export const APEXSpotlight: React.FC<MotionProps & { intensity?: number }> = ({ children, className = '', intensity = 0.08 }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [point, setPoint] = React.useState({ x: 50, y: 50 });
  const reducedMotion = useReducedMotion();

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPoint({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div ref={ref} onPointerMove={onPointerMove} className={`relative overflow-hidden ${className}`}>
      {!reducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ background: `radial-gradient(280px circle at ${point.x}% ${point.y}%, rgba(255,255,255,${intensity}), transparent 70%)` }}
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
      transition={{ duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' }}
    >
      {prefix}{value.toLocaleString()}{suffix}
    </motion.span>
  );
};
