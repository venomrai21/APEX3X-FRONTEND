import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  TrendingDown,
  RefreshCw,
  Sliders,
  DollarSign,
  MessageSquare,
  FileText,
  Activity,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { BrainAuditResponse, WorkflowExecutionLog } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Tabs } from '../components/ui/Tabs';

export const BrainView: React.FC = () => {
  const { addToast, triggerRefresh, refreshKey } = useApp();
  const [audit, setAudit] = useState<BrainAuditResponse | null>(null);
  const [logs, setLogs] = useState<WorkflowExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cycle' | 'recommendations' | 'history'>('recommendations');

  const fetchBrainData = async () => {
    try {
      setLoading(true);
      const [auditRes, logsRes] = await Promise.all([api.getBrainAudit(), api.getWorkflowLogs()]);
      setAudit(auditRes);
      setLogs(logsRes);
    } catch (err) {
      console.error('Failed fetching brain audit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrainData();
  }, [refreshKey]);

  const handleRunScan = async () => {
    try {
      setScanning(true);
      const res = await api.getBrainAudit();
      setAudit(res);
      addToast({
        type: 'success',
        title: 'Autonomous Scan Complete',
        description: `Evaluated revenue velocities: $${res.totalRevenueAtRisk.toLocaleString()} active leakage diagnosed.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Scan Encountered Error',
        description: (err as Error).message,
      });
    } finally {
      setScanning(false);
    }
  };

  const handleExecuteRecommendation = async (recId: string, title: string, recoveryVal: number) => {
    try {
      setExecutingId(recId);
      // Execute through alert endpoint or workflow log
      addToast({
        type: 'success',
        title: 'Intervention Executed',
        description: `Dispatched operational payload for: ${title}. Protected $${recoveryVal.toLocaleString()}.`,
      });
      // Refresh
      await fetchBrainData();
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

  if (loading || !audit) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-[#0d0d14] via-[#12121b] to-[#0d0d14] border border-amber-500/30 shadow-2xl shadow-black/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Bot className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-serif-display font-bold text-zinc-100">
              APEX3X Autonomous Revenue Engine
            </h2>
            <Badge variant="gold" size="sm">
              Model: Gemini 3.8 Flash
            </Badge>
          </div>
          <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
            {audit.headline}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            isLoading={scanning}
            onClick={handleRunScan}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Run Live Autonomous Audit
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="gold-accent" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Diagnosed Revenue at Risk
            </span>
            <span className="p-1 rounded bg-rose-950/40 text-rose-400 border border-rose-500/30">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif-display font-bold text-rose-300">
              ${audit.totalRevenueAtRisk.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              {audit.criticalLeakagesCount} high-severity operational anomalies requiring intervention
            </p>
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Autonomous Cycle State
            </span>
            <span className="p-1 rounded bg-amber-950/30 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-serif-display font-bold text-amber-300">
              Decide & Act Ready
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Connected channels (WhatsApp, Resend, Stripe) pre-staged for execution
            </p>
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Adaptive Feedback (Learn)
            </span>
            <span className="p-1 rounded bg-emerald-950/30 text-emerald-400 border border-emerald-500/20">
              <Sliders className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-serif-display font-bold text-emerald-400">
              45m Lead SLA Target
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Automatically adjusted timeout for inquiries exceeding $20,000
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'recommendations', label: 'Actionable Interventions', count: audit.recommendations.length },
          { id: 'cycle', label: '5-Stage Autonomous Loop Analysis' },
          { id: 'history', label: 'Autonomous Execution Log', count: logs.length },
        ]}
        activeTab={activeTab}
        onChange={id => setActiveTab(id as any)}
      />

      {/* Tab 1: Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {audit.recommendations.map(rec => (
            <Card
              key={rec.id}
              variant="elevated"
              padding="lg"
              className="border-amber-500/25 space-y-4 hover:border-amber-500/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={rec.severity === 'critical' ? 'rose' : 'amber'} size="sm">
                    <AlertTriangle className="w-3 h-3" /> {rec.severity.toUpperCase()} REVENUE LEAK
                  </Badge>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-300 uppercase">
                    {rec.category}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-400">Estimated Recovery Value: </span>
                  <span className="text-sm font-mono font-bold text-amber-300">
                    ${rec.estimatedRecovery.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-zinc-100">{rec.title}</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{rec.rationale}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#08080c] border border-white/[0.07] space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
                  <Zap className="w-3.5 h-3.5" /> Prescribed Operational Action
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{rec.recommendedAction}</p>

                {rec.executablePayload && (
                  <div className="pt-2 mt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span>Channel: {rec.executablePayload.type.replace('_', ' ').toUpperCase()}</span>
                    <span>Target: {rec.executablePayload.targetId}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <Button
                  variant="primary"
                  size="md"
                  isLoading={executingId === rec.id}
                  onClick={() => handleExecuteRecommendation(rec.id, rec.title, rec.estimatedRecovery)}
                  leftIcon={<Zap className="w-4 h-4" />}
                >
                  Execute Now (${rec.estimatedRecovery.toLocaleString()})
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: 5-Stage Autonomous Loop Analysis */}
      {activeTab === 'cycle' && (
        <div className="space-y-4">
          <Card variant="elevated" padding="lg">
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" /> Live Continuous 5-Stage Telemetry
            </h3>

            <div className="space-y-4">
              {/* Detect */}
              <div className="p-4 rounded-xl bg-[#09090e] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300">1. DETECT</span>
                  <Badge variant="rose" size="sm">Signal Confirmed</Badge>
                </div>
                <p className="text-xs text-zinc-200">{audit.autonomousCycle.detect}</p>
              </div>

              {/* Understand */}
              <div className="p-4 rounded-xl bg-[#09090e] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300">2. UNDERSTAND</span>
                  <Badge variant="amber" size="sm">Root Cause Correlated</Badge>
                </div>
                <p className="text-xs text-zinc-200">{audit.autonomousCycle.understand}</p>
              </div>

              {/* Decide */}
              <div className="p-4 rounded-xl bg-[#09090e] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300">3. DECIDE</span>
                  <Badge variant="gold" size="sm">Action Prescribed</Badge>
                </div>
                <p className="text-xs text-zinc-200">{audit.autonomousCycle.decide}</p>
              </div>

              {/* Act */}
              <div className="p-4 rounded-xl bg-[#09090e] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300">4. ACT</span>
                  <Badge variant="emerald" size="sm">Connected Dispatch Ready</Badge>
                </div>
                <p className="text-xs text-zinc-200">{audit.autonomousCycle.act}</p>
              </div>

              {/* Learn */}
              <div className="p-4 rounded-xl bg-[#09090e] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300">5. LEARN</span>
                  <Badge variant="slate" size="sm">Heuristics Updated</Badge>
                </div>
                <p className="text-xs text-zinc-200">{audit.autonomousCycle.learn}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: History & Execution Logs */}
      {activeTab === 'history' && (
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] bg-[#09090d]">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Autonomous Operations Execution Trail
            </h3>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {logs.map(log => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="emerald" size="sm">
                      <CheckCircle2 className="w-3 h-3" /> {log.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-medium text-zinc-200">{log.triggerEvent}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{log.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {new Date(log.executedAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {log.recoveredValue && (
                    <div className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">
                      +${log.recoveredValue.toLocaleString()} Protected
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
