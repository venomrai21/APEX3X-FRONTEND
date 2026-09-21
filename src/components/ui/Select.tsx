import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-[var(--text-secondary)] tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={`w-full appearance-none bg-[var(--surface)] border ${error ? 'border-[var(--error)]/60 focus:border-[var(--error)]' : 'border-[var(--border)] focus:border-[var(--border-strong)]'} text-[var(--text-primary)] text-sm rounded-lg px-3.5 py-2 pr-9 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]/20 ${className}`}
            {...props}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[var(--surface-2)] text-[var(--text-primary)]">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" aria-hidden="true">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p id={errorId} role="alert" className="text-xs text-[var(--error)] font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
