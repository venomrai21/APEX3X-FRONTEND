import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, ChevronDown, ChevronRight, Circle, Loader2, ShieldCheck, Wrench } from 'lucide-react';

export const APEXConversation: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`space-y-3 ${className}`} {...props}>{children}</div>
);

export const APEXReasoning: React.FC<{ title?: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title = 'Reasoning', children, defaultOpen = true }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black">
      <button type="button" onClick={() => setOpen(v => !v)} className="flex w-full items-center justify-between gap-3 p-3 text-left text-xs font-semibold text-zinc-200">
        <span className="flex items-center gap-2"><ChevronRight className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-90' : ''}`} />{title}</span>
        <span className="text-[10px] font-mono text-zinc-500">TRACE</span>
      </button>
      {open && <div className="border-t border-white/[0.06] p-3 text-xs leading-relaxed text-zinc-400">{children}</div>}
    </div>
  );
};

export const APEXToolCall: React.FC<{ tool: string; status?: 'queued' | 'running' | 'complete' | 'blocked'; children?: React.ReactNode }> = ({ tool, status = 'complete', children }) => {
  const reducedMotion = useReducedMotion();
  const icon = status === 'complete' ? <Check className="h-3.5 w-3.5" /> : status === 'running' ? <Loader2 className="h-3.5 w-3.5" /> : status === 'blocked' ? <ShieldCheck className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#08080c] p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-semibold text-zinc-200"><Wrench className="h-3.5 w-3.5 text-zinc-400" />{tool}</span>
        <motion.span animate={status === 'running' && !reducedMotion ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 1, repeat: status === 'running' && !reducedMotion ? Infinity : 0, ease: 'linear' }} className="text-zinc-400">{icon}</motion.span>
      </div>
      {children && <div className="mt-2 text-[11px] text-zinc-500">{children}</div>}
    </div>
  );
};

export const APEXTaskList: React.FC<{ tasks: Array<{ label: string; status: 'pending' | 'running' | 'complete' | 'blocked' }> }> = ({ tasks }) => (
  <div className="space-y-2 rounded-xl border border-white/[0.08] bg-black p-3">
    {tasks.map(task => <div key={task.label} className="flex items-center gap-2 text-xs">
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/[0.12] text-zinc-300">{task.status === 'complete' ? <Check className="h-2.5 w-2.5" /> : task.status === 'running' ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}</span>
      <span className={task.status === 'complete' ? 'text-zinc-400 line-through' : 'text-zinc-200'}>{task.label}</span>
      <span className="ml-auto font-mono text-[9px] uppercase text-zinc-600">{task.status}</span>
    </div>)}
  </div>
);

export const APEXApproval: React.FC<{ required?: boolean; approved?: boolean; children: React.ReactNode; onApprove?: () => void }> = ({ required = true, approved = false, children, onApprove }) => (
  <div className="rounded-xl border border-white/[0.12] bg-[#09090d] p-3">
    <div className="flex items-start gap-3">
      <ShieldCheck className="mt-0.5 h-4 w-4 text-zinc-300" />
      <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-zinc-200">{required ? 'Approval required' : 'Approval recorded'}</p><p className="mt-1 text-[11px] text-zinc-500">{children}</p></div>
      {required && !approved && onApprove && <button type="button" onClick={onApprove} className="rounded-lg border border-white/[0.14] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-black transition-transform hover:-translate-y-px active:scale-[0.985]">Approve</button>}
      {approved && <span className="rounded-full border border-white/[0.10] px-2 py-1 text-[9px] font-mono uppercase text-zinc-400">Approved</span>}
    </div>
  </div>
);

export const APEXContextMeter: React.FC<{ value: number; label?: string }> = ({ value, label = 'Context' }) => {
  const clamped = Math.max(0, Math.min(100, value));
  return <div className="space-y-1.5"><div className="flex items-center justify-between text-[10px] font-mono text-zinc-500"><span>{label}</span><span>{clamped}%</span></div><div className="h-1 overflow-hidden rounded-full bg-white/[0.06]"><motion.div className="h-full bg-white" initial={{ width: 0 }} animate={{ width: `${clamped}%` }} transition={{ duration: 0.35 }} /></div></div>;
};

export const APEXArtifact: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#07070b]"><div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2"><span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Artifact</span><span className="text-xs font-semibold text-zinc-200">{title}</span></div><div className="p-3">{children}</div></div>;

export const APEXDiff: React.FC<{ before: React.ReactNode; after: React.ReactNode }> = ({ before, after }) => <div className="grid gap-2 md:grid-cols-2"><div className="rounded-lg border border-white/[0.06] bg-[#08080c] p-3"><p className="mb-1 text-[9px] font-mono uppercase text-zinc-600">Before</p><div className="text-xs text-zinc-500">{before}</div></div><div className="rounded-lg border border-white/[0.08] bg-[#0b0b10] p-3"><p className="mb-1 text-[9px] font-mono uppercase text-zinc-600">After</p><div className="text-xs text-zinc-200">{after}</div></div></div>;

export const APEXDynamicIsland: React.FC<{ label: string; value?: string; children?: React.ReactNode }> = ({ label, value, children }) => <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/[0.10] bg-[#08080c] px-3 py-1.5 shadow-[0_12px_30px_-18px_rgba(255,255,255,0.22)]"><span className="h-1.5 w-1.5 rounded-full bg-white" /><span className="text-[10px] font-semibold text-zinc-300">{label}</span>{value && <span className="text-[10px] font-mono text-zinc-500">{value}</span>}{children}</div>;
