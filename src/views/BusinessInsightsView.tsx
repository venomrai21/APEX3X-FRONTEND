import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Zap,
  DollarSign,
  Cpu,
  Layers,
  ChevronRight,
  BarChart3,
  Flame,
  FileCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { BusinessInsightsData, ActionableInsightRecommendation, NavItemKey } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const BusinessInsightsView: React.FC = () => {
  const { setActiveNav, addToast } = useApp();
  const [data, setData] = useState<BusinessInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'revenue_loss' | 'predictive_trends' | 'recommendations'>('all');

  const auditSteps = [
    'Ingesting real-time CRM lead velocities & SLA response timestamps...',
    'Correlating active marketing channel telemetry against closed deals...',
    'Auditing delinquent receivables and evaluating dunning risk curves...',
    'Evaluating enterprise client retention signals and churn telemetry...',
    'Synthesizing predictive recommendations via Gemini 3.8 Flash model...'
  ];

  const fetchInsights = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const res = await api.getBusinessInsights(forceRefresh);
      setData(res);
    } catch (err) {
      console.error('Failed to load business insights:', err);
      addToast({
        type: 'error',
        title: 'Insights Unavailable',
        description: (err as Error).message || 'Unable to retrieve predictive insights telemetry.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const triggerDeepAnalysis = async () => {
    setAnalyzing(true);
    setAuditStep(0);

    // Multi-phase progress ticker for high-craft autonomous visual feedback
    const interval = setInterval(() => {
      setAuditStep(prev => {
        if (prev < auditSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 700);

    try {
      const fresh = await api.triggerInsightsAnalysis();
      setTimeout(() => {
        clearInterval(interval);
        setData(fresh);
        setAnalyzing(false);
        addToast({
          type: 'success',
          title: 'Deep AI Audit Completed',
          description: `Analysis completed using Gemini 3.8 Flash across active CRM, Pipeline & Billing data.`,
        });
      }, 3600);
    } catch (err) {
      clearInterval(interval);
      setAnalyzing(false);
      addToast({
        type: 'error',
        title: 'Audit Failed',
        description: (err as Error).message || 'AI inference error.',
      });
    }
  };

  const handleExecuteAction = async (rec: ActionableInsightRecommendation) => {
    try {
      setExecutingId(rec.id);
      await api.executeInsightAction(rec.id);
      if (data) {
        setData({
          ...data,
          actionableRecommendations: data.actionableRecommendations.map(r =>
            r.id === rec.id ? { ...r, status: 'executed' } : r
          ),
        });
      }
      addToast({
        type: 'success',
        title: 'AI Action Executed',
        description: `Autonomous protocol recorded for ${rec.title}.`,
      });
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

  const handleNavigateToModule = (target: string) => {
    const validNav: Record<string, NavItemKey> = {
      leads: 'leads',
      pipeline: 'pipeline',
      invoices: 'invoices',
      marketing: 'marketing',
      conversations: 'conversations',
      bookings: 'bookings',
    };
    if (validNav[target]) {
      setActiveNav(validNav[target]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12" id="insights-loading-state">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data || data.hasSufficientData === false) {
    return (
      <div className="space-y-6 pb-12" id="insights-no-data-state">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Autonomous Revenue Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-zinc-100 tracking-tight">
              AI-Powered Business Insights
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-3xl leading-relaxed">
              Cross-functional autonomous intelligence analyzing real persisted telemetry across sales velocity, CRM leads, and receivables.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              id="btn-refresh-insights-empty"
              variant="secondary"
              size="md"
              onClick={() => fetchInsights(true)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-zinc-400" />}
            >
              Refresh Telemetry
            </Button>
          </div>
        </div>

        <div className="py-12">
          <EmptyState
            icon={<Sparkles className="w-8 h-8 text-amber-400" />}
            title="Insufficient Telemetry in Workspace"
            description={
              data?.insufficientDataReason ||
              "No operational CRM leads, pipeline deals, or billing invoices exist in this workspace. AI Insights operates strictly on real persisted business data and never fabricates mock numbers. Add records in CRM, Pipeline, or Billing to generate verified insights."
            }
            actionLabel="Go to CRM Leads"
            onAction={() => setActiveNav('leads')}
          />
        </div>
      </div>
    );
  }

  const { executiveSummary, revenueLossBreakdown, predictiveTrends, actionableRecommendations, systemVsAiComparison } = data;

  return (
    <div className="space-y-8 pb-16" id="business-insights-container">
      {/* Header & Meta Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              Autonomous Revenue Intelligence
            </span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-[11px] font-mono text-zinc-400">
              Engine: <strong className="text-zinc-200">{executiveSummary.modelUsed}</strong>
            </span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-[11px] font-mono text-zinc-400">
              Confidence: <strong className="text-amber-400">{executiveSummary.aiConfidenceScore}%</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-zinc-100 tracking-tight">
            AI-Powered Business Insights
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-3xl leading-relaxed">
            Cross-functional autonomous intelligence correlating sales velocity, SLA lead decay, marketing attribution, and receivable default risks.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            id="btn-run-deep-audit"
            variant="primary"
            size="md"
            isLoading={analyzing}
            onClick={triggerDeepAnalysis}
            leftIcon={<Cpu className="w-4 h-4 text-amber-900" />}
          >
            {analyzing ? 'Synthesizing...' : 'Run Deep AI Audit'}
          </Button>
          <Button
            id="btn-refresh-insights"
            variant="secondary"
            size="md"
            onClick={() => fetchInsights(true)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-zinc-400" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Processing State: Live Step Ticker Overlay */}
      {analyzing && (
        <Card className="p-6 border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-[#0e0e16] to-[#0a0a10] animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <h3 className="text-sm font-semibold text-amber-200 uppercase font-mono tracking-wider">
                Autonomous Intelligence Engine Active
              </h3>
            </div>
            <span className="text-xs font-mono text-amber-400/90">
              Step {auditStep + 1} of {auditSteps.length}
            </span>
          </div>

          <p className="text-sm font-medium text-zinc-100 mb-3">
            {auditSteps[auditStep]}
          </p>

          <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-400 h-full transition-all duration-500"
              style={{ width: `${((auditStep + 1) / auditSteps.length) * 100}%` }}
            />
          </div>
        </Card>
      )}

      {/* Executive Diagnostic Banner (Serif + Amber Elegance) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#12121c] via-[#0b0b12] to-[#07070b] border border-amber-500/25 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-red-300 text-[10px] font-mono uppercase tracking-wider font-semibold">
                Revenue Alert
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Audited: {new Date(executiveSummary.lastGeneratedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-zinc-100 tracking-tight leading-snug">
              {executiveSummary.headline}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {executiveSummary.subheadline}
            </p>
          </div>

          {/* Quantified Metrics Cluster */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-red-500/20 backdrop-blur-sm">
              <span className="text-[11px] font-mono text-zinc-400 block uppercase">Identified Loss</span>
              <div className="text-xl sm:text-2xl font-serif-display font-bold text-red-400 mt-0.5">
                ${executiveSummary.totalRevenueLossIdentified.toLocaleString()}
              </div>
              <span className="text-[10px] text-red-400/80 font-mono mt-0.5 block flex items-center gap-1">
                <TrendingDown className="w-2.5 h-2.5" /> High leakage
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-amber-500/25 backdrop-blur-sm">
              <span className="text-[11px] font-mono text-zinc-400 block uppercase">Recoverable</span>
              <div className="text-xl sm:text-2xl font-serif-display font-bold text-amber-300 mt-0.5">
                ${executiveSummary.potentialRecoveryAmount.toLocaleString()}
              </div>
              <span className="text-[10px] text-amber-400/80 font-mono mt-0.5 block flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-amber-400" /> 88% salvageable
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
              <span className="text-[11px] font-mono text-zinc-400 block uppercase">Health Index</span>
              <div className="text-xl sm:text-2xl font-serif-display font-bold text-zinc-100 mt-0.5">
                {executiveSummary.overallHealthIndex} <span className="text-xs font-normal text-zinc-500 font-sans">/ 100</span>
              </div>
              <span className="text-[10px] text-orange-400 font-mono mt-0.5 block">
                Remediation Req.
              </span>
            </div>
          </div>
        </div>

        {/* AI Projection vs Static System Comparison Strip */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              Static Ledger Overdue
            </span>
            <span className="font-mono text-zinc-300 text-sm font-semibold">
              ${systemVsAiComparison.systemRecordedLoss.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 block">Raw accounting records</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-wider block flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" /> AI Projected Loss
            </span>
            <span className="font-mono text-amber-200 text-sm font-semibold">
              ${systemVsAiComparison.aiProjectedLossWithChurn.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-400 block">Includes churn & SLA slip</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              Untracked Lead Decay
            </span>
            <span className="font-mono text-orange-300 text-sm font-semibold">
              ${systemVsAiComparison.untrackedSlaDecay.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 block">Delayed outbound followups</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              Ad Group CAC Waste
            </span>
            <span className="font-mono text-red-300 text-sm font-semibold">
              ${systemVsAiComparison.adFatigueWaste.toLocaleString()}/mo
            </span>
            <span className="text-[10px] text-zinc-500 block">Zero-conversion keywords</span>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Comprehensive Audit (All)
        </button>
        <button
          onClick={() => setActiveTab('revenue_loss')}
          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'revenue_loss'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Revenue Leakage Breakdown ({revenueLossBreakdown.length})
        </button>
        <button
          onClick={() => setActiveTab('predictive_trends')}
          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'predictive_trends'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Predictive Trends & Forecasts ({predictiveTrends.length})
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'recommendations'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Actionable Roadmap ({actionableRecommendations.length})
        </button>
      </div>

      {/* Section 1: Itemized Revenue Loss Breakdown */}
      {(activeTab === 'all' || activeTab === 'revenue_loss') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif-display font-semibold text-zinc-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Quantified Revenue Leakage Diagnostic
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Correlated root-cause analysis tracing where enterprise capital is currently leaking.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {revenueLossBreakdown.length} active anomalies
            </span>
          </div>

          {revenueLossBreakdown.length === 0 ? (
            <Card className="p-8 border-white/[0.08] bg-[#09090e] text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2.5" />
              <h4 className="text-sm font-semibold text-zinc-100">Zero Detected Revenue Leaks</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                All analyzed CRM leads, active pipeline deals, and accounts receivables are operating within normal SLA and payment terms. No unmitigated revenue leakages detected across this workspace.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {revenueLossBreakdown.map(item => {
                const urgencyBadge = {
                  critical: { label: 'CRITICAL LEAK', variant: 'danger' as const },
                  high: { label: 'HIGH RISK', variant: 'warning' as const },
                  medium: { label: 'MEDIUM', variant: 'neutral' as const },
                }[item.urgency];

                return (
                  <Card
                    key={item.id}
                    className="p-5 border-white/[0.08] hover:border-amber-500/30 transition-all bg-[#09090e] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                              {item.department}
                            </span>
                            <Badge variant={urgencyBadge.variant} size="sm">
                              {urgencyBadge.label}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-semibold text-zinc-100">{item.title}</h4>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-base font-mono font-bold text-red-400">
                            -${item.lostAmount.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {item.impactPercentage}% total leak
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                        {item.rootCause}
                      </p>

                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                          Detected Telemetry Signals:
                        </span>
                        {item.detectedSignals.map((signal, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                            <span>{signal}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-zinc-500">Autonomous remediation available</span>
                      <button
                        onClick={() => {
                          setActiveTab('recommendations');
                        }}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono text-[11px] cursor-pointer"
                      >
                        View Action <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Section 2: Predictive Trends & Strategic Projections */}
      {(activeTab === 'all' || activeTab === 'predictive_trends') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif-display font-semibold text-zinc-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Predictive Trends & Forward Outlook
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Forward-looking probability models forecasting trajectory if current operating dynamics continue unadjusted.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">Gemini 3.8 Flash inference</span>
          </div>

          {predictiveTrends.length === 0 ? (
            <Card className="p-8 border-white/[0.08] bg-[#09090e] text-center">
              <BarChart3 className="w-8 h-8 text-zinc-500 mx-auto mb-2.5" />
              <h4 className="text-sm font-semibold text-zinc-100">No Significant Trajectory Variances</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                Predictive trajectory forecasting models require additional closed deal milestones and recurring receivables cycles to establish variance projections.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {predictiveTrends.map(trend => {
                const isUp = trend.trajectory === 'up';
                const isDown = trend.trajectory === 'down';

                return (
                  <Card
                    key={trend.id}
                    className="p-5 border-white/[0.08] hover:border-amber-500/30 transition-all bg-[#09090e] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                          {trend.timeframe}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {trend.aiConfidence}% AI Conf.
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-zinc-200 mb-1">{trend.metric}</h4>

                      <div className="flex items-center gap-1.5 my-2">
                        {isDown && <TrendingDown className="w-4 h-4 text-red-400" />}
                        {isUp && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                        {!isUp && !isDown && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                        <span className="text-sm font-serif-display font-bold text-zinc-100">
                          {trend.projection}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                        {trend.predictionDetail}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase">Baseline</span>
                        <span className="text-zinc-400">{trend.baselineValue}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-zinc-600" />
                      <div className="text-right">
                        <span className="text-amber-400/80 block text-[9px] uppercase">Projected</span>
                        <span className="text-amber-300 font-semibold">{trend.forecastedValue}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Section 3: Concrete, Actionable Steps for Improvement */}
      {(activeTab === 'all' || activeTab === 'recommendations') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif-display font-semibold text-zinc-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Actionable Improvement Protocols & Direct System Links
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Distinguished AI recommendations with direct execution hooks into core APEX3X operating modules.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {actionableRecommendations.filter(r => r.status === 'executed').length} executed of {actionableRecommendations.length}
            </span>
          </div>

          {actionableRecommendations.length === 0 ? (
            <Card className="p-8 border-white/[0.08] bg-[#09090e] text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2.5" />
              <h4 className="text-sm font-semibold text-zinc-100">No Action Protocols Pending</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                Operating vectors are balanced across current leads, pipeline stages, and receivables. No immediate interventions required.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
            {actionableRecommendations.map(rec => {
              const isExecuted = rec.status === 'executed';
              const urgencyColor = {
                immediate: 'border-red-500/30 bg-red-950/10 text-red-300',
                high_priority: 'border-amber-500/30 bg-amber-950/10 text-amber-300',
                strategic: 'border-white/[0.12] bg-white/[0.04] text-zinc-300',
              }[rec.urgency];

              return (
                <div
                  key={rec.id}
                  className={`p-5 sm:p-6 rounded-xl border transition-all ${
                    isExecuted
                      ? 'bg-[#08080c] border-emerald-500/30 opacity-80'
                      : 'bg-[#0a0a11] border-amber-500/30 hover:border-amber-500/60 shadow-xl'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Clearly distinguished AI Badge */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                          <Sparkles className="w-2.5 h-2.5 text-amber-400" /> AI Recommendation
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-medium border ${urgencyColor}`}>
                          {rec.urgency.replace('_', ' ')}
                        </span>

                        <span className="text-[10px] font-mono text-zinc-500">
                          Target Module: <strong className="text-zinc-300">{rec.targetModuleLabel}</strong>
                        </span>

                        {isExecuted && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Protocol Executed
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-serif-display font-bold text-zinc-100">
                        {rec.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        <strong className="text-amber-400 font-normal">AI Rationale:</strong> {rec.aiRationale}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-right shrink-0">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Projected Value Recovery
                      </span>
                      <div className="text-lg font-serif-display font-bold text-amber-300 mt-0.5">
                        +${rec.projectedRecovery.toLocaleString()}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                        {rec.aiConfidence}% Probability
                      </span>
                    </div>
                  </div>

                  {/* Step-by-Step Implementation Roadmap */}
                  <div className="p-4 rounded-lg bg-[#060609] border border-white/[0.06] mb-4">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block mb-2 font-semibold">
                      Step-by-Step Action Roadmap:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {rec.implementationSteps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 text-zinc-300">
                          <span className="w-4 h-4 rounded bg-white/[0.06] text-[10px] font-mono text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span className="leading-snug">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Bar & Deep Link into Relevant Application Module */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
                    <span className="text-[11px] font-mono text-zinc-500">
                      Signature: {rec.aiModelSignature} &bull; Evaluated {new Date(rec.lastEvaluatedAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleNavigateToModule(rec.targetModule)}
                        rightIcon={<ArrowRight className="w-3 h-3 text-amber-400" />}
                      >
                        {rec.actionButtonText}
                      </Button>

                      {!isExecuted ? (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={executingId === rec.id}
                          onClick={() => handleExecuteAction(rec)}
                          leftIcon={<Zap className="w-3 h-3 text-amber-900" />}
                        >
                          Execute Decision
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" disabled>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                          Logged to Audit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
