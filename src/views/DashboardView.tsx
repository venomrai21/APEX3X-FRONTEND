import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, Bot, CheckCircle2, DollarSign, TrendingUp, ShieldCheck, Zap,
  ChevronRight, Sparkles, Building2, Users, Target, Settings2, MessageSquare,
  CalendarClock, Workflow, PlugZap, Receipt, Megaphone, RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { formatMoney } from '../currency';
import {
  DashboardSummary, BusinessProfileData, Customer, Lead, Appointment,
  ConversationThread, Invoice, WorkflowRule, WorkflowExecutionLog, IntegrationConnection
} from '../types';
import {
  Badge, Button, Card, Skeleton, APEXMetric, APEXReveal, APEXSpotlight,
  AnimatedProgress, ExpandableCard, PinnedList
} from '../components/apex3x';

type AuxState = {
  customers: Customer[];
  leads: Lead[];
  bookings: Appointment[];
  conversations: ConversationThread[];
  invoices: Invoice[];
  workflows: WorkflowRule[];
  workflowLogs: WorkflowExecutionLog[];
  integrations: IntegrationConnection[];
  marketing: Awaited<ReturnType<typeof api.getMarketingOverview>> | null;
};

const emptyAux: AuxState = {
  customers: [],
  leads: [],
  bookings: [],
  conversations: [],
  invoices: [],
  workflows: [],
  workflowLogs: [],
  integrations: [],
  marketing: null,
};

const money = (value: number, currency: string | undefined) => formatMoney(value, currency);
const dateLabel = (value?: string) => value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not available';

export const DashboardView: React.FC = () => {
  const { setActiveNav, addToast, triggerRefresh, refreshKey } = useApp();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [aux, setAux] = useState<AuxState>(emptyAux);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [pinnedDealIds, setPinnedDealIds] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const summary = await api.getDashboardSummary();
      if (!summary || typeof summary !== 'object' || !summary.autonomousCycleStatus || !summary.metrics) {
        throw new Error('Live workspace dashboard data is not available at this frontend origin.');
      }
      setData(summary);

      const results = await Promise.allSettled([
        api.getCustomers(),
        api.getLeads(),
        api.getBookings(),
        api.getConversations(),
        api.getInvoices(),
        api.getWorkflows(),
        api.getWorkflowLogs(),
        api.getIntegrations(),
        api.getMarketingOverview(),
        api.getBusinessProfile(),
      ]);

      const [customers, leads, bookings, conversations, invoices, workflows, workflowLogs, integrations, marketing, profile] = results;
      setAux({
        customers: customers.status === 'fulfilled' ? customers.value : [],
        leads: leads.status === 'fulfilled' ? leads.value : [],
        bookings: bookings.status === 'fulfilled' ? bookings.value : [],
        conversations: conversations.status === 'fulfilled' ? conversations.value : [],
        invoices: invoices.status === 'fulfilled' ? invoices.value : [],
        workflows: workflows.status === 'fulfilled' ? workflows.value : [],
        workflowLogs: workflowLogs.status === 'fulfilled' ? workflowLogs.value : [],
        integrations: integrations.status === 'fulfilled' ? integrations.value : [],
        marketing: marketing.status === 'fulfilled' ? marketing.value : null,
      });
      setBusinessProfile(profile.status === 'fulfilled' ? profile.value : null);
    } catch (err) {
      console.warn('Live dashboard data unavailable:', err);
      setData(null);
      setAux(emptyAux);
      setBusinessProfile(null);
      setLoadError(err instanceof Error ? err.message : 'Live workspace data is unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, [refreshKey]);

  const handleExecuteAction = async (alertId: string) => {
    try {
      setExecutingId(alertId);
      const res = await api.executeBrainAction(alertId);
      addToast({ type: 'success', title: 'Autonomous Action Executed', description: res.message });
      await fetchDashboard();
      triggerRefresh();
    } catch (err) {
      addToast({ type: 'error', title: 'Execution Failed', description: (err as Error).message });
    } finally {
      setExecutingId(null);
    }
  };

  const currency = String(businessProfile?.profile?.currency || data?.workspace?.currency || '').trim().toUpperCase() || undefined;
  const currencyLabel = currency ? currency : 'Currency not configured';

  const derived = useMemo(() => {
    const activeCustomers = aux.customers.filter(customer => customer.status === 'active').length;
    const atRiskCustomers = aux.customers.filter(customer => customer.status === 'at_risk').length;
    const averageHealth = aux.customers.length
      ? Math.round(aux.customers.reduce((sum, customer) => sum + customer.healthScore, 0) / aux.customers.length)
      : null;
    const openLeads = aux.leads.filter(lead => !['converted', 'lost'].includes(lead.status)).length;
    const highRiskLeads = aux.leads.filter(lead => lead.leakRisk === 'high').length;
    const pendingBookings = aux.bookings.filter(booking => booking.status === 'pending').length;
    const unreadConversations = aux.conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);
    const urgentConversations = aux.conversations.filter(conversation => conversation.priority === 'high' && conversation.status !== 'resolved').length;
    const activeWorkflows = aux.workflows.filter(workflow => workflow.isActive).length;
    const failedWorkflowRuns = aux.workflowLogs.filter(log => log.status === 'failed').length;
    const connectedIntegrations = aux.integrations.filter(connection => connection.status === 'connected').length;
    const integrationAttention = aux.integrations.filter(connection => ['error', 'disconnected', 'pending'].includes(connection.status)).length;
    const invoiceCurrencies = [...new Set(aux.invoices.map(invoice => invoice.currency).filter(Boolean))] as string[];
    const formatLedgerTotal = (value: number) => invoiceCurrencies.length === 1 ? money(value, invoiceCurrencies[0]) : invoiceCurrencies.length > 1 ? 'Multiple currencies' : money(value, currency);
    const totalInvoiced = aux.invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const collected = aux.invoices.filter(invoice => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0);
    const outstanding = aux.invoices.filter(invoice => invoice.status !== 'paid' && invoice.status !== 'draft').reduce((sum, invoice) => sum + invoice.amount, 0);
    const overdue = aux.invoices.filter(invoice => invoice.status === 'overdue' || invoice.status === 'in_collection').reduce((sum, invoice) => sum + invoice.amount, 0);
    const collectionRate = totalInvoiced > 0 ? Math.round((collected / totalInvoiced) * 100) : null;
    const riskByCategory = data?.pendingAlerts.reduce<Record<string, number>>((acc, alert) => {
      acc[alert.category] = (acc[alert.category] || 0) + alert.revenueAtRisk;
      return acc;
    }, {}) || {};
    const cycleCounts = data?.pendingAlerts.reduce<Record<string, number>>((acc, alert) => {
      acc[alert.stage] = (acc[alert.stage] || 0) + 1;
      return acc;
    }, {}) || {};
    const latestSync = aux.integrations
      .map(connection => connection.lastSyncedAt)
      .filter(Boolean)
      .sort()
      .at(-1);
    const recentSignals = [
      ...aux.leads.map(item => ({ id: 'lead-' + item.id, time: item.createdAt, label: 'Lead captured', detail: item.name + (item.company ? ' · ' + item.company : '') })),
      ...aux.customers.map(item => ({ id: 'customer-' + item.id, time: item.lastActiveAt, label: 'Customer activity', detail: item.name + (item.company ? ' · ' + item.company : '') })),
      ...aux.conversations.map(item => ({ id: 'conversation-' + item.id, time: item.lastMessageAt, label: 'Conversation updated', detail: item.contactName + ' · ' + item.channel })),
      ...aux.bookings.map(item => ({ id: 'booking-' + item.id, time: item.scheduledAt, label: 'Booking scheduled', detail: item.title + ' · ' + item.customerName })),
      ...aux.invoices.map(item => ({ id: 'invoice-' + item.id, time: item.issueDate, label: 'Invoice issued', detail: item.invoiceNumber + ' · ' + money(item.amount, item.currency || currency) })),
      ...(data?.recentDeals || []).map(item => ({ id: 'deal-' + item.id, time: item.updatedAt, label: 'Deal updated', detail: item.title + ' · ' + money(item.value, currency) })),
    ].filter(item => item.time).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

    return {
      activeCustomers, atRiskCustomers, averageHealth, openLeads, highRiskLeads, pendingBookings,
      unreadConversations, urgentConversations, activeWorkflows, failedWorkflowRuns, connectedIntegrations,
      integrationAttention, totalInvoiced, collected, outstanding, overdue, collectionRate, riskByCategory,
      cycleCounts, latestSync, recentSignals, invoiceCurrencies, formatLedgerTotal,
    };
  }, [aux, data, currency]);

  if (loading) {
    return <div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-5 gap-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-28" />)}</div><Skeleton className="h-72" /><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Skeleton className="h-72" /><Skeleton className="h-72" /></div></div>;
  }

  if (!data) {
    return (
      <div className="space-y-6 pb-12">
        <APEXReveal>
          <div className="p-6 rounded-xl bg-[#0d0d14] border border-white/[0.08] shadow-xl shadow-black/60">
            <div className="flex items-center gap-2"><span className="p-1 rounded bg-white/[0.06] text-zinc-200 border border-white/[0.10]"><Bot className="w-4 h-4" /></span><h2 className="text-base font-serif-display font-semibold text-zinc-100">Command Center</h2></div>
            <p className="text-sm text-zinc-300 mt-3">Live workspace data is not available at this frontend origin.</p>
            <p className="text-xs text-zinc-500 mt-2 max-w-2xl">No business metrics or activity are being fabricated. Connect the existing SaaS API to this frontend origin to populate the Command Center.</p>
            {loadError && <p className="text-[11px] text-zinc-600 mt-3 font-mono">{loadError}</p>}
            <div className="mt-5 flex flex-wrap gap-2"><Button variant="primary" size="sm" onClick={() => setActiveNav('business_profile')}>Open Business Profile</Button><Button variant="ghost" size="sm" onClick={fetchDashboard} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>Retry live data</Button></div>
          </div>
        </APEXReveal>
      </div>
    );
  }

  const { metrics, autonomousCycleStatus, pendingAlerts, recentDeals } = data;
  const dealItems = recentDeals.map(deal => ({
    id: deal.id,
    title: deal.title,
    meta: deal.company + ' · ' + money(deal.value, currency) + ' · ' + deal.probability + '%',
    pinned: pinnedDealIds.includes(deal.id)
  }));

  const riskLabels: Record<string, string> = {
    unresponsive_lead: 'Lead leakage',
    overdue_receivable: 'Receivables',
    ad_spend_leak: 'Advertising leakage',
    calendar_noshow: 'Booking leakage',
    pipeline_stall: 'Pipeline leakage',
  };

  const cycleSteps = [
    { key: 'detect', step: '1. DETECT', desc: 'Signals detected in current workspace data', count: derived.cycleCounts.detect || 0 },
    { key: 'understand', step: '2. UNDERSTAND', desc: 'Signals currently classified for analysis', count: derived.cycleCounts.understand || 0 },
    { key: 'decide', step: '3. DECIDE', desc: 'Signals with a decision state', count: derived.cycleCounts.decide || 0 },
    { key: 'act', step: '4. ACT', desc: 'Signals currently in the action stage', count: derived.cycleCounts.act || 0 },
    { key: 'learn', step: '5. LEARN', desc: 'Signals currently in the learning stage', count: derived.cycleCounts.learn || 0 },
  ];

  const acquisitionSpend = aux.marketing ? aux.marketing.googleAds.monthlySpend + aux.marketing.metaAds.monthlySpend : null;
  const acquisitionConversions = aux.marketing ? aux.marketing.googleAds.conversions + aux.marketing.metaAds.leadsGenerated : null;
  const attributionRevenue = aux.marketing ? aux.marketing.channelAttribution.reduce((sum, item) => sum + item.revenue, 0) : null;

  return (
    <div className="space-y-6 pb-12">
      <APEXReveal>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#0d0d14] border border-white/[0.08] shadow-xl shadow-black/60">
          <div>
            <div className="flex items-center gap-2"><span className="p-1 rounded bg-white/[0.06] text-zinc-200 border border-white/[0.10]"><Bot className="w-4 h-4" /></span><h2 className="text-base font-serif-display font-semibold text-zinc-100">Command Center</h2><Badge variant="default" size="sm">{autonomousCycleStatus.currentPhase || 'Current cycle state'}</Badge></div>
            <p className="text-xs text-zinc-400 mt-1">Business state, risk, action and operational signals in one live view.</p>
          </div>
          <div className="flex items-center gap-2"><span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[10px] text-zinc-400">{currencyLabel}</span><Button variant="primary" size="sm" onClick={() => setActiveNav('brain')} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>View Brain Diagnostics</Button></div>
        </div>
      </APEXReveal>

      <section>
        <div className="mb-3 flex items-end justify-between"><div><h3 className="text-sm font-semibold text-zinc-100">Business Status</h3><p className="text-xs text-zinc-500 mt-0.5">Current live state. No comparison period is shown until the API supplies comparable history.</p></div><span className="text-[10px] font-mono text-zinc-600">CURRENT SNAPSHOT</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <APEXSpotlight className="group rounded-xl border border-white/[0.08] bg-[#0b0b11]"><Card padding="md" className="border-0 bg-transparent"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Revenue at Risk</span><AlertTriangle className="w-4 h-4 text-zinc-300" /></div><div className="mt-3"><div className="text-2xl font-serif-display font-bold text-zinc-100">{money(metrics.totalRevenueAtRisk, currency)}</div><div className="text-[11px] text-zinc-400 mt-1">{currencyLabel} · {autonomousCycleStatus.detectedAnomalies} anomaly signals</div></div></Card></APEXSpotlight>
          <APEXSpotlight className="group rounded-xl border border-white/[0.08] bg-[#0b0b11]"><Card padding="md" className="border-0 bg-transparent"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Pipeline</span><TrendingUp className="w-4 h-4 text-zinc-300" /></div><div className="mt-3"><div className="text-2xl font-serif-display font-bold text-zinc-100">{money(metrics.activePipelineValue, currency)}</div><div className="text-[11px] text-zinc-400 mt-1">{money(metrics.wonValueThisMonth, currency)} won this month</div></div></Card></APEXSpotlight>
          <APEXSpotlight className="group rounded-xl border border-white/[0.08] bg-[#0b0b11]"><Card padding="md" className="border-0 bg-transparent"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Receivables</span><Receipt className="w-4 h-4 text-zinc-300" /></div><div className="mt-3"><div className="text-2xl font-serif-display font-bold text-zinc-100">{money(metrics.overdueReceivables, currency)}</div><div className="text-[11px] text-zinc-400 mt-1">Overdue reported by current workspace data</div></div></Card></APEXSpotlight>
          <APEXSpotlight className="group rounded-xl border border-white/[0.08] bg-[#0b0b11]"><Card padding="md" className="border-0 bg-transparent"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Customers / Leads</span><Users className="w-4 h-4 text-zinc-300" /></div><div className="mt-3 text-2xl font-serif-display font-bold text-zinc-100">{metrics.activeCustomersCount} / {metrics.openLeadsCount}</div><div className="text-[11px] text-zinc-400 mt-1">Active customers / open leads</div></Card></APEXSpotlight>
          <APEXSpotlight className="group rounded-xl border border-white/[0.08] bg-[#0b0b11]"><Card padding="md" className="border-0 bg-transparent"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">System Health</span><ShieldCheck className="w-4 h-4 text-zinc-300" /></div><div className="mt-3"><APEXMetric value={metrics.systemHealth} suffix="%" className="text-2xl font-serif-display font-bold text-zinc-100" /><AnimatedProgress value={metrics.systemHealth} label="Live health signal" showValue={false} className="mt-2" /><div className="text-[11px] text-zinc-400 mt-1">{metrics.connectedIntegrationsCount} connected integrations</div></div></Card></APEXSpotlight>
        </div>
      </section>

      <APEXReveal delay={0.03}>
        <Card variant="improved" padding="lg" className="border-white/[0.08]">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-white/[0.07]">
            <div><h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-zinc-300" /> Revenue at Risk</h3><p className="text-xs text-zinc-400 mt-1">Current risk signals grouped by the leakage category reported by APEX.</p></div>
            <Button variant="ghost" size="sm" onClick={() => setActiveNav('brain')}>Inspect causes <ChevronRight className="w-3 h-3 ml-1" /></Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-4">
            {Object.keys(riskLabels).map(category => <div key={category} className="rounded-lg border border-white/[0.07] bg-[#0b0b11] p-4"><div className="text-[10px] uppercase tracking-wider text-zinc-500">{riskLabels[category]}</div><div className="mt-2 text-lg font-semibold text-zinc-100">{money(derived.riskByCategory[category] || 0, currency)}</div><div className="mt-1 text-[10px] text-zinc-600">{pendingAlerts.filter(alert => alert.category === category).length} current signal(s)</div></div>)}
          </div>
        </Card>
      </APEXReveal>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <Card variant="improved" padding="lg" className="border-white/[0.08] h-full">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]"><div><h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2"><Zap className="w-4 h-4 text-zinc-300" /> APEX Detection / Decision State</h3><p className="text-xs text-zinc-400 mt-1">Counts are derived only from current alert records; missing stages are not inferred.</p></div><Badge variant="default" size="sm">{autonomousCycleStatus.currentPhase || 'Current'}</Badge></div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-4">{cycleSteps.map(item => <div key={item.key} className="rounded-lg border border-white/[0.07] bg-[#0b0b11] p-3"><div className="text-[10px] font-mono font-semibold text-zinc-400">{item.step}</div><div className="mt-2 text-xl font-semibold text-zinc-100">{item.count}</div><p className="mt-1 text-[10px] leading-relaxed text-zinc-500">{item.desc}</p></div>)}</div>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-zinc-500"><span className="rounded-full border border-white/[0.07] px-2 py-1">Recovered this month: {money(autonomousCycleStatus.recoveredRevenueMonth, currency)}</span><span className="rounded-full border border-white/[0.07] px-2 py-1">{autonomousCycleStatus.detectedAnomalies} detected anomalies</span></div>
          </Card>
        </div>

        <div className="xl:col-span-5">
          <Card variant="improved" padding="lg" className="border-white/[0.08] h-full">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]"><div><h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Commercial Engine</h3><p className="text-xs text-zinc-400 mt-1">Lead → customer → deal → invoice → payment.</p></div><Button variant="ghost" size="sm" onClick={() => setActiveNav('pipeline')}>Open pipeline</Button></div>
            <div className="space-y-3 pt-4">
              {[
                ['Open leads', String(derived.openLeads), derived.highRiskLeads + ' high-risk'],
                ['Active customers', String(derived.activeCustomers), derived.atRiskCustomers + ' at risk'],
                ['Open deals', String(recentDeals.filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage)).length), money(metrics.activePipelineValue, currency)],
                ['Outstanding invoices', String(aux.invoices.filter(invoice => invoice.status !== 'paid' && invoice.status !== 'draft').length), derived.formatLedgerTotal(derived.outstanding)],
                ['Collected', derived.formatLedgerTotal(derived.collected), derived.collectionRate === null ? 'Collection rate unavailable' : derived.collectionRate + '% of invoiced value'],
              ].map(([label, value, detail]) => <div key={label} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#0b0b11] px-3 py-2.5"><span className="text-xs text-zinc-400">{label}</span><div className="text-right"><div className="text-sm font-semibold text-zinc-100">{value}</div><div className="text-[10px] text-zinc-600">{detail}</div></div></div>)}
            </div>
          </Card>
        </div>
      </div>

      <APEXReveal delay={0.04}>
        <Card variant="improved" padding="lg" className="border-white/[0.08]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/[0.07]"><div><h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Priority Actions</h3><p className="text-xs text-zinc-400 mt-1">Problem → impact → recommended action. Execution remains behind the existing API permission boundary.</p></div><Badge variant="default" size="sm">{pendingAlerts.length} pending</Badge></div>
          <div className="space-y-3 pt-4">
            {pendingAlerts.length === 0 ? <div className="rounded-lg border border-white/[0.07] bg-[#0b0b11] p-4 text-xs text-zinc-500">No pending interventions are available from current live data.</div> : pendingAlerts.slice(0, 5).map(alert => <ExpandableCard key={alert.id} title={alert.headline} summary={alert.severity.toUpperCase() + ' · ' + money(alert.revenueAtRisk, currency) + ' at risk'}><div className="space-y-3"><div className="flex items-center gap-2"><Badge variant="default" size="sm"><AlertTriangle className="w-3 h-3" /> {alert.severity.toUpperCase()}</Badge><span className="text-[11px] text-zinc-500 font-mono">{dateLabel(alert.suggestedAt)}</span></div><p className="text-xs text-zinc-300 leading-relaxed">{alert.detectedIssue}</p><div className="p-3 rounded-lg bg-[#07070b] border border-white/[0.06] text-xs text-zinc-300"><span className="text-zinc-200 font-medium">Recommended action: </span>{alert.recommendedAction}</div><div className="flex justify-end"><Button variant="primary" size="sm" isLoading={executingId === alert.id} onClick={() => handleExecuteAction(alert.id)} leftIcon={<Zap className="w-3.5 h-3.5" />}>Execute</Button></div></div></ExpandableCard>)}
          </div>
        </Card>
      </APEXReveal>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card variant="improved" padding="lg"><div className="flex items-center justify-between pb-4 border-b border-white/[0.07]"><div><h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Acquisition</h3><p className="text-xs text-zinc-400 mt-1">Connected advertising overview.</p></div><Megaphone className="w-4 h-4 text-zinc-400" /></div>{aux.marketing ? <div className="space-y-3 pt-4"><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border border-white/[0.06] p-3"><span className="text-[10px] text-zinc-500">Spend</span><div className="mt-1 text-base font-semibold text-zinc-100">{money(acquisitionSpend || 0, currency)}</div></div><div className="rounded-lg border border-white/[0.06] p-3"><span className="text-[10px] text-zinc-500">Conversions</span><div className="mt-1 text-base font-semibold text-zinc-100">{acquisitionConversions}</div></div></div><div className="rounded-lg border border-white/[0.06] p-3"><span className="text-[10px] text-zinc-500">Attributed revenue</span><div className="mt-1 text-base font-semibold text-zinc-100">{money(attributionRevenue || 0, currency)}</div></div><Button variant="ghost" size="sm" className="w-full" onClick={() => setActiveNav('marketing')}>Open acquisition detail</Button></div> : <div className="pt-4 text-xs text-zinc-500">Connected marketing data is not available.</div>}</Card>

        <Card variant="improved" padding="lg"><div className="flex items-center justify-between pb-4 border-b border-white/[0.07]"><div><h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Customer Health</h3><p className="text-xs text-zinc-400 mt-1">Lifecycle signals from current customer records.</p></div><Users className="w-4 h-4 text-zinc-400" /></div><div className="space-y-3 pt-4"><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border border-white/[0.06] p-3"><span className="text-[10px] text-zinc-500">Active</span><div className="mt-1 text-base font-semibold text-zinc-100">{derived.activeCustomers}</div></div><div className="rounded-lg border border-white/[0.06] p-3"><span className="text-[10px] text-zinc-500">At risk</span><div className="mt-1 text-base font-semibold text-zinc-100">{derived.atRiskCustomers}</div></div></div><div className="rounded-lg border border-white/[0.06] p-3"><span className="text-[10px] text-zinc-500">Average health</span><div className="mt-1 text-base font-semibold text-zinc-100">{derived.averageHealth === null ? 'Not available' : derived.averageHealth + '%'}</div>{derived.averageHealth !== null && <AnimatedProgress value={derived.averageHealth} showValue={false} className="mt-2" />}</div><Button variant="ghost" size="sm" className="w-full" onClick={() => setActiveNav('customers')}>Open customer health</Button></div></Card>

        <Card variant="improved" padding="lg"><div className="flex items-center justify-between pb-4 border-b border-white/[0.07]"><div><h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Operations</h3><p className="text-xs text-zinc-400 mt-1">Bookings, conversations and automation.</p></div><Settings2 className="w-4 h-4 text-zinc-400" /></div><div className="space-y-2 pt-4">{[['Pending bookings', String(derived.pendingBookings), CalendarClock], ['Unread messages', String(derived.unreadConversations), MessageSquare], ['Urgent conversations', String(derived.urgentConversations), MessageSquare], ['Active workflows', String(derived.activeWorkflows), Workflow], ['Failed workflow runs', String(derived.failedWorkflowRuns), AlertTriangle]].map(([label, value, Icon]) => { const IconComponent = Icon as React.ElementType; return <div key={String(label)} className="flex items-center justify-between rounded-lg border border-white/[0.06] px-3 py-2.5"><span className="flex items-center gap-2 text-xs text-zinc-400"><IconComponent className="w-3.5 h-3.5 text-zinc-500" />{label}</span><span className="text-sm font-semibold text-zinc-100">{value}</span></div>; })}<Button variant="ghost" size="sm" className="w-full mt-1" onClick={() => setActiveNav('conversations')}>Open operations</Button></div></Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card variant="improved" padding="lg"><div className="flex items-center justify-between pb-4 border-b border-white/[0.07]"><div><h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Cash & Collections</h3><p className="text-xs text-zinc-400 mt-1">Current invoice ledger totals. Mixed transaction currencies are kept separate until the FX service is connected.</p></div><Receipt className="w-4 h-4 text-zinc-400" /></div><div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">{[['Invoiced', derived.formatLedgerTotal(derived.totalInvoiced)], ['Collected', derived.formatLedgerTotal(derived.collected)], ['Outstanding', derived.formatLedgerTotal(derived.outstanding)], ['Overdue', derived.formatLedgerTotal(derived.overdue)]].map(([label, value]) => <div key={label} className="rounded-lg border border-white/[0.06] p-3"><span className="text-[10px] text-zinc-500">{label}</span><div className="mt-1 text-sm font-semibold text-zinc-100">{value}</div></div>)}</div><div className="mt-3 text-[10px] text-zinc-600">{derived.collectionRate === null ? 'Collection rate unavailable from current ledger.' : 'Collection rate: ' + derived.collectionRate + '%.'} Cross-currency reporting requires the future FX service contract.</div></Card>

        <Card variant="improved" padding="lg"><div className="flex items-center justify-between pb-4 border-b border-white/[0.07]"><div><h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Connected Ecosystem</h3><p className="text-xs text-zinc-400 mt-1">Integration health and synchronization trust signals.</p></div><PlugZap className="w-4 h-4 text-zinc-400" /></div><div className="grid grid-cols-2 gap-3 pt-4"><div className="rounded-lg border border-white/[0.06] p-3"><span className="text-[10px] text-zinc-500">Connected</span><div className="mt-1 text-lg font-semibold text-zinc-100">{derived.connectedIntegrations}</div></div><div className="rounded-lg border border-white/[0.06] p-3"><span className="text-[10px] text-zinc-500">Needs attention</span><div className="mt-1 text-lg font-semibold text-zinc-100">{derived.integrationAttention}</div></div></div><div className="mt-3 rounded-lg border border-white/[0.06] p-3 text-[10px] text-zinc-500">Last integration sync: {dateLabel(derived.latestSync)}</div><Button variant="ghost" size="sm" className="w-full mt-3" onClick={() => setActiveNav('integrations')}>Open integrations</Button></Card>
      </div>

      <APEXReveal delay={0.05}>
        <Card variant="improved" padding="lg" className="border-white/[0.08]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/[0.07]"><div><h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Commercial Pipeline</h3><p className="text-xs text-zinc-400 mt-1">Recent deals with direct access to the detailed pipeline.</p></div><button onClick={() => setActiveNav('pipeline')} className="text-xs text-zinc-300 hover:text-white font-medium flex items-center gap-1">Pipeline Board <ChevronRight className="w-3 h-3" /></button></div>
          <div className="pt-4"><PinnedList items={dealItems} onTogglePin={id => setPinnedDealIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])} renderItem={item => <div><p className="text-xs font-semibold text-zinc-200 truncate">{item.title}</p><p className="text-[10px] text-zinc-500 mt-0.5 truncate">{item.meta}</p></div>} /><div className="pt-3 mt-2 border-t border-white/[0.06] text-center"><Button variant="ghost" size="sm" className="w-full text-xs text-zinc-400" onClick={() => setActiveNav('pipeline')}>View all pipeline stages →</Button></div></div>
        </Card>
      </APEXReveal>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card variant="improved" padding="lg"><div className="flex items-center justify-between pb-4 border-b border-white/[0.07]"><div><h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Recent Business Activity</h3><p className="text-xs text-zinc-400 mt-1">Latest records returned by connected services. This is not a fabricated event stream.</p></div><RefreshCw className="w-4 h-4 text-zinc-400" /></div><div className="space-y-2 pt-4">{derived.recentSignals.length === 0 ? <div className="text-xs text-zinc-500">No recent activity records available.</div> : derived.recentSignals.map(signal => <div key={signal.id} className="flex items-start justify-between gap-3 rounded-lg border border-white/[0.06] px-3 py-2.5"><div><div className="text-xs font-medium text-zinc-200">{signal.label}</div><div className="mt-0.5 text-[10px] text-zinc-500">{signal.detail}</div></div><span className="shrink-0 text-[10px] font-mono text-zinc-600">{dateLabel(signal.time)}</span></div>)}</div></Card>

        <Card variant="improved" padding="lg"><div className="flex items-center justify-between pb-4 border-b border-white/[0.07]"><div><h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Business Understanding</h3><p className="text-xs text-zinc-400 mt-1">Profile context that APEX can use for business-aware decisions.</p></div><Building2 className="w-4 h-4 text-zinc-400" /></div>{businessProfile ? (() => { const p = businessProfile.profile || {}; const field = (value: any, fallback = 'Not yet defined') => String(value || '').trim() || fallback; const offers = Array.isArray(p.products) ? p.products.filter((item: any) => item?.name).length : 0; return <div className="grid grid-cols-2 gap-3 pt-4">{[['Business', field(p.businessName)], ['Industry', field(p.industry)], ['Market', field(p.market || p.location)], ['Offers', String(offers)], ['Customers', Array.isArray(p.targetCustomers) ? p.targetCustomers.join(', ') : field(p.targetCustomerDescription)], ['Model', Array.isArray(p.businessModels) ? p.businessModels.join(', ') : 'Not yet defined']].map(([label, value]) => <div key={label} className="rounded-lg border border-white/[0.06] p-3"><div className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</div><div className="mt-1 text-xs text-zinc-200 leading-snug">{value}</div></div>)}</div>; })() : <div className="pt-4 text-xs text-zinc-500">Business profile data is not available.</div>}<div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500"><span className="rounded-full border border-white/[0.07] px-2 py-1">{businessProfile?.foundationCompleted ? 'Foundation confirmed' : 'Profile status unavailable'}</span><span className="rounded-full border border-white/[0.07] px-2 py-1">Updated {businessProfile?.updatedAt ? dateLabel(businessProfile.updatedAt) : 'not available'}</span><Button variant="ghost" size="sm" onClick={() => setActiveNav('business_profile')}>Open profile</Button></div></Card>
      </div>

      <div className="text-[10px] text-zinc-600">
        <span>Data trust: </span>primary dashboard summary is required for this view; secondary modules are shown only when their live API calls return data. Currency values use the selected business currency for presentation and preserve source transaction currencies elsewhere.
      </div>
    </div>
  );
};
