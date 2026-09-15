import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const reducedMotion = useReducedMotion();
    const sizeStyles = {
      sm: 'py-1.5 px-3 text-xs gap-1.5 rounded-[var(--radius-sm)]',
      md: 'py-2 px-4 text-sm gap-2 rounded-[var(--radius-sm)]',
      lg: 'py-2.5 px-5 text-sm gap-2.5 rounded-[var(--radius-sm)]',
    };

    const variantStyles = {
      primary: 'bg-[var(--text-primary)] hover:bg-white active:bg-[var(--text-secondary)] text-[var(--background)] font-semibold border border-[var(--text-primary)] transition-colors duration-150',
      secondary: 'bg-[var(--surface)] hover:bg-[var(--surface-elevated)] active:bg-[var(--surface)] text-[var(--text-primary)] font-medium border border-[var(--border)] hover:border-[#383D41] transition-colors duration-150',
      outline: 'bg-transparent hover:bg-[var(--surface)] active:bg-[var(--surface-elevated)] text-[var(--text-primary)] font-medium border border-[var(--border)] hover:border-[#383D41] transition-colors duration-150',
      ghost: 'bg-transparent hover:bg-[var(--surface)] active:bg-[var(--surface-elevated)] text-[var(--text-primary)] font-medium transition-colors duration-150',
      danger: 'bg-transparent hover:bg-[var(--surface)] active:bg-[var(--surface-elevated)] text-[var(--error)] font-medium border border-[var(--border)] hover:border-[#383D41] transition-colors duration-150',
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileHover={reducedMotion || disabled || isLoading ? undefined : { y: -1 }}
        whileTap={reducedMotion || disabled || isLoading ? undefined : { scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`inline-flex items-center justify-center cursor-pointer select-none font-sans whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/70 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background)] disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
