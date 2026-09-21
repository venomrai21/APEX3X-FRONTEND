import React from 'react';
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
  const definition = definitions[module];
  if (!definition) return null;

  return <div className="space-y-6 pb-12">
    <header className="space-y-2">
      <p className="text-[10px] font-medium tracking-[0.16em] text-[var(--text-muted)]">{definition.eyebrow}</p>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{definition.title}</h1>
      <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{definition.purpose}</p>
    </header>

  </div>;
};
