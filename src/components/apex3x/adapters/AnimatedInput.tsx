import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(({ label, hint, error, className = '', ...props }, ref) => {
  const reduceMotion = useReducedMotion();
  return (
    <label className="block space-y-1.5">
      {label && <span className="block text-xs font-medium text-zinc-300">{label}</span>}
      <motion.input
        ref={ref}
        whileFocus={reduceMotion ? undefined : { scale: 1.005 }}
        transition={{ duration: 0.12 }}
        className={`w-full rounded-lg bg-black border border-white/[0.09] px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-white/[0.5] focus:ring-1 focus:ring-white/[0.12] ${error ? 'border-white/[0.24]' : ''} ${className}`}
        {...props}
      />
      {error ? <span className="block text-[10px] text-zinc-200">{error}</span> : hint ? <span className="block text-[10px] text-zinc-500">{hint}</span> : null}
    </label>
  );
});
AnimatedInput.displayName = 'AnimatedInput';
