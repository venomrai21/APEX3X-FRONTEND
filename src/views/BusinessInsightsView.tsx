import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, ArrowRight, CheckCircle2, Zap, TrendingDown, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { BusinessInsightsData, ActionableInsightRecommendation, NavItemKey } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const BusinessInsightsView: React.FC = () => {
  const { setActiveNav, addToast } = useApp();
  const [data, setData] = useState<BusinessInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'revenue_loss' | 'predictive_trends' | 'recommendations'>('all');

  const fetchInsights = async (refresh = false) => {
    try { setLoading(true); setData(await api.getBusinessInsights(refresh)); }
    catch (err) { addToast({ type: 'error', title: 'Insights Unavailable', description: (err as Error).message }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInsights(); }, []);

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      const fresh = await api.triggerInsightsAnalysis();
      setData(fresh);
      addToast({ type: 'success', title: 'AI Audit Complete', description: 'Fresh insight telemetry returned by the connected platform.' });
    } catch (err) { addToast({ type: 'error', title: 'Audit Failed', description: (err as Error).message }); }
    finally { setAnalyzing(false); }
  };

  const execute = async (rec: ActionableInsightRecommendation) => {
    try {
      setExecutingId(rec.id);
      await api.executeInsightAction(rec.id);
      await fetchInsights(true);
      addToast({ type: 'success', title: 'Action Executed', description: `Execution recorded for ${rec.title}.` });
    } catch (err) { addToast({ type: 'error', title: 'Execution Failed', description: (err as Error).message }); }
    finally { setExecutingId(null); }
  };

  const navigate = (target: string) => {
    const nav: Record<string, NavItemKey> = { leads: 'leads', pipeline: 'pipeline', invoices: 'invoices', marketing: 'marketing', conversations: 'conversations', bookings: 'bookings' };
    if (nav[target]) setActiveNav(nav[target]);
  };

  if (loading) return <div className="space-y-6"><Skeleton className="h-32" /><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div><Skeleton className="h-80" /></div>;

  if (!data || data.hasSufficientData === false) {
    return <div className="space-y-6 pb-12"><div className="border-b border-white/[0.08] pb-6"><span className="text-[10px] font-mono uppercase tracking-wide text-amber-300">Autonomous Revenue Intelligence</span><h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-zinc-100 mt-2">AI-Powered Business Insights</h1><p className="text-sm text-zinc-400 mt-1">Insights are generated only from persisted workspace business data.</p></div><EmptyState icon={<Sparkles className="w-8 h-8 text-amber-400" />} title="Insufficient Workspace Telemetry" description={data?.insufficientDataReason || 'No sufficient persisted business data is currently available for verified insights.'} actionLabel="Go to CRM Leads" onAction={() => setActiveNav('leads')} /></div>;
  }

  const { executiveSummary, revenueLossBreakdown, predictiveTrends, actionableRecommendations, systemVsAiComparison } = data;
  const recoveryRate = executiveSummary.totalRevenueLossIdentified > 0 ? Math.round((executiveSummary.potentialRecoveryAmount / executiveSummary.totalRevenueLossIdentified) * 100) : null;

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-mono uppercase tracking-wide text-amber-300">Autonomous Revenue Intelligence</span><span className="text-zinc-600">•</span><span className="text-[11px] font-mono text-zinc-400">Engine: <strong className="text-zinc-200">{executiveSummary.modelUsed || 'Connected AI provider'}</strong></span><span className="text-zinc-600">•</span><span className="text-[11px] font-mono text-zinc-400">Confidence: <strong className="text-amber-400">{executiveSummary.aiConfidenceScore}%</strong></span></div><h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-zinc-100 tracking-tight mt-1">AI-Powered Business Insights</h1><p className="text-sm text-zinc-400 mt-1 max-w-3xl">Cross-functional intelligence based on the current workspace telemetry returned by the connected platform.</p></div><div className="flex items-center gap-3"><Button variant="primary" size="md" isLoading={analyzing} onClick={runAnalysis} leftIcon={<Sparkles className="w-4 h-4" />}>Run Deep AI Audit</Button><Button variant="secondary" size="md" onClick={() => fetchInsights(true)} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>Refresh</Button></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card padding="md"><span className="text-[10px] font-mono uppercase text-zinc-500">Identified Loss</span><div className="text-xl font-serif-display font-bold text-red-400 mt-2">${executiveSummary.totalRevenueLossIdentified.toLocaleString()}</div></Card><Card padding="md"><span className="text-[10px] font-mono uppercase text-zinc-500">Potential Recovery</span><div className="text-xl font-serif-display font-bold text-amber-300 mt-2">${executiveSummary.potentialRecoveryAmount.toLocaleString()}</div>{recoveryRate !== null && <div className="text-[10px] text-amber-400 mt-1">{recoveryRate}% of identified loss</div>}</Card><Card padding="md"><span className="text-[10px] font-mono uppercase text-zinc-500">Health Index</span><div className="text-xl font-serif-display font-bold text-zinc-100 mt-2">{executiveSummary.overallHealthIndex} / 100</div></Card><Card padding="md"><span className="text-[10px] font-mono uppercase text-zinc-500">AI Confidence</span><div className="text-xl font-serif-display font-bold text-emerald-400 mt-2">{executiveSummary.aiConfidenceScore}%</div></Card></div>

      <div className="p-5 rounded-xl bg-[#0b0b11] border border-white/[0.08]"><h2 className="text-lg font-serif-display font-semibold text-zinc-100">{executiveSummary.headline}</h2><p className="text-sm text-zinc-300 mt-2">{executiveSummary.subheadline}</p><div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-white/[0.06]"><div><span className="text-[10px] text-zinc-500">Recorded Loss</span><div className="font-mono text-sm text-zinc-200 mt-1">${systemVsAiComparison.systemRecordedLoss.toLocaleString()}</div></div><div><span className="text-[10px] text-zinc-500">AI Projected Loss</span><div className="font-mono text-sm text-amber-200 mt-1">${systemVsAiComparison.aiProjectedLossWithChurn.toLocaleString()}</div></div><div><span className="text-[10px] text-zinc-500">Untracked SLA Decay</span><div className="font-mono text-sm text-orange-300 mt-1">${systemVsAiComparison.untrackedSlaDecay.toLocaleString()}</div></div><div><span className="text-[10px] text-zinc-500">Ad Fatigue Waste</span><div className="font-mono text-sm text-red-300 mt-1">${systemVsAiComparison.adFatigueWaste.toLocaleString()}</div></div></div></div>

      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto"><button onClick={() => setActiveTab('all')} className="px-3 py-1.5 text-xs rounded-lg whitespace-nowrap text-zinc-300">All ({revenueLossBreakdown.length + predictiveTrends.length + actionableRecommendations.length})</button><button onClick={() => setActiveTab('revenue_loss')} className="px-3 py-1.5 text-xs rounded-lg whitespace-nowrap text-zinc-300">Revenue Leakage ({revenueLossBreakdown.length})</button><button onClick={() => setActiveTab('predictive_trends')} className="px-3 py-1.5 text-xs rounded-lg whitespace-nowrap text-zinc-300">Predictive Trends ({predictiveTrends.length})</button><button onClick={() => setActiveTab('recommendations')} className="px-3 py-1.5 text-xs rounded-lg whitespace-nowrap text-zinc-300">Recommendations ({actionableRecommendations.length})</button></div>

      {(activeTab === 'all' || activeTab === 'revenue_loss') && <section className="space-y-4"><h3 className="text-base font-serif-display font-semibold text-zinc-100">Quantified Revenue Leakage</h3>{revenueLossBreakdown.length === 0 ? <Card padding="lg"><p className="text-sm text-zinc-500">No revenue leakage records returned.</p></Card> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{revenueLossBreakdown.map(item => <Card key={item.id} padding="md"><div className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-mono uppercase text-amber-400">{item.department}</span><h4 className="text-sm font-semibold text-zinc-100 mt-1">{item.title}</h4></div><span className="text-sm font-mono font-bold text-red-400">-${item.lostAmount.toLocaleString()}</span></div><p className="text-xs text-zinc-400 mt-2">{item.rootCause}</p><div className="mt-3 space-y-1">{item.detectedSignals.map((signal, i) => <div key={i} className="text-xs text-zinc-300">• {signal}</div>)}</div></Card>)}</div>}</section>}

      {(activeTab === 'all' || activeTab === 'predictive_trends') && <section className="space-y-4"><h3 className="text-base font-serif-display font-semibold text-zinc-100">Predictive Trends & Forward Outlook</h3>{predictiveTrends.length === 0 ? <Card padding="lg"><p className="text-sm text-zinc-500">No predictive trends returned.</p></Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{predictiveTrends.map(trend => <Card key={trend.id} padding="md"><div className="flex items-center justify-between"><span className="text-[10px] font-mono text-zinc-400">{trend.timeframe}</span><span className="text-[10px] font-mono text-amber-300">{trend.aiConfidence}% confidence</span></div><h4 className="text-xs font-semibold text-zinc-200 mt-3">{trend.metric}</h4><div className="flex items-center gap-2 mt-2">{trend.trajectory === 'down' ? <TrendingDown className="w-4 h-4 text-red-400" /> : trend.trajectory === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : null}<span className="text-sm font-serif-display font-bold text-zinc-100">{trend.projection}</span></div><p className="text-xs text-zinc-400 mt-2">{trend.predictionDetail}</p><div className="flex justify-between mt-4 pt-3 border-t border-white/[0.06] text-[10px] font-mono"><span>{trend.baselineValue}</span><span className="text-amber-300">{trend.forecastedValue}</span></div></Card>)}</div>}</section>}

      {(activeTab === 'all' || activeTab === 'recommendations') && <section className="space-y-4"><div className="flex items-center justify-between"><h3 className="text-base font-serif-display font-semibold text-zinc-100">Actionable Recommendations</h3><span className="text-xs text-zinc-500">{actionableRecommendations.filter(r => r.status === 'executed').length} executed / {actionableRecommendations.length}</span></div>{actionableRecommendations.length === 0 ? <Card padding="lg"><p className="text-sm text-zinc-500">No recommendations returned.</p></Card> : actionableRecommendations.map(rec => <Card key={rec.id} padding="lg" className="border-amber-500/20"><div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div className="flex-1"><div className="text-[10px] font-mono uppercase text-amber-300">{rec.targetModuleLabel}</div><h4 className="text-base font-serif-display font-bold text-zinc-100 mt-1">{rec.title}</h4><p className="text-xs text-zinc-300 mt-2">{rec.aiRationale}</p><div className="mt-3 space-y-1">{rec.implementationSteps.map((step, i) => <div key={i} className="text-xs text-zinc-400">{i + 1}. {step}</div>)}</div></div><div className="text-right"><div className="text-lg font-serif-display font-bold text-amber-300">+${rec.projectedRecovery.toLocaleString()}</div><div className="text-[10px] text-zinc-500 mt-1">{rec.aiConfidence}% confidence</div></div></div><div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/[0.06]"><Button variant="secondary" size="sm" onClick={() => navigate(rec.targetModule)} rightIcon={<ArrowRight className="w-3 h-3" />}>{rec.actionButtonText}</Button>{rec.status !== 'executed' ? <Button variant="primary" size="sm" isLoading={executingId === rec.id} onClick={() => execute(rec)} leftIcon={<Zap className="w-3 h-3" />}>Execute Decision</Button> : <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Executed</span>}</div></Card>)}</section>}
    </div>
  );
};
