import React from 'react';

export const ProgressiveBlur: React.FC<{ children: React.ReactNode; edge?: 'top' | 'bottom' | 'both'; className?: string }> = ({ children, edge = 'bottom', className = '' }) => {
  const top = edge === 'top' || edge === 'both';
  const bottom = edge === 'bottom' || edge === 'both';
  return <div className={`relative overflow-hidden ${className}`}>
    {top && <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-8 z-10 bg-gradient-to-b from-[#0b0b12] to-transparent" />}
    {children}
    {bottom && <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-8 z-10 bg-gradient-to-t from-[#0b0b12] to-transparent" />}
  </div>;
};
