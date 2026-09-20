import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'lg' }) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) ?? []);
    requestAnimationFrame(() => (focusable()[0] ?? dialogRef.current)?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) return;
    const target = previouslyFocusedRef.current;
    previouslyFocusedRef.current = null;
    if (target && document.contains(target)) requestAnimationFrame(() => target.focus());
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthStyles = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto" role="presentation">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }} />
      <div
        ref={dialogRef}
        className={`relative w-full ${maxWidthStyles[maxWidth]} max-h-[calc(100dvh-2rem)] overflow-y-auto bg-black border border-white/[0.12] rounded-xl shadow-2xl shadow-black/90 p-6 z-10`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? descriptionId : undefined}
        tabIndex={-1}
      >
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-serif-display font-semibold text-zinc-100 tracking-tight">{title}</h2>
            {subtitle && <p id={descriptionId} className="text-xs text-zinc-400 mt-1 leading-relaxed">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-zinc-500 hover:text-zinc-300 p-2 rounded-lg hover:bg-white/[0.05] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="text-zinc-300 text-sm">{children}</div>
      </div>
    </div>
  );
};
