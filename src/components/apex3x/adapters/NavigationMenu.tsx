import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

export interface APEX3XNavigationSection {
  title: string;
  items: { key: string; label: string; icon: React.ReactNode; badge?: string }[];
}

interface NavigationMenuProps {
  sections: APEX3XNavigationSection[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ sections, activeKey, onSelect }) => {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const activeLabel = sections.flatMap(section => section.items).find(item => item.key === activeKey)?.label || activeKey.replace('_', ' ');

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-zinc-100 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
      >
        <span className="capitalize">{activeLabel}</span>
        <motion.span animate={reducedMotion ? undefined : { rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={reducedMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.16, ease: 'easeOut' }}
            className="absolute left-0 top-full z-40 mt-2 w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-white/[0.1] bg-[#0b0b11]/98 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            <div className="grid gap-1 sm:grid-cols-2">
              {sections.map(section => (
                <div key={section.title} className="p-1">
                  <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-600">{section.title}</p>
                  <div className="space-y-0.5">
                    {section.items.map(item => {
                      const active = item.key === activeKey;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          role="menuitem"
                          onClick={() => { onSelect(item.key); setOpen(false); }}
                          className={`relative flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 ${active ? 'text-amber-200' : 'text-zinc-400 hover:text-zinc-100'}`}
                        >
                          {active && (
                            <motion.span
                              layoutId="apex3x-navigation-active"
                              className="absolute inset-0 rounded-lg bg-amber-500/10"
                              transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }}
                            />
                          )}
                          <span className="relative z-10 shrink-0">{item.icon}</span>
                          <span className="relative z-10 truncate">{item.label}</span>
                          {item.badge && <span className="relative z-10 ml-auto text-[9px] text-amber-300">{item.badge}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
