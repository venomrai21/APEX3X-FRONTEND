import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bot, CheckCircle2, DollarSign, TrendingUp, ShieldCheck, Zap, ChevronRight, Sparkles, Building2, Users, Target, Settings2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { DashboardSummary, BusinessProfileData } from '../types';
import { Badge, Button, Card, Skeleton, APEXMetric, APEXReveal, APEXSpotlight, AnimatedList, AnimatedProgress, ExpandableCard, PinnedList } from '../components/apex3x';

export const DashboardView: React.FC = () => {
  const { setActiveNav, addToast, triggerRefresh, refreshKey } = useApp();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [pinnedDealIds, setPinnedDealIds] = useState<string[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfileData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const result = await api.getDashboardSummary();
      if (!result || typeof result !== 'object' || !result.autonomousCycleStatus || !result.metrics) {
        throw new Error('Live workspace dashboard data is not available at this frontend origin.');
      }
      setData(result);
    } catch (err) {
      console.warn('Live dashboard data unavailable:', err);
      setData(null);
      setLoadError(err instanceof Error ? err.message : 'Live workspace data is unavailable.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboard(); api.getBusinessProfile().then(setBusinessProfile).catch(err => console.warn('Live business profile data unavailable:', err)); }, [refreshKey]);

  const handleExecuteAction = async (alertId: string) => {
    try {
      setExecutingId(alertId);
      const res = await api.executeBrainAction(alertId);
      addToast({ type: 'success', title: 'Autonomous Action Executed', description: res.message });
      await fetchDashboard();
      triggerRefresh();
    } catch (err) {
      addToast({ type: 'error', title: 'Execution Failed', description: (err as Error).message });
    } finally { setExecutingId(null); }
  };

  if (loading) return <div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div><Skeleton className="h-64" /><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Skeleton className="h-72" /><Skeleton className="h-72" /></div></div>;

  if (!data) return (
    <div className="space-y-6 pb-12">
      <APEXReveal>
        <div className="p-6 rounded-xl bg-[#0d0d14] border border-white/[0.08] shadow-xl shadow-black/60">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-white/[0.06] text-zinc-200 border border-white/[0.10]"><Bot className="w-4 h-4" /></span>
            <h2 className="text-base font-serif-display font-semibold text-zinc-100">Command Center</h2>
          </div>
          <p className="text-sm text-zinc-300 mt-3">The APEX interface is ready. Live workspace data is not available at this frontend origin yet.</p>
          <p className="text-xs text-zinc-500 mt-2 max-w-2xl">No business metrics or activity are being fabricated. Connect the existing SaaS API to this frontend origin to populate the Command Center.</p>
          {loadError && <p className="text-[11px] text-zinc-600 mt-3 font-mono">{loadError}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="primary" size="sm" onClick={() => setActiveNav('business_profile')}>Open Business Profile</Button>
            <Button variant="ghost" size="sm" onClick={fetchDashboard}>Retry live data</Button>
          </div>
        </div>
      </APEXReveal>
    </div>
  );

  const { metrics, autonomousCycleStatus, pendingAlerts, recentDeals } = data;
  const cycleSteps = [
    { step: '1. DETECT', desc: 'Identify revenue leakage and operational latency', label: `${autonomousCycleStatus.detectedAnomalies} anomaly signals` },
    { step: '2. UNDERSTAND', desc: 'Diagnose operational root cause', label: 'Root-cause analysis' },
    { step: '3. DECIDE', desc: 'Prescribe highest-leverage actions', label: 'Decision state' },
    { step: '4. ACT', desc: 'Dispatch through connected channels', label: 'Dispatch state' },
    { step: '5. LEARN', desc: 'Tune operational parameters from outcomes', label: 'Feedback state' },
  ];
  const dealItems = recentDeals.map(deal => ({ id: deal.id, title: deal.title, meta: `${deal.company} · $${deal.value.toLocaleString()} · ${deal.probability}%`, pinned: pinnedDealIds.includes(deal.id) }));

  return <div className="space-y-6 pb-12">
    <APEXReveal>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#0d0d14] border border-white/[0.08] shadow-xl shadow-black/60">
        <div>
          <div className="flex items-center gap-2"><span className="p-1 rounded bg-white/[0.06] text-zinc-200 border border-white/[0.10]"><Bot className="w-4 h-4" /></span><h2 className="text-base font-serif-display font-semibold text-zinc-100">Overview</h2><Badge variant="default" size="sm">{autonomousCycleStatus.currentPhase || 'Current cycle state'}</Badge></div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">Your business activity at a glance.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setActiveNav('brain')} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>View Brain Diagnostics</Button>
      </div>
    </APEXReveal>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <APEXSpotlight className="group rounded-xl border border-white/[0.08] bg-[#0b0b11]">
        <Card variant="default" padding="md" className="border-0 bg-transparent"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Revenue at Risk</span><span className="p-1.5 rounded-lg bg-white/[0.05] text-zinc-300 border border-white/[0.08]"><AlertTriangle className="w-4 h-4" /></span></div><div className="mt-3"><APEXMetric value={metrics.totalRevenueAtRisk} prefix="$" className="text-2xl font-serif-display font-bold text-zinc-100" /><div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400"><span className="text-zinc-200 font-medium">{autonomousCycleStatus.detectedAnomalies} anomalies</span><span>reported by current business data</span></div></div></Card>
      </APEXSpotlight>
      <APEXSpotlight className="group rounded-xl border border-white/[0.08] bg-[#0b0b11]">
        <Card variant="default" padding="md" className="border-0 bg-transparent"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Pipeline</span><span className="p-1.5 rounded-lg bg-white/[0.05] text-zinc-300 border border-white/[0.08]"><TrendingUp className="w-4 h-4" /></span></div><div className="mt-3"><APEXMetric value={metrics.activePipelineValue} prefix="$" className="text-2xl font-serif-display font-bold text-zinc-100" /><div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400"><span className="font-medium text-zinc-200">${metrics.wonValueThisMonth.toLocaleString()}</span><span>won this billing cycle</span></div></div></Card>
      </APEXSpotlight>
      <APEXSpotlight className="group rounded-xl border border-white/[0.08] bg-[#0b0b11]">
        <Card variant="default" padding="md" className="border-0 bg-transparent"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Overdue Receivables</span><span className="p-1.5 rounded-lg bg-white/[0.05] text-zinc-300 border border-white/[0.08]"><DollarSign className="w-4 h-4" /></span></div><div className="mt-3"><APEXMetric value={metrics.overdueReceivables} prefix="$" className="text-2xl font-serif-display font-bold text-zinc-100" /><div className="text-[11px] text-zinc-400 mt-1">Current receivables business data</div></div></Card>
      </APEXSpotlight>
      <APEXSpotlight className="group rounded-xl border border-white/[0.08] bg-[#0b0b11]">
        <Card variant="default" padding="md" className="border-0 bg-transparent"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">System Health</span><span className="p-1.5 rounded-lg bg-white/[0.05] text-zinc-300 border border-white/[0.08]"><ShieldCheck className="w-4 h-4" /></span></div><div className="mt-3"><APEXMetric value={metrics.systemHealth} suffix="%" className="text-2xl font-serif-display font-bold text-zinc-100" /><AnimatedProgress value={metrics.systemHealth} label="Live health signal" showValue={false} className="mt-2" /><div className="text-[11px] text-zinc-400 mt-1">{metrics.connectedIntegrationsCount} connected integrations reported</div></div></Card>
      </APEXSpotlight>
    </div>

    <APEXReveal delay={0.04}>
      <Card variant="improved" padding="lg" className="border-white/[0.08]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-white/[0.07]">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2"><Building2 className="w-4 h-4 text-zinc-300" /> APEX Business Understanding</h3>
            <p className="text-xs text-zinc-400 mt-1">What APEX currently knows about this business, backed by cloud-persisted profile context.</p>
          </div>
          <button onClick={() => setActiveNav('business_profile')} className="text-xs text-zinc-300 hover:text-white font-medium flex items-center gap-1">View complete profile <ChevronRight className="w-3 h-3" /></button>
        </div>
        {businessProfile ? (() => {
          const p = businessProfile.profile || {};
          const offers = Array.isArray(p.products) ? p.products.filter((item: any) => item?.name).length : 0;
          const customers = Array.isArray(p.targetCustomers) ? p.targetCustomers.join(', ') : (p.targetCustomerDescription || 'Not yet defined');
          const models = Array.isArray(p.businessModels) ? p.businessModels.join(', ') : 'Not yet defined';
          const goals = Array.isArray(p.growthPriorities) ? p.growthPriorities.join(', ') : (Array.isArray(p.goals) ? p.goals.map((g: any) => g?.goal).filter(Boolean).join(', ') : 'Not yet defined');
          const field = (value: any, fallback = 'Not yet defined') => String(value || '').trim() || fallback;
          const items = [
            { icon: Building2, label: 'Business Foundation', values: [field(p.businessName), field(p.industry), field(p.market || p.location), field(models), `${offers} offer${offers === 1 ? '' : 's'} defined`] },
            { icon: Users, label: 'Customer Understanding', values: [customers, field(p.primaryAcquisitionChannel || p.acquisitionChannels?.[0]), field(p.biggestChallenge || p.challenges)] },
            { icon: DollarSign, label: 'Revenue & Sales', values: [field(p.salesJourney), field(p.salesCycle || p.typicalSalesCycle), field(p.conversionDefinition), field(p.averageTransactionValue), field(p.paymentTerms)] },
            { icon: Settings2, label: 'Operations', values: [field(p.serviceArea), field(p.businessHours), field(p.languages), field(p.capacity)] },
            { icon: Target, label: 'Goals & Priorities', values: [field(p.currentCondition), field(p.biggestChallenge), goals] },
          ];
          return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 pt-4">
            {items.map(({ icon: Icon, label, values }) => <div key={label} className="rounded-lg border border-white/[0.07] bg-[#0b0b11] p-4 min-h-[150px]">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-200"><Icon className="w-3.5 h-3.5 text-zinc-400" />{label}</div>
              <div className="mt-3 space-y-2">{values.map((value, index) => <div key={index} className={index === 0 ? 'text-xs text-zinc-200 leading-snug' : 'text-[10px] text-zinc-500 leading-snug'}>{value}</div>)}</div>
            </div>)}
          </div>;
        })() : <div className="pt-4 text-xs text-zinc-500">Business understanding will appear here after the cloud profile is available.</div>}
        {businessProfile && <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
          <span className="rounded-full border border-white/[0.07] px-2 py-1">Cloud source</span>
          <span className="rounded-full border border-white/[0.07] px-2 py-1">{businessProfile.foundationCompleted ? 'Foundation confirmed' : 'Foundation incomplete'}</span>
          <span className="rounded-full border border-white/[0.07] px-2 py-1">Updated {businessProfile.updatedAt ? new Date(businessProfile.updatedAt).toLocaleString() : 'not yet'}</span>
        </div>}
      </Card>
    </APEXReveal>

    <APEXReveal delay={0.05}>
      <Card variant="improved" padding="lg" className="border-white/[0.08]"><div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]"><div><h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2"><Zap className="w-4 h-4 text-zinc-300" /> Operating Cycle</h3><p className="text-xs text-zinc-400 mt-0.5">The operating cycle is represented from current workspace data.</p></div><Badge variant="default" size="sm"><CheckCircle2 className="w-3 h-3" /> Recovered ${autonomousCycleStatus.recoveredRevenueMonth.toLocaleString()} this month</Badge></div><div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-4">{cycleSteps.map(item => <div key={item.step} className="p-3 rounded-lg border bg-[#0b0b11] border-white/[0.07] space-y-1.5"><div className="flex items-center justify-between"><span className="text-[11px] font-mono font-semibold text-zinc-200">{item.step}</span></div><p className="text-[11px] text-zinc-400 leading-snug">{item.desc}</p><p className="text-[10px] font-mono text-zinc-500 pt-1">{item.label}</p></div>)}</div></Card>
    </APEXReveal>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-4"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">Revenue Issues <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.08] text-zinc-200 font-mono">{pendingAlerts.length}</span></h3><p className="text-xs text-zinc-400 mt-0.5">Decisions available in your workspace.</p></div><button onClick={() => setActiveNav('brain')} className="text-xs text-zinc-300 hover:text-white font-medium flex items-center gap-1">View Details <ChevronRight className="w-3 h-3" /></button></div><AnimatedList className="space-y-3">{pendingAlerts.length === 0 ? [<Card key="empty" padding="md"><p className="text-xs text-zinc-500">No pending interventions.</p></Card>] : pendingAlerts.map(alert => <ExpandableCard key={alert.id} title={alert.headline} summary={`${alert.severity.toUpperCase()} · $${alert.revenueAtRisk.toLocaleString()} at risk`}><div className="space-y-3"><div className="flex items-center gap-2"><Badge variant="default" size="sm"><AlertTriangle className="w-3 h-3" /> {alert.severity.toUpperCase()}</Badge><span className="text-[11px] text-zinc-500 font-mono">{new Date(alert.suggestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><p className="text-xs text-zinc-300 leading-relaxed">{alert.detectedIssue}</p><div className="p-3 rounded-lg bg-[#07070b] border border-white/[0.06] text-xs text-zinc-300"><span className="text-zinc-200 font-medium">Prescribed Action: </span>{alert.recommendedAction}</div><div className="flex justify-end"><Button variant="primary" size="sm" isLoading={executingId === alert.id} onClick={() => handleExecuteAction(alert.id)} leftIcon={<Zap className="w-3.5 h-3.5" />}>Execute</Button></div></div></ExpandableCard>)}</AnimatedList></div>
      <div className="lg:col-span-5 space-y-4"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-zinc-100">Commercial Pipeline</h3><p className="text-xs text-zinc-400 mt-0.5">Your current deals and pipeline.</p></div><button onClick={() => setActiveNav('pipeline')} className="text-xs text-zinc-300 hover:text-white font-medium flex items-center gap-1">Pipeline Board <ChevronRight className="w-3 h-3" /></button></div><Card variant="default" padding="md"><PinnedList items={dealItems} onTogglePin={id => setPinnedDealIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])} renderItem={item => <div><p className="text-xs font-semibold text-zinc-200 truncate">{item.title}</p><p className="text-[10px] text-zinc-500 mt-0.5 truncate">{item.meta}</p></div>} /><div className="pt-3 mt-2 border-t border-white/[0.06] text-center"><Button variant="ghost" size="sm" className="w-full text-xs text-zinc-400" onClick={() => setActiveNav('pipeline')}>View all pipeline stages &rarr;</Button></div></Card></div>
    </div>
  </div>;
};
