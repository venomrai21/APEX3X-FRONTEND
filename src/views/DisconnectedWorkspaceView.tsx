import React from 'react';
import { ArrowRight, CircleCheck, Database, Plug, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, Button } from '../components/apex3x';

export const DisconnectedWorkspaceView: React.FC = () => {
  const { setActiveNav, setCommandPaletteOpen, setConnectDrawerOpen } = useApp();

  return (
    <div className="max-w-4xl space-y-8 py-8">
      <div className="space-y-3">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--text-muted)]">APEX3X frontend</p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-0.045em]">Business operating system</h1>
        <p className="max-w-2xl text-sm sm:text-base leading-7 text-[var(--text-secondary)]">
          The application shell is live. This frontend is currently disconnected from the existing SaaS backend, so live workspace data is intentionally not fabricated.
        </p>
      </div>

      <Card variant="elevated" padding="lg" className="border-[var(--border)]">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
            <Plug className="size-5 text-[var(--text-primary)]" />
          </div>
          <div className="min-w-0 space-y-2">
            <h2 className="text-base font-semibold">Connect the existing APEX3X SaaS</h2>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Configure <code className="font-mono-code text-[var(--text-primary)]">VITE_APEX3X_API_BASE_URL</code> when this frontend is ready to use authenticated workspace data. Until then, navigation and interaction surfaces are available as a UI preview only.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="primary" size="sm" onClick={() => setConnectDrawerOpen(true)} leftIcon={<Plug className="size-3.5" />}>Open connections</Button>
              <Button variant="secondary" size="sm" onClick={() => setCommandPaletteOpen(true)} leftIcon={<ArrowRight className="size-3.5" />}>Search the OS</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: CircleCheck, title: 'Shell ready', text: 'Global navigation, create, search and responsive behavior are available.' },
          { icon: ShieldCheck, title: 'Permission contract ready', text: 'Workspace roles and permission-aware UI are defined without replacing backend enforcement.' },
          { icon: Database, title: 'Live data pending', text: 'Workspace objects, telemetry and actions remain sourced from the existing SaaS.' },
        ].map(({ icon: Icon, title, text }) => (
          <Card key={title} padding="md">
            <Icon className="size-4 text-[var(--text-primary)]" />
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">{text}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-5">
        <Button variant="ghost" size="sm" onClick={() => setActiveNav('dashboard')}>Command Center</Button>
        <Button variant="ghost" size="sm" onClick={() => setActiveNav('leads')}>Leads</Button>
        <Button variant="ghost" size="sm" onClick={() => setActiveNav('integrations')}>Integrations Hub</Button>
        <Button variant="ghost" size="sm" onClick={() => setActiveNav('ai_hub')}>AI Provider Hub</Button>
      </div>
    </div>
  );
};
