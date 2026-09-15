import React from 'react';

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
    // Math: horizontal padding = exactly 2x vertical padding
    const sizeStyles = {
      sm: 'py-1.5 px-3 text-xs gap-1.5 rounded-md',
      md: 'py-2 px-4 text-sm gap-2 rounded-lg',
      lg: 'py-2.5 px-5 text-sm gap-2.5 rounded-lg',
    };

    const variantStyles = {
      primary:
        'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-semibold shadow-lg shadow-amber-500/15 border border-amber-400/40 hover:border-amber-300 transition-all duration-150',
      secondary:
        'bg-[#14141c] hover:bg-[#1c1c28] active:bg-[#111117] text-zinc-200 font-medium border border-white/[0.09] hover:border-white/[0.18] shadow-sm transition-all duration-150',
      outline:
        'bg-transparent hover:bg-white/[0.04] active:bg-white/[0.07] text-zinc-300 font-medium border border-white/[0.14] hover:border-white/[0.25] transition-all duration-150',
      ghost:
        'bg-transparent hover:bg-white/[0.05] active:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 font-medium transition-all duration-150',
      danger:
        'bg-red-950/40 hover:bg-red-900/50 active:bg-red-950 text-red-300 font-medium border border-red-600/40 hover:border-red-500/60 transition-all duration-150',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center cursor-pointer select-none font-sans whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-1 focus-visible:ring-offset-black disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
