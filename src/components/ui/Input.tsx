import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const reducedMotion = useReducedMotion();
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="w-full space-y-1.5">
        {label && <label htmlFor={inputId} className="block text-xs font-medium text-zinc-300 tracking-wide">{label}</label>}
        <div className="relative flex items-center">
          {leftIcon && <div className="absolute left-3 flex items-center pointer-events-none text-zinc-500">{leftIcon}</div>}
          <motion.input
            id={inputId}
            ref={ref}
            whileFocus={reducedMotion ? undefined : { scale: 1.003 }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 35 }}
            className={`w-full bg-black border ${error ? 'border-white/[0.24] focus:border-white/[0.5] focus:ring-white/[0.12]' : 'border-white/[0.09] focus:border-white/[0.5] focus:ring-white/[0.12]'} text-zinc-200 placeholder-zinc-500 text-sm rounded-lg px-3.5 py-2 transition-all duration-150 focus:outline-none focus:ring-2 ${leftIcon ? 'pl-9' : ''} ${rightIcon ? 'pr-9' : ''} ${className}`}
            {...props}
          />
          {rightIcon && <div className="absolute right-3 flex items-center text-zinc-500">{rightIcon}</div>}
        </div>
        {error && <p className="text-xs text-white font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
