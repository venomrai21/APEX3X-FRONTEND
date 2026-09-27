import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { BillingEntitlement } from '../types';
import { formatMoney } from '../currency';
import { Card, Badge, Skeleton, AnimatedNumber, AnimatedProgress, AnimatedGrid, APEXReveal } from '../components/apex3x';

export const BillingView: React.FC = () => {
  const { refreshKey, currentWorkspace } = useApp();
  const [billing, setBilling] = useState<BillingEntitlement | null>(null);
  const [eligibility, setEligibility] = useState<{ workspace: { subscriptionStatus: string | null; trialStartsAt: string | null; trialEndsAt: string | null } } | null>(null);
  const [usage, setUsage] = useState({ leads: 0, aiRuns: 0, automations: 0, integrations: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    try {
      setLoading(true);
      const [billingResult, eligibilityResult, leads, alerts, workflows, integrations] = await Promise.all([
        api.getBilling().catch(() => null),
        api.getEligibility().catch(() => null),
        api.getLeads().catch(() => []),
        api.getBrainAlerts().catch(() => []),
        api.getWorkflows().catch(() => []),
        api.getIntegrations().catch(() => []),
      ]);
      setBilling(billingResult);
      setEligibility(eligibilityResult);
      setUsage({
        leads: leads.length,
        aiRuns: alerts.length,
        automations: workflows.filter(item => item.isActive).length,
        integrations: integrations.filter(item => item.status === 'connected').length,
      });
    } catch (err) { console.error('Failed fetching billing info:', err); }
    finally { setLoading(false); }
  })(); }, [refreshKey]);
  if (loading) return <div className="space-y-6"><Skeleton className="h-44" /><Skeleton className="h-64" /></div>;
  const workspace = currentWorkspace;
  const plan = billing?.planTier || workspace?.plan || 'Not available';
  const status = billing?.status || eligibility?.workspace.subscriptionStatus || workspace?.subscriptionStatus || 'Not available';
  const renewalDate = billing?.renewalDate || eligibility?.workspace.trialEndsAt || workspace?.trialEndsAt || '';
  const billingCurrency = billing?.currency || workspace?.currency;
  const billingAmount = billing?.amount;
  const meters = billing ? [['Monthly Inbound Leads', billing.limits.leadsMonthly], ['AI Audits', billing.limits.aiRuns], ['Active Workflow Rules', billing.limits.automations], ['Connected Integrations', billing.limits.connectedIntegrations]] as const : [
    ['Leads', { used: usage.leads, total: 0 }],
    ['APEX Activity', { used: usage.aiRuns, total: 0 }],
    ['Active Workflow Rules', { used: usage.automations, total: 0 }],
    ['Connected Integrations', { used: usage.integrations, total: 0 }]
  ] as const;
  const meter = (used: number, total: number) => total ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return <div className="space-y-6 pb-12"><APEXReveal>
    <div><div className="flex items-center gap-2"><h2 className="text-lg font-bold text-zinc-100">Plan & Usage</h2><Badge variant="neutral" size="sm">{String(plan).toUpperCase()} PLAN</Badge></div><p className="text-xs text-zinc-400 mt-1">Your current plan, billing status and live usage.</p></div>
    <Card padding="lg" className="flex flex-col md:flex-row md:items-center justify-between gap-6"><div className="space-y-2"><div className="flex items-center gap-2.5"><h3 className="text-xl font-bold text-zinc-100">Current Subscription</h3><Badge variant="neutral" size="sm">{String(status).toUpperCase()}</Badge></div><p className="text-xs text-zinc-300 max-w-xl leading-relaxed">Your subscription and usage details.</p></div><div className="text-right shrink-0"><div className="text-2xl font-bold text-zinc-100">{billingAmount == null ? 'Not available' : formatMoney(billingAmount, billingCurrency)} <span className="text-xs font-sans text-zinc-400 font-normal">/ month</span></div><div className="text-[11px] text-zinc-500 font-mono mt-0.5">Next renewal: {renewalDate || 'Not set'}</div>{billing?.paymentMethod && <div className="text-[11px] text-zinc-400 font-mono mt-1">Card ending in {billing.paymentMethod.last4} ({billing.paymentMethod.brand})</div>}</div></Card>
    <div className="space-y-4"><h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Plan Usage</h3><AnimatedGrid className="grid-cols-1 md:grid-cols-2" itemClassName="w-full">{meters.map(([label, v]) => { const percent = meter(v.used, v.total); return <Card key={label} padding="md" className="space-y-2"><div className="flex items-center justify-between text-xs"><span className="text-zinc-300 font-medium">{label}</span><span className="font-mono text-zinc-400">{v.used.toLocaleString()} / {v.total.toLocaleString()}</span></div><AnimatedProgress value={percent} label="Usage" showValue={false} /><div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono"><span>{percent}% used</span><AnimatedNumber value={v.used} className="text-zinc-400" /></div></Card>; })}</AnimatedGrid></div>
  </APEXReveal></div>;
};
