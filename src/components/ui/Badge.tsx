import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'neutral' | 'success' | 'danger' | 'slate' | 'outline';
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
    brand: 'bg-[var(--surface-2)] text-[var(--text-primary)] border-[var(--border-subtle)]',
    success: 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--border-subtle)]',
    danger: 'bg-[var(--error-bg)] text-[var(--error)] border-[var(--border-subtle)]',
    slate: 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    neutral: 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    outline: 'bg-transparent text-[var(--text-secondary)] border-[var(--border)]',
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
