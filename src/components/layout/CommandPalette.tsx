import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Calendar, Command, FileText, ListTodo, Megaphone, MessageSquare, Plug, Receipt, Search, Sparkles, UserPlus, Workflow } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavItemKey } from '../../types';
import { can, PermissionResource } from '../../security/permissions';

interface Target { label: string; key: NavItemKey; category: string; resource: PermissionResource; }

const TARGETS: Target[] = [
  { label: 'Command Center', key: 'dashboard', category: 'Command', resource: 'command_center' },
  { label: 'Unified Inbox', key: 'unified_inbox', category: 'Communication', resource: 'inbox' },
  { label: 'Campaigns', key: 'campaigns', category: 'Attract & Capture', resource: 'campaigns' },
  { label: 'Advertising', key: 'advertising', category: 'Attract & Capture', resource: 'campaigns' },
  { label: 'Creative Library', key: 'creatives', category: 'Attract & Capture', resource: 'creatives' },
  { label: 'Social Publishing', key: 'social', category: 'Attract & Capture', resource: 'social' },
  { label: 'Forms & Web Capture', key: 'forms', category: 'Attract & Capture', resource: 'forms' },
  { label: 'Growth Intelligence', key: 'growth', category: 'Attract & Capture', resource: 'campaigns' },
  { label: 'Leads', key: 'leads', category: 'Qualify & Convert', resource: 'leads' },
  { label: 'Qualified Leads', key: 'qualified_leads', category: 'Qualify & Convert', resource: 'leads' },
  { label: 'Customers', key: 'customers', category: 'Qualify & Convert', resource: 'customers' },
  { label: 'Bookings', key: 'bookings', category: 'Book & Schedule', resource: 'bookings' },
  { label: 'Calendar', key: 'calendar', category: 'Book & Schedule', resource: 'bookings' },
  { label: 'Sales Pipeline', key: 'pipeline', category: 'Sell & Revenue', resource: 'sales' },
  { label: 'Sales / Orders', key: 'orders', category: 'Sell & Revenue', resource: 'sales' },
  { label: 'Invoices & Payments', key: 'invoices', category: 'Sell & Revenue', resource: 'invoices' },
  { label: 'Revenue Intelligence', key: 'revenue', category: 'Sell & Revenue', resource: 'sales' },
  { label: 'Workflows', key: 'workflows', category: 'Automate', resource: 'workflows' },
  { label: 'Rules', key: 'rules', category: 'Automate', resource: 'workflows' },
  { label: 'Tasks', key: 'tasks', category: 'Automate', resource: 'tasks' },
  { label: 'Automation Runs', key: 'automation_runs', category: 'Automate', resource: 'workflows' },
  { label: 'Integrations Hub', key: 'integrations', category: 'Connected Ecosystem', resource: 'integrations' },
  { label: 'AI Provider Hub', key: 'ai_hub', category: 'Connected Ecosystem', resource: 'ai' },
  { label: 'Team & Permissions', key: 'team', category: 'Governance', resource: 'team' },
  { label: 'Security & Audit', key: 'security', category: 'Governance', resource: 'audit' },
  { label: 'Billing & Entitlements', key: 'billing', category: 'Governance', resource: 'billing' },
  { label: 'Workspace Settings', key: 'workspace_settings', category: 'Governance', resource: 'workspace' },
];

const ACTIONS: Array<{ label: string; description: string; target: NavItemKey; resource: PermissionResource; icon: React.ReactNode }> = [
  { label: 'Create Lead', description: 'Capture a prospect and begin qualification.', target: 'leads', resource: 'leads', icon: <UserPlus /> },
  { label: 'Create Customer', description: 'Open the customer creation flow.', target: 'customers', resource: 'customers', icon: <UserPlus /> },
  { label: 'Create Conversation', description: 'Start a business conversation.', target: 'unified_inbox', resource: 'inbox', icon: <MessageSquare /> },
  { label: 'Create Booking', description: 'Create a scheduled business activity.', target: 'bookings', resource: 'bookings', icon: <Calendar /> },
  { label: 'Create Deal', description: 'Create an opportunity in the sales pipeline.', target: 'pipeline', resource: 'sales', icon: <FileText /> },
  { label: 'Create Invoice', description: 'Open invoice creation in revenue operations.', target: 'invoices', resource: 'invoices', icon: <Receipt /> },
  { label: 'Create Form', description: 'Create a web capture form.', target: 'forms', resource: 'forms', icon: <FileText /> },
  { label: 'Create Campaign', description: 'Start a marketing campaign.', target: 'campaigns', resource: 'campaigns', icon: <Megaphone /> },
  { label: 'Create Social Post', description: 'Create and schedule social content.', target: 'social', resource: 'social', icon: <Sparkles /> },
  { label: 'Create Workflow', description: 'Create an automation workflow.', target: 'workflows', resource: 'workflows', icon: <Workflow /> },
  { label: 'Create Task', description: 'Create assigned operational work.', target: 'tasks', resource: 'tasks', icon: <ListTodo /> },
  { label: 'Connect Integration', description: 'Open the connected ecosystem.', target: 'integrations', resource: 'integrations', icon: <Plug /> },
];

export const CommandPalette: React.FC = () => {
  const { currentUser, commandPaletteOpen, setCommandPaletteOpen, setActiveNav } = useApp();
  const [query, setQuery] = useState('');
  useEffect(() => { if (!commandPaletteOpen) setQuery(''); }, [commandPaletteOpen]);
  const visibleTargets = useMemo(() => TARGETS.filter(item => can(currentUser, item.resource, 'view')), [currentUser]);
  const visibleActions = useMemo(() => ACTIONS.filter(item => can(currentUser, item.resource, 'create')), [currentUser]);
  if (!commandPaletteOpen) return null;
  const q = query.trim().toLowerCase();
  const actions = visibleActions.filter(item => !q || `${item.label} ${item.description}`.toLowerCase().includes(q));
  const targets = visibleTargets.filter(item => !q || `${item.label} ${item.category} ${item.key}`.toLowerCase().includes(q));
  const go = (target: NavItemKey) => { setActiveNav(target); setCommandPaletteOpen(false); };

  return <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-16 sm:pt-24 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Global search and actions">
    <button type="button" className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-default" aria-label="Close search" onClick={() => setCommandPaletteOpen(false)} />
    <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[0_24px_64px_-28px_rgba(0,0,0,0.95)]">
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5"><Search className="size-4 text-[var(--text-muted)]" /><input autoFocus type="text" placeholder="Search business objects, actions, or areas..." value={query} onChange={event => setQuery(event.target.value)} className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none" /><kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)]">ESC</kbd></div>
      <div className="max-h-[min(34rem,70vh)] overflow-y-auto p-2">
        {actions.length > 0 && <section><p className="px-3 py-1.5 text-[10px] font-medium text-[var(--text-muted)]">Actions</p>{actions.map(item => <button key={item.label} type="button" onClick={() => go(item.target)} className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left outline-none hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]">{React.cloneElement(item.icon as React.ReactElement, { className: 'size-4' })}</span><span className="min-w-0 flex-1"><span className="block text-xs font-medium">{item.label}</span><span className="block truncate text-[10px] text-[var(--text-muted)]">{item.description}</span></span><ArrowRight className="size-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" /></button>)}</section>}
        {targets.length > 0 && <section className="mt-2 border-t border-[var(--border)] pt-2"><p className="px-3 py-1.5 text-[10px] font-medium text-[var(--text-muted)]">Business areas</p>{targets.map(item => <button key={item.key} type="button" onClick={() => go(item.key)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left outline-none hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]"><span><span className="block text-xs text-[var(--text-primary)]">{item.label}</span><span className="block text-[10px] text-[var(--text-muted)]">{item.category}</span></span><span className="text-[10px] font-mono text-[var(--text-subtle)]">{item.key}</span></button>)}</section>}
        {actions.length === 0 && targets.length === 0 && <div className="px-3 py-10 text-center text-xs text-[var(--text-muted)]">No authorized result matches “{query}”.</div>}
      </div>
      <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2 text-[10px] text-[var(--text-muted)]"><span className="flex items-center gap-1.5"><Command className="size-3" /> APEX OS</span><span>Search · navigate · act</span></div>
    </div>
  </div>;
};
