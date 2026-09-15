import React from 'react';
import { Pin } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

export interface PinnedListItem { id: string; title: string; meta?: React.ReactNode; pinned?: boolean; }

export const PinnedList: React.FC<{ items: PinnedListItem[]; onTogglePin?: (id: string) => void; renderItem?: (item: PinnedListItem) => React.ReactNode; className?: string }> = ({ items, onTogglePin, renderItem, className = '' }) => {
  const reduceMotion = useReducedMotion();
  const ordered = [...items].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  return <div className={`space-y-1.5 ${className}`}>{ordered.map(item => <motion.div key={item.id} layout={!reduceMotion} className="flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-white/[0.035]">{renderItem ? <div className="min-w-0 flex-1">{renderItem(item)}</div> : <div className="min-w-0 flex-1"><div className="text-xs text-zinc-200 truncate">{item.title}</div>{item.meta && <div className="text-[10px] text-zinc-500 mt-0.5">{item.meta}</div>}</div>}{onTogglePin && <button type="button" onClick={() => onTogglePin(item.id)} aria-label={`${item.pinned ? 'Unpin' : 'Pin'} ${item.title}`} className={`p-1 rounded ${item.pinned ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'}`}><Pin className="w-3.5 h-3.5" /></button>}</motion.div>)}</div>;
};
