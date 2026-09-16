import React from 'react';
import { CalendarPlus, ChevronRight, FilePlus2, FormInput, ListTodo, Megaphone, MessageSquarePlus, Plus, Receipt, Share2, Sparkles, UserPlus, Workflow } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavItemKey } from '../../types';
import { can, PermissionResource } from '../../security/permissions';

interface CreateItem { label: string; target: NavItemKey; resource: PermissionResource; icon: React.ReactNode; description: string; }

const CREATE_ITEMS: CreateItem[] = [
  { label: 'Lead', target: 'leads', resource: 'leads', icon: <UserPlus />, description: 'Capture a prospect and begin qualification.' },
  { label: 'Customer', target: 'customers', resource: 'customers', icon: <UserPlus />, description: 'Open the customer creation flow.' },
  { label: 'Conversation', target: 'unified_inbox', resource: 'inbox', icon: <MessageSquarePlus />, description: 'Start a business conversation.' },
  { label: 'Booking', target: 'bookings', resource: 'bookings', icon: <CalendarPlus />, description: 'Create a scheduled business activity.' },
  { label: 'Deal', target: 'pipeline', resource: 'sales', icon: <FilePlus2 />, description: 'Create an opportunity in the sales pipeline.' },
  { label: 'Invoice', target: 'invoices', resource: 'invoices', icon: <Receipt />, description: 'Open invoice creation in revenue operations.' },
  { label: 'Form', target: 'forms', resource: 'forms', icon: <FormInput />, description: 'Create a web capture form.' },
  { label: 'Campaign', target: 'campaigns', resource: 'campaigns', icon: <Megaphone />, description: 'Start a marketing campaign.' },
  { label: 'Advertisement', target: 'advertising', resource: 'campaigns', icon: <Sparkles />, description: 'Open advertising operations.' },
  { label: 'Social Post', target: 'social', resource: 'social', icon: <Share2 />, description: 'Create and schedule social content.' },
  { label: 'Workflow', target: 'workflows', resource: 'workflows', icon: <Workflow />, description: 'Create an automation workflow.' },
  { label: 'Task', target: 'tasks', resource: 'tasks', icon: <ListTodo />, description: 'Create assigned operational work.' },
];

export const GlobalCreate: React.FC = () => {
  const { currentUser, activeNav, setActiveNav } = useApp();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onPointer = (event: PointerEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey); };
  }, []);

  const available = CREATE_ITEMS.filter(item => can(currentUser, item.resource, 'create'));
  return <div ref={ref} className="relative">
    <button type="button" onClick={() => setOpen(value => !value)} aria-haspopup="menu" aria-expanded={open} className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg-brand)] px-2.5 text-xs font-semibold text-[var(--text-on-brand)] outline-none transition-colors hover:bg-[var(--bg-brand-hover)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]">
      <Plus className="size-3.5" aria-hidden="true" /> Create
    </button>
    {open && <div role="menu" aria-label="Create business object" className="absolute right-0 top-full z-[70] mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[0_18px_48px_-24px_rgba(0,0,0,0.95)]">
      <div className="border-b border-[var(--border)] px-4 py-3"><p className="text-sm font-semibold">Create</p><p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Start a business action without finding its module first.</p></div>
      <div className="max-h-[min(30rem,65vh)] overflow-y-auto p-1.5">{available.map(item => <button key={item.label} type="button" role="menuitem" onClick={() => { setActiveNav(item.target); setOpen(false); }} className={`group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left outline-none transition-colors hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] ${activeNav === item.target ? 'bg-[var(--surface-2)]' : ''}`}>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]">{React.cloneElement(item.icon as React.ReactElement, { className: 'size-4' })}</span><span className="min-w-0 flex-1"><span className="block text-xs font-medium">{item.label}</span><span className="mt-0.5 block truncate text-[10px] text-[var(--text-muted)]">{item.description}</span></span><ChevronRight className="size-3.5 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
      </button>)}{available.length === 0 && <div className="px-3 py-6 text-center text-xs text-[var(--text-muted)]">No creation actions are authorized for this account.</div>}</div>
    </div>}
  </div>;
};
