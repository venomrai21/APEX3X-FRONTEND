import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { BillingEntitlement } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

export const BillingView: React.FC = () => {
  const { refreshKey } = useApp();
  const [billing, setBilling] = useState<BillingEntitlement | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { setLoading(true); setBilling(await api.getBilling()); } catch (err) { console.error('Failed fetching billing info:', err); } finally { setLoading(false); } })(); }, [refreshKey]);
  if (loading || !billing) return <div className="space-y-6"><Skeleton className="h-44" /><Skeleton className="h-64" /></div>;
  const { limits } = billing;
  const meter = (used: number, total: number) => total ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const meters = [
    ['Monthly Inbound Leads', limits.leadsMonthly],
    ['AI Autonomous Audits & Diagnostics', limits.aiRuns],
    ['Active Autonomous Workflow Rules', limits.automations],
    ['Connected Capability Integrations', limits.connectedIntegrations],
  ];
  return <div className="space-y-6 pb-12">
    <div><div className="flex items-center gap-2"><h2 className="text-lg font-serif-display font-bold text-zinc-100">Subscription & Entitlements</h2><Badge variant="gold" size="sm">{billing.planTier.toUpperCase()} TIER</Badge></div><p className="text-xs text-zinc-400 mt-1">Usage allocations and entitlement state supplied by the connected SaaS platform.</p></div>
    <Card variant="gold-accent" padding="lg" className="flex flex-col md:flex-row md:items-center justify-between gap-6"><div className="space-y-2"><div className="flex items-center gap-2.5"><h3 className="text-xl font-serif-display font-bold text-zinc-100">Current Subscription</h3><Badge variant="emerald" size="sm">{billing.status.toUpperCase()}</Badge></div><p className="text-xs text-zinc-300 max-w-xl leading-relaxed">Subscription and entitlement details are returned by the billing service.</p></div><div className="text-right shrink-0"><div className="text-2xl font-serif-display font-bold text-amber-300">${billing.amount} <span className="text-xs font-sans text-zinc-400 font-normal">/ month</span></div><div className="text-[11px] text-zinc-500 font-mono mt-0.5">Next renewal: {billing.renewalDate || '—'}</div>{billing.paymentMethod && <div className="text-[11px] text-zinc-400 font-mono mt-1">Card ending in {billing.paymentMethod.last4} ({billing.paymentMethod.brand})</div>}</div></Card>
    <div className="space-y-4"><h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Workspace Entitlement Consumption</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{meters.map(([label, value]) => { const v = value as { used: number; total: number }; const percent = meter(v.used, v.total); return <Card key={label as string} variant="default" padding="md" className="space-y-2"><div className="flex items-center justify-between text-xs"><span className="text-zinc-300 font-medium">{label as string}</span><span className="font-mono text-zinc-400">{v.used.toLocaleString()} / {v.total.toLocaleString()}</span></div><div className="h-2 rounded-full bg-white/[0.06] overflow-hidden"><div className="h-full rounded-full bg-amber-500/80" style={{ width: `${percent}%` }} /></div><span className="text-[10px] text-zinc-500 font-mono">{percent}% capacity utilized</span></Card>; })}</div></div>
  </div>;
};
