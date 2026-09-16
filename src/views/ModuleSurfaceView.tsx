import React from 'react';
import { ArrowRight, CheckCircle2, CircleAlert, Plus, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavItemKey } from '../types';
import { Button, Card, EmptyState, APEXReveal } from '../components/apex3x';

interface ModuleDefinition {
  title: string;
  group: string;
  purpose: string;
  nextAction: string;
  nextTarget?: NavItemKey;
  setup?: string;
  related: { label: string; target: NavItemKey }[];
}

const MODULES: Partial<Record<NavItemKey, ModuleDefinition>> = {
  unified_inbox: { title: 'Unified Inbox', group: 'Unified Inbox', purpose: 'Handle customer and lead communication with business context attached to every conversation.', nextAction: 'Open conversations', nextTarget: 'conversations', related: [{ label: 'Customers', target: 'customers' }, { label: 'Leads', target: 'leads' }, { label: 'Bookings', target: 'bookings' }] },
  campaigns: { title: 'Campaigns', group: 'Attract & Capture', purpose: 'Organize acquisition initiatives from channel and creative through leads, bookings, sales and revenue.', nextAction: 'Open campaign workspace', nextTarget: 'marketing', related: [{ label: 'Advertising', target: 'advertising' }, { label: 'Creative Library', target: 'creatives' }, { label: 'Growth Intelligence', target: 'growth' }] },
  advertising: { title: 'Advertising', group: 'Attract & Capture', purpose: 'Manage connected advertising activity and follow outcomes from spend to lead, conversion and revenue.', nextAction: 'Connect or manage advertising', nextTarget: 'integrations', setup: 'Advertising capabilities depend on a connected advertising account.', related: [{ label: 'Campaigns', target: 'campaigns' }, { label: 'Creative Library', target: 'creatives' }, { label: 'Growth Intelligence', target: 'growth' }] },
  creatives: { title: 'Creative Library', group: 'Attract & Capture', purpose: 'Centralize reusable images, videos, logos, documents, templates and marketing assets.', nextAction: 'Add creative', related: [{ label: 'Advertising', target: 'advertising' }, { label: 'Social Publishing', target: 'social' }, { label: 'Campaigns', target: 'campaigns' }] },
  social: { title: 'Social Publishing', group: 'Attract & Capture', purpose: 'Create, preview, schedule and publish social content using reusable Creative Library assets.', nextAction: 'Create social post', related: [{ label: 'Creative Library', target: 'creatives' }, { label: 'Campaigns', target: 'campaigns' }] },
  growth: { title: 'Growth Intelligence', group: 'Attract & Capture', purpose: 'Connect acquisition activity to lead quality, bookings, sales and revenue so marketing decisions are tied to business outcomes.', nextAction: 'Open growth intelligence', nextTarget: 'insights', related: [{ label: 'Campaigns', target: 'campaigns' }, { label: 'Advertising', target: 'advertising' }, { label: 'Revenue Intelligence', target: 'revenue' }] },
  qualified_leads: { title: 'Qualified Leads', group: 'Qualify & Convert', purpose: 'Work the leads that have reached qualification and expose their next business action.', nextAction: 'Open lead qualification', nextTarget: 'leads', related: [{ label: 'Leads', target: 'leads' }, { label: 'Bookings', target: 'bookings' }, { label: 'Sales Pipeline', target: 'pipeline' }] },
  calendar: { title: 'Calendar', group: 'Book & Schedule', purpose: 'View business availability, team calendars and scheduled activity without losing booking context.', nextAction: 'Open bookings calendar', nextTarget: 'bookings', related: [{ label: 'Bookings', target: 'bookings' }, { label: 'Customers', target: 'customers' }] },
  orders: { title: 'Sales / Orders', group: 'Sell & Revenue', purpose: 'Track commercial orders and their relationship to customers, deals, invoices and collected revenue.', nextAction: 'Open sales records', nextTarget: 'pipeline', related: [{ label: 'Sales Pipeline', target: 'pipeline' }, { label: 'Invoices & Payments', target: 'invoices' }, { label: 'Customers', target: 'customers' }] },
  revenue: { title: 'Revenue Intelligence', group: 'Sell & Revenue', purpose: 'Connect marketing spend, leads, bookings, sales, invoices and payments into a revenue operating view.', nextAction: 'Open business insights', nextTarget: 'insights', related: [{ label: 'Sales Pipeline', target: 'pipeline' }, { label: 'Invoices & Payments', target: 'invoices' }, { label: 'Growth Intelligence', target: 'growth' }] },
  rules: { title: 'Rules', group: 'Automate', purpose: 'Define permitted business conditions and the operational response APEX can apply.', nextAction: 'Open workflows', nextTarget: 'workflows', related: [{ label: 'Workflows', target: 'workflows' }, { label: 'Tasks', target: 'tasks' }, { label: 'Automation Runs', target: 'automation_runs' }] },
  tasks: { title: 'Tasks', group: 'Automate', purpose: 'Coordinate assigned operational work, due dates and follow-through across the business.', nextAction: 'Open task workspace', related: [{ label: 'Workflows', target: 'workflows' }, { label: 'Unified Inbox', target: 'unified_inbox' }] },
  automation_runs: { title: 'Automation Runs', group: 'Automate', purpose: 'Make every workflow execution observable with trigger, status, steps, result and failure context.', nextAction: 'Open workflow execution history', nextTarget: 'workflows', related: [{ label: 'Workflows', target: 'workflows' }, { label: 'Rules', target: 'rules' }] },
  security: { title: 'Security & Audit', group: 'Governance', purpose: 'Review security events, authorization changes and auditable operational activity.', nextAction: 'Open security audit', nextTarget: 'team', related: [{ label: 'Team & Permissions', target: 'team' }, { label: 'Workspace Settings', target: 'settings' }] },
  workspace_settings: { title: 'Workspace Settings', group: 'Governance', purpose: 'Configure business identity, localization, notifications and workspace-level operating preferences.', nextAction: 'Open workspace settings', nextTarget: 'settings', related: [{ label: 'Team & Permissions', target: 'team' }, { label: 'Integrations Hub', target: 'integrations' }] },
};

export const ModuleSurfaceView: React.FC = () => {
  const { activeNav, setActiveNav } = useApp();
  const definition = MODULES[activeNav];
  if (!definition) return null;

  return <div className="space-y-6 pb-12">
    <APEXReveal>
      <div className="space-y-2">
        <p className="text-[11px] font-medium text-[var(--text-muted)]">{definition.group}</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.04em]">{definition.title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{definition.purpose}</p>
      </div>
    </APEXReveal>

    <Card variant="elevated" padding="lg">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2 text-[var(--text-secondary)]"><Search className="size-4" /></div>
          <div><h2 className="text-sm font-semibold">What should I do next?</h2><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">APEX keeps the next operational action visible instead of requiring module knowledge.</p>{definition.setup && <p className="mt-3 flex items-start gap-2 text-xs text-[var(--text-secondary)]"><CircleAlert className="mt-0.5 size-3.5 shrink-0" />{definition.setup}</p>}</div>
        </div>
        <Button variant="primary" size="sm" onClick={() => definition.nextTarget && setActiveNav(definition.nextTarget)} leftIcon={<Plus className="size-3.5" />}>{definition.nextAction}</Button>
      </div>
    </Card>

    <div className="grid gap-4 md:grid-cols-3">
      {definition.related.map(item => <button key={item.target} type="button" onClick={() => setActiveNav(item.target)} className="text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] rounded-xl"><Card padding="md" className="h-full transition-colors hover:bg-[var(--surface-2)]"><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium">{item.label}</span><ArrowRight className="size-4 text-[var(--text-muted)]" /></div><p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">Continue with related business context.</p></Card></button>)}
    </div>

    <EmptyState icon={<CheckCircle2 className="size-5" />} title="Connected data appears here" description="This canonical surface is ready to present workspace-backed records and actions without inventing business data in the frontend." />
  </div>;
};
