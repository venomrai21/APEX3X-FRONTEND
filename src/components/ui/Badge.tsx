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
    gold: 'bg-amber-500/10 text-amber-200 border-amber-500/25',
    amber: 'bg-white/[0.04] text-zinc-300 border-white/[0.08]',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    emerald: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    success: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    rose: 'bg-red-950/40 text-red-400 border-red-500/30',
    danger: 'bg-red-950/40 text-red-400 border-red-500/30',
    slate: 'bg-white/[0.04] text-zinc-300 border-white/[0.08]',
    neutral: 'bg-white/[0.04] text-zinc-300 border-white/[0.08]',
    outline: 'bg-transparent text-zinc-400 border-white/[0.12]',
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
