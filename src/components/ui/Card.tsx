import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'sunken' | 'gold-accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-black border border-white/[0.08] shadow-[0_12px_32px_-20px_rgba(0,0,0,0.9)]',
    elevated: 'bg-black border border-white/[0.13] shadow-[0_18px_42px_-24px_rgba(0,0,0,0.95)]',
    sunken: 'bg-black border border-white/[0.055]',
    'gold-accent': 'bg-black border border-white/[0.08] shadow-[0_12px_32px_-20px_rgba(0,0,0,0.9)]',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`rounded-xl transition-all duration-200 ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
