import React from 'react';
import { ArrowRight, CheckCircle2, CircleDashed, LockKeyhole } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, Button } from '../components/apex3x';
import { NavItemKey } from '../types';

type ModuleDefinition = {
  title: string;
  eyebrow: string;
  purpose: string;
  nextAction: string;
  related: Array<{ label: string; key: NavItemKey }>;
};

const definitions: Partial<Record<NavItemKey, ModuleDefinition>> = {
  campaigns: { title: 'Campaigns', eyebrow: 'Attract & Capture', purpose: 'Plan, create, monitor, and understand acquisition campaigns across connected channels.', nextAction: 'Connect the acquisition systems that will supply campaign data.', related: [{ label: 'Advertising', key: 'advertising' }, { label: 'Creative Library', key: 'creative_library' }] },
  advertising: { title: 'Advertising', eyebrow: 'Attract & Capture', purpose: 'Operate connected advertising channels and relate spend, outcomes, and acquisition leakage.', nextAction: 'Connect an advertising system to make channel operations available here.', related: [{ label: 'Campaigns', key: 'campaigns' }, { label: 'Growth Intelligence', key: 'growth_intelligence' }] },
  creative_library: { title: 'Creative Library', eyebrow: 'Attract & Capture', purpose: 'Manage the creative assets used across acquisition and marketing operations.', nextAction: 'Connect the systems or asset sources your business uses for creative operations.', related: [{ label: 'Campaigns', key: 'campaigns' }, { label: 'Social Publishing', key: 'social_publishing' }] },
  social_publishing: { title: 'Social Publishing', eyebrow: 'Attract & Capture', purpose: 'Plan, schedule, publish, and understand social content in the context of acquisition operations.', nextAction: 'Connect the social channels you want APEX to operate through.', related: [{ label: 'Creative Library', key: 'creative_library' }, { label: 'Growth Intelligence', key: 'growth_intelligence' }] },
  growth_intelligence: { title: 'Growth Intelligence', eyebrow: 'Attract & Capture', purpose: 'Understand acquisition performance, growth opportunities, attribution context, and leakage.', nextAction: 'Connect acquisition sources so APEX can build this operating context.', related: [{ label: 'Advertising', key: 'advertising' }, { label: 'Campaigns', key: 'campaigns' }] },
  settings: { title: 'Workspace Settings', eyebrow: 'Governance', purpose: 'Configure workspace-level business profile, verification, branding, localization, currency, timezone, and preferences.', nextAction: 'Review the workspace configuration available to this account.', related: [{ label: 'Team & Security', key: 'team' }, { label: 'Billing & Entitlements', key: 'billing' }] },
};

export const ModuleSurfaceView: React.FC<{ module: NavItemKey }> = ({ module }) => {
  const { setActiveNav, setConnectDrawerOpen } = useApp();
  const definition = definitions[module];
  if (!definition) return null;

  return <div className="space-y-6 pb-12">
    <header className="space-y-2">
      <p className="text-[10px] font-medium tracking-[0.16em] text-[var(--text-muted)]">{definition.eyebrow}</p>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{definition.title}</h1>
      <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{definition.purpose}</p>
    </header>

    <Card padding="lg" className="border-dashed">
      <div className="flex items-start gap-3">
        <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">This area is ready</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--text-secondary)]">This area is ready for your business data and actions.</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={() => setConnectDrawerOpen(true)} leftIcon={<ArrowRight className="h-3.5 w-3.5" />}>Connect a system</Button>
        {definition.related.map(item => <Button key={item.key} variant="secondary" size="sm" onClick={() => setActiveNav(item.key)}>{item.label}</Button>)}
      </div>
    </Card>

    <div className="grid gap-3 md:grid-cols-2">
      <Card padding="md"><div className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden="true" /><div><h2 className="text-xs font-semibold text-[var(--text-primary)]">Next action</h2><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{definition.nextAction}</p></div></div></Card>
      <Card padding="md"><div className="flex items-start gap-3"><LockKeyhole className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden="true" /><div><h2 className="text-xs font-semibold text-[var(--text-primary)]">Your business data</h2><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">Your workspace shows business information from connected services and actions you have confirmed.</p></div></div></Card>
    </div>
  </div>;
};
