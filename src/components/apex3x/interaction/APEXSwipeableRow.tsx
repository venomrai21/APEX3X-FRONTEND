import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { APEXPointerGesture } from './contracts';

export interface APEXSwipeAction {
  id: string;
  label: string;
  onAction: () => void;
  destructive?: boolean;
}

export interface APEXSwipeableRowProps {
  children: React.ReactNode;
  actions: APEXSwipeAction[];
  primaryAction?: APEXSwipeAction;
  className?: string;
  maxReveal?: number;
}

const AXIS_LOCK_PX = 8;
const COMMIT_RATIO = 0.5;
const VELOCITY_PX_MS = 0.55;

export function APEXSwipeableRow({ children, actions, primaryAction, className = '', maxReveal = 180 }: APEXSwipeableRowProps) {
  const reducedMotion = useReducedMotion();
  const [offset, setOffset] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const gesture = React.useRef<APEXPointerGesture | null>(null);
  const startOffset = React.useRef(0);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if ((event.target as HTMLElement).closest('button,a,input,textarea,select,[data-no-swipe]')) return;
    const now = performance.now();
    gesture.current = { startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastTime: now, startTime: now, axis: null, active: true };
    startOffset.current = open ? -maxReveal : 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g?.active) return;
    const dx = event.clientX - g.startX;
    const dy = event.clientY - g.startY;
    if (!g.axis && Math.hypot(dx, dy) >= AXIS_LOCK_PX) g.axis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
    if (g.axis !== 'horizontal') return;
    event.preventDefault();
    const raw = startOffset.current + dx;
    const bounded = raw > 0 ? raw * 0.22 : raw < -maxReveal ? -maxReveal + (raw + maxReveal) * 0.22 : raw;
    setOffset(Math.max(-maxReveal - 32, Math.min(32, bounded)));
    g.lastX = event.clientX;
    g.lastTime = performance.now();
  };

  const finish = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g) return;
    const dx = event.clientX - g.startX;
    const elapsed = Math.max(1, performance.now() - g.startTime);
    const velocity = dx / elapsed;
    const commit = Math.abs(offset) >= maxReveal * COMMIT_RATIO || Math.abs(velocity) >= VELOCITY_PX_MS;
    if (g.axis === 'horizontal') {
      if (primaryAction && offset < -maxReveal * 0.9) primaryAction.onAction();
      setOpen(commit && offset < 0);
      setOffset(commit && offset < 0 ? -maxReveal : 0);
    }
    gesture.current = null;
  };

  const close = () => { setOpen(false); setOffset(0); gesture.current = null; };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-y-0 right-0 flex items-stretch" role="group" aria-label="Row actions">
        {actions.map((action) => (
          <button key={action.id} type="button" onClick={() => { action.onAction(); close(); }} className={`min-w-14 px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring-brand)] ${action.destructive ? 'text-[var(--error)]' : 'text-[var(--text-primary)]'} bg-[var(--surface-2)]`}>
            {action.label}
          </button>
        ))}
      </div>
      <motion.div
        animate={{ x: offset }}
        transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 38 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={close}
        style={{ touchAction: 'pan-y' }}
        className="relative z-[1]"
      >
        {children}
        {open && <button type="button" data-no-swipe onClick={close} className="absolute right-0 top-0 z-20 rounded p-1 text-sm focus:not-sr-only focus-visible:ring-2" aria-label="Close row actions">×</button>}
      </motion.div>
    </div>
  );
}
