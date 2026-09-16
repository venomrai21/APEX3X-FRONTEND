import React, { useState, useEffect } from 'react';
import { Search, Command, ArrowRight, Bot, Plug, FileText, UserPlus, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavItemKey } from '../../types';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveNav, setConnectDrawerOpen } = useApp();
  const [query, setQuery] = useState('');
  useEffect(() => { if (!commandPaletteOpen) setQuery(''); }, [commandPaletteOpen]);
  if (!commandPaletteOpen) return null;

  const quickActions = [
    { id: 'open_brain', label: 'Open Revenue Audit', category: 'Autonomous Brain', icon: <Bot className="w-4 h-4 text-[var(--text-secondary)]" />, action: () => { setActiveNav('brain'); setCommandPaletteOpen(false); } },
    { id: 'act_lead', label: 'Add Inbound Lead', category: 'CRM', icon: <UserPlus className="w-4 h-4 text-[var(--text-muted)]" />, action: () => { setActiveNav('leads'); setCommandPaletteOpen(false); } },
    { id: 'act_invoice', label: 'Create Commercial Invoice', category: 'Revenue', icon: <FileText className="w-4 h-4 text-[var(--text-muted)]" />, action: () => { setActiveNav('invoices'); setCommandPaletteOpen(false); } },
    { id: 'act_booking', label: 'Schedule Customer Session', category: 'Bookings', icon: <Calendar className="w-4 h-4 text-[var(--text-muted)]" />, action: () => { setActiveNav('bookings'); setCommandPaletteOpen(false); } },
    { id: 'act_connect', label: '+ Connect Provider', category: 'Ecosystem', icon: <Plug className="w-4 h-4 text-[var(--text-muted)]" />, action: () => { setCommandPaletteOpen(false); setConnectDrawerOpen(true); } },
  ];
  const navigationTargets: { label: string; key: NavItemKey; category: string }[] = [
    { label: 'Operational Command Center', key: 'dashboard', category: 'Navigation' },
    { label: 'APEX3X Autonomous Brain', key: 'brain', category: 'Navigation' },
    { label: 'AI Business Insights', key: 'insights', category: 'Navigation' },
    { label: 'CRM & Qualified Leads', key: 'leads', category: 'Navigation' },
    { label: 'Customer Directory', key: 'customers', category: 'Navigation' },
    { label: 'Unified Conversations', key: 'conversations', category: 'Navigation' },
    { label: 'Appointments & Calendar', key: 'bookings', category: 'Navigation' },
    { label: 'Sales Pipeline', key: 'pipeline', category: 'Navigation' },
    { label: 'Invoices, Collections & Payments', key: 'invoices', category: 'Navigation' },
    { label: 'Forms & Website Capture', key: 'forms', category: 'Navigation' },
    { label: 'Marketing & Ad Intelligence', key: 'marketing', category: 'Navigation' },
    { label: 'Workflows & Rules', key: 'workflows', category: 'Navigation' },
    { label: 'Integration Ecosystem', key: 'integrations', category: 'Navigation' },
    { label: 'AI Provider Hub (BYOK)', key: 'ai_hub', category: 'Navigation' },
    { label: 'Team Members & Security', key: 'team', category: 'Navigation' },
    { label: 'Billing & Entitlements', key: 'billing', category: 'Navigation' },
    { label: 'Workspace Profile & Verification', key: 'settings', category: 'Navigation' },
  ];
  const q = query.toLowerCase();
  const filteredActions = quickActions.filter(a => a.label.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  const filteredNav = navigationTargets.filter(n => n.label.toLowerCase().includes(q) || n.key.toLowerCase().includes(q));

  return <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto"><div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setCommandPaletteOpen(false)} /><div className="relative w-full max-w-xl bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-10"><div className="flex items-center px-4 py-3.5 border-b border-[var(--border)] bg-[var(--surface)]"><Search className="w-4 h-4 text-[var(--text-secondary)] mr-3" /><input autoFocus type="text" placeholder="Type a command, module, or business action..." value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none" /><kbd className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--surface-2)] border border-[var(--border)] rounded">ESC</kbd></div><div className="max-h-96 overflow-y-auto p-2 space-y-3">{filteredActions.length > 0 && <div><p className="px-3 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Business Actions</p><div className="space-y-1">{filteredActions.map(action => <button key={action.id} onClick={action.action} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors cursor-pointer group"><div className="flex items-center gap-3"><div className="p-1 rounded bg-[var(--surface-2)] border border-[var(--border)]">{action.icon}</div><span className="font-medium">{action.label}</span></div><ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]" /></button>)}</div></div>}{filteredNav.length > 0 && <div><p className="px-3 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Operating System Modules</p><div className="space-y-0.5">{filteredNav.map(nav => <button key={nav.key} onClick={() => { setActiveNav(nav.key); setCommandPaletteOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"><div className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" /><span>{nav.label}</span></div><span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">{nav.key}</span></button>)}</div></div>}{filteredActions.length === 0 && filteredNav.length === 0 && <div className="py-8 text-center text-xs text-[var(--text-muted)]">No actions matching “{query}”.</div>}</div><div className="px-4 py-2 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono"><span className="flex items-center gap-1.5"><Command className="w-3 h-3" /> APEX3X Command System</span><span>↑↓ Navigate · ↵ Select</span></div></div></div>;
};
