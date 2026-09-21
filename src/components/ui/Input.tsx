import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const reducedMotion = useReducedMotion();
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [errorId, !error ? hintId : undefined].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && <label htmlFor={inputId} className="block text-xs font-medium text-[var(--text-secondary)] tracking-wide">{label}</label>}
        <div className="relative flex items-center">
          {leftIcon && <div className="absolute left-3 flex items-center pointer-events-none text-[var(--text-muted)]">{leftIcon}</div>}
          <motion.input
            id={inputId}
            ref={ref}
            whileFocus={reducedMotion ? undefined : { scale: 1.003 }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 35 }}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={`w-full bg-[var(--surface)] border ${error ? 'border-[var(--error)]/60 focus:border-[var(--error)] focus:ring-[var(--error)]/15' : 'border-[var(--border)] focus:border-[var(--border-strong)] focus:ring-[var(--ring-brand)]/15'} text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm rounded-lg px-3.5 py-2 transition-all duration-150 focus:outline-none focus:ring-2 ${leftIcon ? 'pl-9' : ''} ${rightIcon ? 'pr-9' : ''} ${className}`}
            {...props}
          />
          {rightIcon && <div className="absolute right-3 flex items-center text-[var(--text-muted)]">{rightIcon}</div>}
        </div>
        {error && <p id={errorId} role="alert" className="text-xs text-[var(--error)] font-medium">{error}</p>}
        {hint && !error && <p id={hintId} className="text-xs text-[var(--text-muted)]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
