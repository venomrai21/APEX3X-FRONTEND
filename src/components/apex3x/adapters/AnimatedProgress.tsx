import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const AnimatedProgress: React.FC<{ value: number; label?: string; showValue?: boolean; className?: string }> = ({ value, label, showValue = true, className = '' }) => {
  const reduceMotion = useReducedMotion();
  const safe = Math.min(100, Math.max(0, value));
  return <div className={className}>{(label || showValue) && <div className="flex items-center justify-between mb-1.5"><span className="text-[10px] text-zinc-500">{label}</span>{showValue && <span className="text-[10px] font-mono text-zinc-300">{Math.round(safe)}%</span>}</div>}<div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden"><motion.div className="h-full rounded-full bg-amber-500" initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${safe}%` }} transition={{ duration: 0.55, ease: 'easeOut' }} /></div></div>;
};
