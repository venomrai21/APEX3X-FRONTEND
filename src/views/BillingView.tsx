import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Zap, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { BillingEntitlement } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

export const BillingView: React.FC = () => {
  const { addToast, refreshKey } = useApp();
  const [billing, setBilling] = useState<BillingEntitlement | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBilling = async () => {
    try {
      setLoading(true);
      const res = await api.getBilling();
      setBilling(res);
    } catch (err) {
      console.error('Failed fetching billing info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, [refreshKey]);

  if (loading || !billing) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const { limits } = billing;

  const getMeterPercent = (used: number, total: number) => {
    if (!total) return 0;
    return Math.min(100, Math.round((used / total) * 100));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-serif-display font-bold text-zinc-100">
              Subscription & Entitlements Meter
            </h2>
            <Badge variant="gold" size="sm">
              {billing.planTier.toUpperCase()} TIER
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Usage allocations for autonomous inference, inbound lead triage, and ecosystem connections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              addToast({
                type: 'info',
                title: 'Stripe Customer Portal',
                description: 'Redirecting to dedicated billing management portal...',
              });
            }}
            rightIcon={<ArrowUpRight className="w-4 h-4" />}
          >
            Manage Payment Method
          </Button>
        </div>
      </div>

      {/* Plan Card */}
      <Card variant="gold-accent" padding="lg" className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-serif-display font-bold text-zinc-100">
              APEX3X Autonomous Enterprise Tier
            </h3>
            <Badge variant="emerald" size="sm">
              {billing.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
            Includes multi-channel revenue leak detection, real-time WhatsApp & Resend dispatch engines, continuous ad spend audits, and BYOK AI provider mesh.
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-2xl font-serif-display font-bold text-amber-300">
            ${billing.amount} <span className="text-xs font-sans text-zinc-400 font-normal">/ month</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
            Next renewal: {billing.renewalDate}
          </div>
          {billing.paymentMethod && (
            <div className="text-[11px] text-zinc-400 font-mono mt-1">
              Card ending in {billing.paymentMethod.last4} ({billing.paymentMethod.brand})
            </div>
          )}
        </div>
      </Card>

      {/* Usage Limit Meters */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Workspace Entitlement Consumption
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monthly Leads Meter */}
          <Card variant="default" padding="md" className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium">Monthly Inbound Leads</span>
              <span className="font-mono text-zinc-400">
                {limits.leadsMonthly.used.toLocaleString()} / {limits.leadsMonthly.total.toLocaleString()}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500/80"
                style={{ width: `${getMeterPercent(limits.leadsMonthly.used, limits.leadsMonthly.total)}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              {getMeterPercent(limits.leadsMonthly.used, limits.leadsMonthly.total)}% capacity utilized
            </span>
          </Card>

          {/* AI Autonomous Inferences */}
          <Card variant="default" padding="md" className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium">AI Autonomous Audits & Diagnostics</span>
              <span className="font-mono text-zinc-400">
                {limits.aiRuns.used.toLocaleString()} / {limits.aiRuns.total.toLocaleString()}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500/80"
                style={{ width: `${getMeterPercent(limits.aiRuns.used, limits.aiRuns.total)}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              {getMeterPercent(limits.aiRuns.used, limits.aiRuns.total)}% capacity utilized
            </span>
          </Card>

          {/* Active Workflows */}
          <Card variant="default" padding="md" className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium">Active Autonomous Workflow Rules</span>
              <span className="font-mono text-zinc-400">
                {limits.automations.used} / {limits.automations.total}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500/80"
                style={{ width: `${getMeterPercent(limits.automations.used, limits.automations.total)}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              {getMeterPercent(limits.automations.used, limits.automations.total)}% capacity utilized
            </span>
          </Card>

          {/* Connected Integrations */}
          <Card variant="default" padding="md" className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium">Connected Capability Integrations</span>
              <span className="font-mono text-zinc-400">
                {limits.connectedIntegrations.used} / {limits.connectedIntegrations.total}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500/80"
                style={{ width: `${getMeterPercent(limits.connectedIntegrations.used, limits.connectedIntegrations.total)}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              {getMeterPercent(limits.connectedIntegrations.used, limits.connectedIntegrations.total)}% capacity utilized
            </span>
          </Card>
        </div>
      </div>
    </div>
  );
};
