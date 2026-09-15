import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface AnimatedToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export const AnimatedToggle: React.FC<AnimatedToggleProps> = ({ checked, onChange, disabled = false, label, description, className = '' }) => {
  const reduceMotion = useReducedMotion();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-center gap-3 text-left disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${checked ? 'bg-amber-500/80 border-amber-400/60' : 'bg-zinc-800 border-white/[0.12]'}`}>
        <motion.span
          className={`absolute h-4 w-4 rounded-full ${checked ? 'bg-zinc-950' : 'bg-zinc-400'}`}
          animate={reduceMotion ? undefined : { x: checked ? 21 : 3 }}
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={reduceMotion ? { transform: `translateX(${checked ? 21 : 3}px)` } : undefined}
        />
      </span>
      {(label || description) && <span className="min-w-0"><span className="block text-xs font-medium text-zinc-200">{label}</span>{description && <span className="block text-[10px] text-zinc-500 mt-0.5">{description}</span>}</span>}
    </button>
  );
};
