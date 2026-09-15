import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'amber' | 'emerald' | 'rose' | 'slate' | 'outline' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
}) => {
  const variantStyles: Record<string, string> = {
    gold: 'bg-black text-white border-white/[0.12]',
    amber: 'bg-black text-white border-white/[0.12]',
    warning: 'bg-black text-white border-white/[0.12]',
    emerald: 'bg-black text-white border-white/[0.12]',
    success: 'bg-black text-white border-white/[0.12]',
    rose: 'bg-black text-white border-white/[0.12]',
    danger: 'bg-black text-white border-white/[0.12]',
    slate: 'bg-black text-zinc-300 border-white/[0.08]',
    neutral: 'bg-black text-zinc-300 border-white/[0.08]',
    outline: 'bg-transparent text-zinc-300 border-white/[0.12]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border tracking-wide whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
