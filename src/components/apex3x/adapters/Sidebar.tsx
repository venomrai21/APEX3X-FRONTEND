import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

export interface APEX3XSidebarItem { key: string; label: string; icon: React.ReactNode; badge?: string; }
export interface APEX3XSidebarSection { title: string; items: APEX3XSidebarItem[]; }
export interface SidebarProps { sections: APEX3XSidebarSection[]; activeKey: string; onSelect: (key: string) => void; onMobileSelect?: () => void; mobile?: boolean; collapsed?: boolean; }

const SECTION_STORAGE_KEY = 'apex3x-sidebar-sections';

export const Sidebar: React.FC<SidebarProps> = ({ sections, activeKey, onSelect, onMobileSelect, mobile = false, collapsed = false }) => {
  const reduceMotion = useReducedMotion();
  const iconOnly = collapsed && !mobile;
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>(() => {
    try {
      const saved = window.localStorage.getItem(SECTION_STORAGE_KEY);
      return saved ? JSON.parse(saved) as Record<string, boolean> : Object.fromEntries(sections.map((section) => [section.title, true]));
    } catch {
      return Object.fromEntries(sections.map((section) => [section.title, true]));
    }
  });

  React.useEffect(() => {
    setExpandedSections((current) => {
      const next = { ...current };
      sections.forEach((section) => { if (!(section.title in next)) next[section.title] = true; });
      return next;
    });
  }, [sections]);

  const toggleSection = (title: string) => setExpandedSections((current) => {
    const next = { ...current, [title]: !current[title] };
    try { window.localStorage.setItem(SECTION_STORAGE_KEY, JSON.stringify(next)); } catch { /* persistence is best-effort */ }
    return next;
  });

  return <div className={mobile ? 'space-y-4' : 'min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-2.5 space-y-4'}>
    {sections.map(section => {
      const expanded = expandedSections[section.title] !== false;
      return <div key={section.title} className="space-y-0.5" role="group" aria-label={section.title}>
        {!iconOnly && <button type="button" onClick={() => toggleSection(section.title)} aria-expanded={expanded} className="flex w-full items-center justify-between rounded-md px-2.5 py-1 text-left text-[10px] font-medium tracking-wide text-[var(--text-muted)] outline-none transition-colors hover:text-[var(--text-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]">
          <span className="truncate">{section.title}</span>
          <ChevronDown className={`size-3 shrink-0 transition-transform ${expanded ? '' : '-rotate-90'}`} aria-hidden="true" />
        </button>}
        {(iconOnly || expanded) && section.items.map(item => {
          const isActive = activeKey === item.key;
          return <button key={item.key} type="button" onClick={() => { onSelect(item.key); onMobileSelect?.(); }} aria-current={isActive ? 'page' : undefined} aria-label={iconOnly ? item.label : undefined} title={iconOnly ? item.label : undefined} className={`relative w-full flex items-center ${iconOnly ? 'justify-center px-1.5' : 'justify-between px-2.5'} py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar)] ${isActive ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'}`}>
            {isActive && <motion.span layoutId="apex3x-sidebar-active" className="absolute inset-0 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)]" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative z-10 flex min-w-0 items-center gap-2.5"><span className={isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>{item.icon}</span>{!iconOnly && <span className="truncate">{item.label}</span>}</span>
            {!iconOnly && item.badge && <span className="relative z-10 text-[9px] px-1.5 py-0.2 rounded bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)] font-mono">{item.badge}</span>}
          </button>;
        })}
      </div>;
    })}
  </div>;
};
