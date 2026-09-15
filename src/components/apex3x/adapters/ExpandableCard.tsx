import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

export const ExpandableCard: React.FC<{ title: string; summary?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; className?: string }> = ({ title, summary, children, defaultOpen = false, className = '' }) => {
  const [open, setOpen] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();
  return (
    <div className={`rounded-xl bg-[#0d0d13] border border-white/[0.08] overflow-hidden ${className}`}>
      <button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open} className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-white/[0.025] transition-colors">
        <span className="min-w-0"><span className="block text-sm font-semibold text-zinc-100 truncate">{title}</span>{summary && <span className="block text-[11px] text-zinc-500 mt-1">{summary}</span>}</span>
        <motion.span animate={reduceMotion ? undefined : { rotate: open ? 180 : 0 }}><ChevronDown className="w-4 h-4 text-zinc-500" /></motion.span>
      </button>
      {open && <motion.div initial={reduceMotion ? undefined : { opacity: 0, height: 0 }} animate={reduceMotion ? undefined : { opacity: 1, height: 'auto' }} className="border-t border-white/[0.06] p-4">{children}</motion.div>}
    </div>
  );
};
