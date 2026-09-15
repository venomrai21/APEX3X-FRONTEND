import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Plug,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { DashboardSummary } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

export const DashboardView: React.FC = () => {
  const { setActiveNav, setConnectDrawerOpen, addToast, triggerRefresh, refreshKey } = useApp();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err) {
      console.error('Failed fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [refreshKey]);

  const handleExecuteAction = async (alertId: string) => {
    try {
      setExecutingId(alertId);
      const res = await api.executeBrainAction(alertId);
      addToast({
        type: 'success',
        title: 'Autonomous Action Executed',
        description: res.message,
      });
      await fetchDashboard();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Execution Failed',
        description: (err as Error).message,
      });
    } finally {
      setExecutingId(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const { metrics, autonomousCycleStatus, pendingAlerts, recentDeals } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Autonomous Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-[#0d0d14] via-[#101018] to-[#0d0d14] border border-amber-500/20 shadow-xl shadow-black/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Bot className="w-4 h-4" />
            </span>
            <h2 className="text-base font-serif-display font-semibold text-zinc-100">
              Operational Command Center
            </h2>
            <Badge variant="gold" size="sm">
              Autonomous Loop Active
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Monitoring active lead decay, receivables aging, channel ROAS, and conversion friction in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setConnectDrawerOpen(true)}
            leftIcon={<Plug className="w-3.5 h-3.5 text-amber-400" />}
          >
            + Connect Ecosystem
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveNav('brain')}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            View Brain Diagnostics
          </Button>
        </div>
      </div>

      {/* Primary Operational Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Revenue at Risk */}
        <Card variant="gold-accent" padding="md" className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Revenue at Risk
            </span>
            <span className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif-display font-bold text-rose-300">
              ${metrics.totalRevenueAtRisk.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400">
              <span className="text-rose-400 font-medium">3 Critical Leaks</span>
              <span>detected across leads & receivables</span>
            </div>
          </div>
        </Card>

        {/* Metric 2: Active Pipeline Value */}
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Active Pipeline
            </span>
            <span className="p-1.5 rounded-lg bg-amber-950/30 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif-display font-bold text-zinc-100">
              ${metrics.activePipelineValue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400">
              <span className="text-emerald-400 font-medium">${metrics.wonValueThisMonth.toLocaleString()}</span>
              <span>won this billing cycle</span>
            </div>
          </div>
        </Card>

        {/* Metric 3: Overdue Receivables */}
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Overdue Receivables
            </span>
            <span className="p-1.5 rounded-lg bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif-display font-bold text-amber-300">
              ${metrics.overdueReceivables.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400">
              <span>Collection sequence:</span>
              <span className="text-amber-400 font-medium">Active (Stage 2)</span>
            </div>
          </div>
        </Card>

        {/* Metric 4: System Health & Integrations */}
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Autonomous Health
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-950/30 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif-display font-bold text-emerald-400">
              {metrics.systemHealth}%
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400">
              <span className="text-zinc-200 font-medium">{metrics.connectedIntegrationsCount} platforms</span>
              <span>actively synchronized</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Autonomous 5-Step Operational Engine Banner */}
      <Card variant="elevated" padding="lg" className="border-amber-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> APEX3X Autonomous Operating Cycle
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Continuous 5-stage loop executing deterministic business interventions across connected channels.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="emerald" size="sm">
              <CheckCircle2 className="w-3 h-3" /> Recovered ${autonomousCycleStatus.recoveredRevenueMonth.toLocaleString()} this month
            </Badge>
          </div>
        </div>

        {/* 5 Steps Interactive Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-4">
          {[
            { step: '1. DETECT', desc: 'Identify revenue hemorrhage & latency', active: true, label: '3 Anomaly Signals' },
            { step: '2. UNDERSTAND', desc: 'Diagnose operational root cause', active: true, label: 'SLA Breach Analysis' },
            { step: '3. DECIDE', desc: 'Prescribe highest-leverage actions', active: true, label: 'Deterministic Engine' },
            { step: '4. ACT', desc: 'Dispatch through connected channels', active: true, label: 'Staged for 1-Click' },
            { step: '5. LEARN', desc: 'Tune operational parameters & timeouts', active: false, label: 'Continuous Feedback' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                item.active ? 'bg-[#12121c] border-amber-500/30' : 'bg-[#08080d] border-white/[0.05]'
              } space-y-1.5`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-amber-300">{item.step}</span>
                {item.active && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">{item.desc}</p>
              <p className="text-[10px] font-mono text-zinc-500 pt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Operational Split: Pending Actions vs Pipeline Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Immediate Action Prescriptions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <span>Immediate Revenue Interventions</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                  {pendingAlerts.length}
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pre-compiled operational decisions awaiting execution.
              </p>
            </div>
            <button
              onClick={() => setActiveNav('brain')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              View Full Diagnostics <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingAlerts.map(alert => (
              <Card
                key={alert.id}
                variant="elevated"
                padding="md"
                className="border-amber-500/25 space-y-3 hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="rose" size="sm">
                      <AlertTriangle className="w-3 h-3" /> Critical Loss Risk
                    </Badge>
                    <span className="text-xs font-mono font-semibold text-amber-300">
                      ${alert.revenueAtRisk.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {new Date(alert.suggestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-zinc-100">{alert.headline}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{alert.detectedIssue}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#07070b] border border-white/[0.06] text-xs text-zinc-300">
                  <span className="text-amber-400 font-medium">Prescribed Action: </span>
                  {alert.recommendedAction}
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={executingId === alert.id}
                    onClick={() => handleExecuteAction(alert.id)}
                    leftIcon={<Zap className="w-3.5 h-3.5" />}
                  >
                    Execute Autonomous Decision
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Active Commercial Pipeline (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Commercial Pipeline</h3>
              <p className="text-xs text-zinc-400 mt-0.5">High-velocity deals under active negotiation</p>
            </div>
            <button
              onClick={() => setActiveNav('pipeline')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              Pipeline Board <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="divide-y divide-white/[0.06]">
              {recentDeals.map(deal => (
                <div
                  key={deal.id}
                  className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{deal.title}</p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">{deal.company}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] text-zinc-300 font-mono capitalize">
                        {deal.stage.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-zinc-500">{deal.probability}% win probability</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono font-bold text-amber-300">
                      ${deal.value.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Close: {deal.expectedCloseDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#08080c] border-t border-white/[0.06] text-center">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-zinc-400"
                onClick={() => setActiveNav('pipeline')}
              >
                View all pipeline stages &rarr;
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
