import React, { useEffect, useRef, useState } from 'react';
import { Activity, Bot, Building2, CalendarDays, ChevronDown, CreditCard, FileText, FolderOpen, Gauge, GitBranch, Inbox, Megaphone, MessageSquare, Plug, ReceiptText, Settings2, Shield, Target, Users, Workflow } from 'lucide-react';
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

const canonicalNavigation: APEX3XNavigationSection[] = [
  { title: 'Core', items: [
    { key: 'dashboard', label: 'Command Center', icon: <Gauge className="h-4 w-4" /> },
    { key: 'conversations', label: 'Unified Inbox', icon: <Inbox className="h-4 w-4" /> },
  ] },
  { title: 'Attract & Capture', items: [
    { key: 'campaigns', label: 'Campaigns', icon: <Target className="h-4 w-4" /> },
    { key: 'advertising', label: 'Advertising', icon: <Megaphone className="h-4 w-4" /> },
    { key: 'creative_library', label: 'Creative Library', icon: <FolderOpen className="h-4 w-4" /> },
    { key: 'social_publishing', label: 'Social Publishing', icon: <MessageSquare className="h-4 w-4" /> },
    { key: 'forms', label: 'Forms & Web Capture', icon: <FileText className="h-4 w-4" /> },
    { key: 'growth_intelligence', label: 'Growth Intelligence', icon: <Activity className="h-4 w-4" /> },
  ] },
  { title: 'Qualify & Convert', items: [
    { key: 'leads', label: 'Leads', icon: <Users className="h-4 w-4" /> },
    { key: 'customers', label: 'Customers', icon: <Building2 className="h-4 w-4" /> },
  ] },
  { title: 'Book & Schedule', items: [{ key: 'bookings', label: 'Bookings & Calendar', icon: <CalendarDays className="h-4 w-4" /> }] },
  { title: 'Sell & Revenue', items: [
    { key: 'pipeline', label: 'Sales Pipeline', icon: <GitBranch className="h-4 w-4" /> },
    { key: 'invoices', label: 'Invoices & Payments', icon: <ReceiptText className="h-4 w-4" /> },
  ] },
  { title: 'Automation', items: [{ key: 'workflows', label: 'Automate', icon: <Workflow className="h-4 w-4" /> }] },
  { title: 'Connected Ecosystem', items: [
    { key: 'integrations', label: 'Integrations Hub', icon: <Plug className="h-4 w-4" /> },
    { key: 'ai_hub', label: 'AI Provider Hub', icon: <Bot className="h-4 w-4" /> },
  ] },
  { title: 'Governance', items: [
    { key: 'team', label: 'Team & Security', icon: <Shield className="h-4 w-4" /> },
    { key: 'billing', label: 'Billing & Entitlements', icon: <CreditCard className="h-4 w-4" /> },
    { key: 'settings', label: 'Workspace Settings', icon: <Settings2 className="h-4 w-4" /> },
  ] },
];

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ activeKey, onSelect }) => {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const activeLabel = canonicalNavigation.flatMap(section => section.items).find(item => item.key === activeKey)?.label || activeKey.replace('_', ' ');

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('pointerdown', handlePointerDown); document.removeEventListener('keydown', handleKeyDown); };
  }, [open]);

  return <div ref={rootRef} className="relative">
    <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)} className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]">
      <span className="capitalize">{activeLabel}</span>
      <motion.span animate={reducedMotion ? undefined : { rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}><ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]" /></motion.span>
    </button>
    <AnimatePresence>
      {open && <motion.div role="menu" initial={reducedMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reducedMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.16, ease: 'easeOut' }} className="absolute left-0 top-full z-40 mt-2 w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2 shadow-2xl shadow-black/40">
        <div className="grid gap-1 sm:grid-cols-2">{canonicalNavigation.map(section => <div key={section.title} className="p-1"><p className="px-2 py-1 text-[9px] font-semibold tracking-[0.12em] text-[var(--text-muted)]">{section.title}</p><div className="space-y-0.5">{section.items.map(item => { const active = item.key === activeKey; return <button key={item.key} type="button" role="menuitem" onClick={() => { onSelect(item.key); setOpen(false); }} className={`relative flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] ${active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{active && <motion.span layoutId="apex3x-navigation-active" className="absolute inset-0 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)]" transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }} />}<span className="relative z-10 shrink-0 text-[var(--text-muted)]">{item.icon}</span><span className="relative z-10 truncate">{item.label}</span>{item.badge && <span className="relative z-10 ml-auto rounded-full border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[9px] font-mono text-[var(--text-muted)]">{item.badge}</span>}</button>; })}</div></div>)}</div>
      </motion.div>}
    </AnimatePresence>
  </div>;
};
