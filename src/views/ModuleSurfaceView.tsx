import React from 'react';
import { ArrowRight, Plug } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavItemKey } from '../types';

type ModuleDefinition = {
  title: string;
  eyebrow: string;
  purpose: string;
};

const definitions: Partial<Record<NavItemKey, ModuleDefinition>> = {
  campaigns: { title: 'Campaigns', eyebrow: 'Attract & Capture', purpose: 'Plan, create, monitor, and understand acquisition campaigns across connected channels.' },
  advertising: { title: 'Advertising', eyebrow: 'Attract & Capture', purpose: 'Operate connected advertising channels and relate spend, outcomes, and acquisition leakage.' },
  creative_library: { title: 'Creative Library', eyebrow: 'Attract & Capture', purpose: 'Manage the creative assets used across acquisition and marketing operations.' },
  social_publishing: { title: 'Social Publishing', eyebrow: 'Attract & Capture', purpose: 'Plan, schedule, publish, and understand social content in the context of acquisition operations.' },
  growth_intelligence: { title: 'Growth Intelligence', eyebrow: 'Attract & Capture', purpose: 'Understand acquisition performance, growth opportunities, attribution context, and leakage.' },
  settings: { title: 'Workspace Settings', eyebrow: 'Governance', purpose: 'Configure workspace-level business profile, verification, branding, localization, currency, timezone, and preferences.' },
};

export const ModuleSurfaceView: React.FC<{ module: NavItemKey }> = ({ module }) => {
  const { setActiveNav } = useApp();
  const definition = definitions[module];
  if (!definition) return null;

  return <div className="space-y-6 pb-12">
    <header className="space-y-2">
      <p className="text-[10px] font-medium tracking-[0.16em] text-[var(--text-muted)]">{definition.eyebrow}</p>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{definition.title}</h1>
      <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{definition.purpose}</p>
    </header>

    {module === 'campaigns' && (
      <section className="max-w-3xl rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Plug className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Connect Ecosystem</h2>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">
              Connect the services you use for campaigns, such as Meta Ads and Google Ads. You can also connect other supported services from Integrations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveNav('integrations')}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--text-primary)] px-3.5 py-2 text-xs font-semibold text-[var(--background)] transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]"
          >
            Connect Ecosystem
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </section>
    )}

  </div>;
};
