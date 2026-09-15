import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const NotificationBadge: React.FC<{ count?: number; label?: string; pulse?: boolean; max?: number; className?: string }> = ({ count = 0, label, pulse = true, max = 99, className = '' }) => {
  const reduceMotion = useReducedMotion();
  if (!count && !label) return null;
  const display = count > max ? `${max}+` : count;
  return (
    <motion.span
      className={`inline-flex min-w-5 h-5 items-center justify-center rounded-full px-1.5 bg-amber-500 text-zinc-950 text-[10px] font-bold ${className}`}
      animate={pulse && count > 0 && !reduceMotion ? { scale: [1, 1.08, 1] } : undefined}
      transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2 }}
      aria-label={label || `${count} notifications`}
    >{label || display}</motion.span>
  );
};
