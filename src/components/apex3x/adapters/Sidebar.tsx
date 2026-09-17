import React from 'react';
import { Activity, Bot, Building2, CalendarDays, CreditCard, FileText, FolderOpen, Gauge, GitBranch, Inbox, Megaphone, MessageSquare, Plug, ReceiptText, Settings2, Shield, Target, Users, Workflow } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

export interface APEX3XSidebarItem { key: string; label: string; icon: React.ReactNode; badge?: string; }
export interface APEX3XSidebarSection { title: string; items: APEX3XSidebarItem[]; }
export interface SidebarProps { sections: APEX3XSidebarSection[]; activeKey: string; onSelect: (key: string) => void; onMobileSelect?: () => void; mobile?: boolean; collapsed?: boolean; }

const SECTION_STORAGE_KEY = 'apex3x-sidebar-sections';

const canonicalNavigation: Array<{ title?: string; direct?: APEX3XSidebarItem; items?: APEX3XSidebarItem[] }> = [
  { direct: { key: 'dashboard', label: 'Command Center', icon: <Gauge className="w-4 h-4" /> } },
  { direct: { key: 'conversations', label: 'Unified Inbox', icon: <Inbox className="w-4 h-4" /> } },
  { title: 'Attract & Capture', items: [
    { key: 'campaigns', label: 'Campaigns', icon: <Target className="w-4 h-4" /> },
    { key: 'advertising', label: 'Advertising', icon: <Megaphone className="w-4 h-4" /> },
    { key: 'creative_library', label: 'Creative Library', icon: <FolderOpen className="w-4 h-4" /> },
    { key: 'social_publishing', label: 'Social Publishing', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'forms', label: 'Forms & Web Capture', icon: <FileText className="w-4 h-4" /> },
    { key: 'growth_intelligence', label: 'Growth Intelligence', icon: <Activity className="w-4 h-4" /> },
  ] },
  { title: 'Qualify & Convert', items: [
    { key: 'leads', label: 'Leads', icon: <Users className="w-4 h-4" /> },
    { key: 'customers', label: 'Customers', icon: <Building2 className="w-4 h-4" /> },
  ] },
  { title: 'Book & Schedule', items: [
    { key: 'bookings', label: 'Bookings & Calendar', icon: <CalendarDays className="w-4 h-4" /> },
  ] },
  { title: 'Sell & Revenue', items: [
    { key: 'pipeline', label: 'Sales Pipeline', icon: <GitBranch className="w-4 h-4" /> },
    { key: 'invoices', label: 'Invoices & Payments', icon: <ReceiptText className="w-4 h-4" /> },
  ] },
  { direct: { key: 'workflows', label: 'Automate', icon: <Workflow className="w-4 h-4" /> } },
  { title: 'Connected Ecosystem', items: [
    { key: 'integrations', label: 'Integrations Hub', icon: <Plug className="w-4 h-4" /> },
    { key: 'ai_hub', label: 'AI Provider Hub', icon: <Bot className="w-4 h-4" /> },
  ] },
  { title: 'Governance', items: [
    { key: 'team', label: 'Team & Security', icon: <Shield className="w-4 h-4" /> },
    { key: 'billing', label: 'Billing & Entitlements', icon: <CreditCard className="w-4 h-4" /> },
    { key: 'settings', label: 'Workspace Settings', icon: <Settings2 className="w-4 h-4" /> },
  ] },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeKey, onSelect, onMobileSelect, mobile = false, collapsed = false }) => {
  const reduceMotion = useReducedMotion();
  const iconOnly = collapsed && !mobile;
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>(() => {
    try {
      const saved = window.localStorage.getItem(SECTION_STORAGE_KEY);
      return saved ? JSON.parse(saved) as Record<string, boolean> : Object.fromEntries(canonicalNavigation.filter(item => item.title).map(item => [item.title, true]));
    } catch {
      return Object.fromEntries(canonicalNavigation.filter(item => item.title).map(item => [item.title, true]));
    }
  });

  const toggleSection = (title: string) => setExpandedSections(current => {
    const next = { ...current, [title]: !current[title] };
    try { window.localStorage.setItem(SECTION_STORAGE_KEY, JSON.stringify(next)); } catch { /* persistence is best-effort */ }
    return next;
  });

  const renderItem = (item: APEX3XSidebarItem) => {
    const isActive = activeKey === item.key;
    return <button key={item.key} type="button" onClick={() => { onSelect(item.key); onMobileSelect?.(); }} aria-current={isActive ? 'page' : undefined} aria-label={iconOnly ? item.label : undefined} title={iconOnly ? item.label : undefined} className={`relative w-full flex items-center ${iconOnly ? 'justify-center px-1.5' : 'justify-between px-2.5'} py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar)] ${isActive ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'}`}>
      {isActive && <motion.span layoutId="apex3x-sidebar-active" className="absolute inset-0 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)]" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }} />}
      <span className="relative z-10 flex min-w-0 items-center gap-2.5"><span className={isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>{item.icon}</span>{!iconOnly && <span className="truncate">{item.label}</span>}</span>
      {!iconOnly && item.badge && <span className="relative z-10 text-[9px] px-1.5 py-0.2 rounded bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)] font-mono">{item.badge}</span>}
    </button>;
  };

  return <div className={mobile ? 'space-y-4 p-2.5' : 'min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-2.5 space-y-4'}>
    {canonicalNavigation.map((entry, index) => {
      if (entry.direct) return <div key={entry.direct.key} className="space-y-0.5">{renderItem(entry.direct)}</div>;
      const title = entry.title as string;
      const expanded = expandedSections[title] !== false;
      return <div key={title} className="space-y-0.5" role="group" aria-label={title}>
        {!iconOnly && <button type="button" onClick={() => toggleSection(title)} aria-expanded={expanded} aria-controls={`apex3x-nav-${index}`} className="flex w-full items-center justify-between rounded-md px-2.5 py-1 text-left text-[10px] font-medium tracking-wide text-[var(--text-muted)] outline-none transition-colors hover:text-[var(--text-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]">
          <span className="truncate">{title}</span><ChevronDown className={`size-3 shrink-0 transition-transform ${expanded ? '' : '-rotate-90'}`} aria-hidden="true" />
        </button>}
        {(iconOnly || expanded) && <div id={`apex3x-nav-${index}`} className="space-y-0.5">{entry.items?.map(renderItem)}</div>}
      </div>;
    })}
  </div>;
};
