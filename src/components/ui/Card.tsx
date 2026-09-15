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
    default: 'bg-[#0c0c11] border border-white/[0.07] shadow-lg shadow-black/40',
    elevated: 'bg-[#12121a] border border-white/[0.1] shadow-2xl shadow-black/60',
    sunken: 'bg-[#07070a] border border-white/[0.04]',
    'gold-accent': 'bg-[#0d0d13] border border-amber-500/30 shadow-xl shadow-amber-950/10',
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
