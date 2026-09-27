import React, { useEffect, useState } from 'react';
import { AlertTriangle, Bot, DollarSign, TrendingUp, ShieldCheck, Zap, ChevronRight, Sparkles, Users, MessageSquare, CalendarDays, Workflow, Plug, Megaphone, Receipt, Activity, ArrowUpRight, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { DashboardSummary, BusinessProfileData, Customer, Appointment, ConversationThread, WorkflowRule, WorkflowExecutionLog, IntegrationConnection, MarketingOverview, Invoice } from '../types';
import { Badge, Button, Card, Skeleton, APEXReveal, ExpandableCard } from '../components/apex3x';
import { formatMoney } from '../currency';

type Snapshot = { customers: Customer[]; bookings: Appointment[]; conversations: ConversationThread[]; workflows: WorkflowRule[]; workflowLogs: WorkflowExecutionLog[]; integrations: IntegrationConnection[]; marketing: MarketingOverview | null; invoices: Invoice[]; };
const emptySnapshot = (): Snapshot => ({ customers: [], bookings: [], conversations: [], workflows: [], workflowLogs: [], integrations: [], marketing: null, invoices: [] });

async function loadSnapshot(): Promise<Snapshot> {
  const results = await Promise.allSettled([
    api.getCustomers(), api.getBookings(), api.getConversations(), api.getWorkflows(),
    api.getWorkflowLogs(), api.getIntegrations(), api.getMarketingOverview(), api.getInvoices(),
  ]);
  const out = emptySnapshot();
  const values = results.map(r => r.status === 'fulfilled' ? r.value : null);
  out.customers = (values[0] as Customer[] | null) || [];
  out.bookings = (values[1] as Appointment[] | null) || [];
  out.conversations = (values[2] as ConversationThread[] | null) || [];
  out.workflows = (values[3] as WorkflowRule[] | null) || [];
  out.workflowLogs = (values[4] as WorkflowExecutionLog[] | null) || [];
  out.integrations = (values[5] as IntegrationConnection[] | null) || [];
  out.marketing = (values[6] as MarketingOverview | null) || null;
  out.invoices = (values[7] as Invoice[] | null) || [];
  return out;
}

const riskLabels: Record<string, string> = { unresponsive_lead: 'Lead leakage', overdue_receivable: 'Receivables', ad_spend_leak: 'Advertising', calendar_noshow: 'Bookings', pipeline_stall: 'Pipeline' };

export const DashboardView: React.FC = () => {
  const { setActiveNav, addToast, triggerRefresh, refreshKey } = useApp();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [profile, setProfile] = useState<BusinessProfileData | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot());
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setLoadError(null);
    const [dashboardResult, profileResult, snapshotResult] = await Promise.allSettled([api.getDashboardSummary(), api.getBusinessProfile(), loadSnapshot()]);
    if (dashboardResult.status === 'fulfilled' && dashboardResult.value?.metrics && dashboardResult.value?.autonomousCycleStatus) setData(dashboardResult.value);
    else { setData(null); setLoadError(dashboardResult.status === 'rejected' ? (dashboardResult.reason instanceof Error ? dashboardResult.reason.message : 'Live dashboard data is unavailable.') : 'Live dashboard data is unavailable.'); }
    if (profileResult.status === 'fulfilled') setProfile(profileResult.value);
    else setProfile(null);
    if (snapshotResult.status === 'fulfilled') setSnapshot(snapshotResult.value);
    else setSnapshot(emptySnapshot());
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [refreshKey]);

  const execute = async (id: string) => {
    try { setExecutingId(id); const result = await api.executeBrainAction(id); addToast({ type: 'success', title: 'Action executed', description: result.message }); await fetchAll(); triggerRefresh(); }
    catch (error) { addToast({ type: 'error', title: 'Execution failed', description: error instanceof Error ? error.message : 'Unable to execute the action.' }); }
    finally { setExecutingId(null); }
  };

  if (loading) return <div className="space-y-6"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div><Skeleton className="h-52" /><div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /></div></div>;

  if (!data) {
    const complete = Boolean(profile?.foundationCompleted);
    return <div className="space-y-6 pb-12"><APEXReveal><Card padding="lg"><div className="flex items-start gap-3"><Bot className="mt-0.5 h-4 w-4 text-zinc-300" /><div><h2 className="text-base font-semibold text-zinc-100">Command Center</h2><p className="mt-2 text-sm text-zinc-300">{complete ? "We couldn't load your business data. Check your connection and try again." : 'Complete your business profile to start using the Command Center.'}</p><p className="mt-2 text-xs text-zinc-500">{complete ? 'Your business profile is available, but live dashboard data could not be loaded.' : 'Add your business basics so APEX can work with a reliable business context.'}</p>{complete && loadError && <p className="mt-2 text-[11px] text-zinc-600">{loadError}</p>}<Button className="mt-5" variant="primary" size="sm" onClick={() => complete ? fetchAll() : setActiveNav('business_profile')} leftIcon={complete ? <RefreshCw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}>{complete ? 'Try again' : 'Complete Business Profile'}</Button></div></div></Card></APEXReveal></div>;
  }

  const { metrics, autonomousCycleStatus, pendingAlerts, recentDeals, workspace } = data;
  const currency = workspace.currency;
  const activeCustomers = snapshot.customers.filter(c => c.status === 'active');
  const atRiskCustomers = snapshot.customers.filter(c => c.status === 'at_risk');
  const unread = snapshot.conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const highPriority = snapshot.conversations.filter(c => c.priority === 'high' && c.status !== 'resolved').length;
  const activeWorkflows = snapshot.workflows.filter(w => w.isActive).length;
  const failedWorkflows = snapshot.workflowLogs.filter(l => l.status === 'failed').length;
  const connected = snapshot.integrations.filter(i => i.status === 'connected').length;
  const attention = snapshot.integrations.filter(i => i.status === 'error' || i.status === 'disconnected');
  const upcoming = snapshot.bookings.filter(b => new Date(b.scheduledAt).getTime() >= Date.now() && b.status !== 'cancelled').length;
  const pendingBookings = snapshot.bookings.filter(b => b.status === 'pending').length;
  const overdueInvoices = snapshot.invoices.filter(i => i.status === 'overdue' || i.status === 'in_collection');
  const invoiceCurrencies = Array.from(new Set(snapshot.invoices.map(i => i.currency).filter(Boolean)));
  const invoiceReportingCurrency = invoiceCurrencies.length === 1 ? invoiceCurrencies[0] : null;
  const invoiced = snapshot.invoices.reduce((sum, i) => invoiceReportingCurrency && i.currency === invoiceReportingCurrency ? sum + i.amount : sum, 0);
  const collected = snapshot.invoices.filter(i => i.status === 'paid' && (!invoiceReportingCurrency || i.currency === invoiceReportingCurrency)).reduce((sum, i) => sum + i.amount, 0);
  const outstanding = snapshot.invoices.filter(i => i.status !== 'paid' && i.status !== 'draft' && (!invoiceReportingCurrency || i.currency === invoiceReportingCurrency)).reduce((sum, i) => sum + i.amount, 0);
  const collectionRate = invoiceReportingCurrency && invoiced ? Math.round(collected / invoiced * 100) : null;
  const invoiceMoney = (amount: number) => invoiceReportingCurrency ? formatMoney(amount, invoiceReportingCurrency) : (snapshot.invoices.length ? 'Multiple currencies' : formatMoney(0, currency));
  const riskBreakdown = pendingAlerts.reduce<Record<string, number>>((out, a) => { out[a.category] = (out[a.category] || 0) + a.revenueAtRisk; return out; }, {});
  const activity = [
    ...recentDeals.map(d => ({ title: 'Deal updated', detail: d.title, time: d.updatedAt })),
    ...snapshot.invoices.map(i => ({ title: i.status === 'paid' ? 'Payment received' : i.status === 'overdue' ? 'Invoice overdue' : 'Invoice activity', detail: i.invoiceNumber + ' · ' + i.customerName, time: i.paidAt || i.dueDate })),
    ...snapshot.bookings.map(b => ({ title: 'Booking ' + b.status, detail: b.title + ' · ' + b.customerName, time: b.scheduledAt })),
    ...snapshot.conversations.map(c => ({ title: 'Customer conversation', detail: c.contactName + ' · ' + c.channel, time: c.lastMessageAt })),
    ...snapshot.workflowLogs.map(l => ({ title: 'Automation ' + l.status, detail: l.details, time: l.executedAt })),
  ].filter(x => x.time).sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

  const metricCards: Array<{ label: string; value: string; detail: string; Icon: React.ElementType }> = [
    ['Revenue at Risk', formatMoney(metrics.totalRevenueAtRisk, currency), 'Detected leakage', AlertTriangle],
    ['Active Pipeline', formatMoney(metrics.activePipelineValue, currency), 'Current open value', TrendingUp],
    ['Overdue Receivables', formatMoney(metrics.overdueReceivables, currency), 'Current overdue', DollarSign],
    ['Active Customers', String(metrics.activeCustomersCount), 'Current customers', Users],
    ['Open Leads', String(metrics.openLeadsCount), 'Waiting in CRM', ArrowUpRight],
    ['System Health', metrics.systemHealth + '%', String(metrics.connectedIntegrationsCount) + ' connected', ShieldCheck],
  ];

  return <div className="space-y-6 pb-12">
    <APEXReveal><div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-[#0d0d14] p-5 shadow-xl shadow-black/60 md:flex-row md:items-center md:justify-between"><div><div className="flex items-center gap-2"><Bot className="h-4 w-4 text-zinc-200" /><h2 className="text-base font-semibold text-zinc-100">Command Center</h2><Badge variant="default" size="sm">{autonomousCycleStatus.currentPhase || 'Live cycle'}</Badge></div><p className="mt-1 text-xs text-zinc-400">{workspace.name} · live workspace snapshot</p></div><div className="flex gap-2"><Button variant="ghost" size="sm" onClick={fetchAll} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>Refresh</Button><Button variant="primary" size="sm" onClick={() => setActiveNav('brain')} leftIcon={<Sparkles className="h-3.5 w-3.5" />}>View Brain Diagnostics</Button></div></div></APEXReveal>

    <section><div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-semibold text-zinc-100">Business Status</h3><p className="text-xs text-zinc-500">Current commercial and operating state.</p></div><span className="text-[10px] text-zinc-600">Reporting currency · {currency || 'not set'}</span></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{metricCards.map(([label,value,detail,Icon]) => <Card key={String(label)} padding="md" className="border-white/[0.08] bg-[#0b0b11]"><div className="flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{String(label)}</span><Icon className="h-4 w-4 text-zinc-500" /></div><div className="mt-3 text-xl font-semibold text-zinc-100">{String(value)}</div><div className="mt-1 text-[10px] text-zinc-500">{String(detail)}</div></Card>)}</div></section>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12"><APEXReveal className="xl:col-span-7"><Card padding="lg" className="h-full border-white/[0.08]"><div className="flex items-center justify-between border-b border-white/[0.07] pb-4"><div><h3 className="text-sm font-semibold text-zinc-100">Revenue at Risk</h3><p className="mt-1 text-xs text-zinc-500">Detected leakage grouped by source.</p></div><Badge variant="default" size="sm">{pendingAlerts.length} issues</Badge></div>{pendingAlerts.length ? <div className="mt-4 space-y-2">{Object.entries(riskBreakdown).map(([category,amount]) => <div key={category} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#0b0b11] p-3"><span className="text-xs text-zinc-300">{riskLabels[category] || category}</span><span className="text-xs font-semibold text-zinc-100">{formatMoney(amount, currency)}</span></div>)}</div> : <p className="mt-4 text-xs text-zinc-500">No revenue-risk alerts are currently reported.</p>}</Card></APEXReveal><APEXReveal className="xl:col-span-5"><Card padding="lg" className="h-full border-white/[0.08]"><div className="flex items-center justify-between border-b border-white/[0.07] pb-4"><div><h3 className="text-sm font-semibold text-zinc-100">APEX Cycle</h3><p className="mt-1 text-xs text-zinc-500">Detect → Understand → Decide → Act → Learn.</p></div><Badge variant="default" size="sm">{autonomousCycleStatus.detectedAnomalies} detected</Badge></div><div className="mt-4 space-y-2">{[['Detect',autonomousCycleStatus.detectedAnomalies + ' anomaly signals'],['Understand','Root-cause telemetry not reported'],['Decide',pendingAlerts.length + ' actionable alerts'],['Act','Execution state reported per action'],['Learn','Outcome telemetry not reported']].map(([stage,state],i)=><div key={stage} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#0b0b11] p-3"><span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.10] text-[10px] font-mono text-zinc-400">{i+1}</span><div><div className="text-xs font-semibold text-zinc-200">{stage}</div><div className="text-[10px] text-zinc-500">{state}</div></div></div>)}</div></Card></APEXReveal></div>

    <APEXReveal><Card padding="lg" className="border-white/[0.08]"><div className="flex items-center justify-between border-b border-white/[0.07] pb-4"><div><h3 className="text-sm font-semibold text-zinc-100">Priority Actions</h3><p className="mt-1 text-xs text-zinc-500">Problems APEX can act on from current workspace data.</p></div><button onClick={() => setActiveNav('brain')} className="text-xs text-zinc-300 hover:text-white">View all <ChevronRight className="inline h-3 w-3" /></button></div><div className="mt-4 space-y-3">{pendingAlerts.length === 0 ? <p className="text-xs text-zinc-500">Nothing currently requires intervention.</p> : pendingAlerts.slice(0,5).map(alert => <ExpandableCard key={alert.id} title={alert.headline} summary={alert.severity.toUpperCase() + ' · ' + formatMoney(alert.revenueAtRisk,currency) + ' at risk'}><div className="space-y-3"><p className="text-xs leading-relaxed text-zinc-300">{alert.detectedIssue}</p><div className="rounded-lg border border-white/[0.06] bg-[#07070b] p-3 text-xs text-zinc-300"><span className="font-medium text-zinc-200">Recommended action: </span>{alert.recommendedAction}</div><div className="flex justify-end"><Button variant="primary" size="sm" isLoading={executingId===alert.id} onClick={() => execute(alert.id)} leftIcon={<Zap className="h-3.5 w-3.5" />}>Execute</Button></div></div></ExpandableCard>)}</div></Card></APEXReveal>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3"><Card padding="lg"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-zinc-500" /><h3 className="text-sm font-semibold text-zinc-100">Customer Health</h3></div><div className="mt-4 grid grid-cols-2 gap-3"><div><div className="text-lg font-semibold text-zinc-100">{activeCustomers.length || metrics.activeCustomersCount}</div><div className="text-[10px] text-zinc-500">Active</div></div><div><div className="text-lg font-semibold text-zinc-100">{atRiskCustomers.length}</div><div className="text-[10px] text-zinc-500">At risk</div></div></div><div className="mt-4 text-xs text-zinc-400">Observed lifetime value · {formatMoney(activeCustomers.reduce((sum,c)=>sum+c.lifetimeValue,0),currency)}</div><Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => setActiveNav('customers')}>Open Customers</Button></Card><Card padding="lg"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-zinc-500" /><h3 className="text-sm font-semibold text-zinc-100">Operations</h3></div><div className="mt-4 space-y-2 text-xs text-zinc-300"><div className="flex justify-between"><span>Upcoming bookings</span><b>{upcoming}</b></div><div className="flex justify-between"><span>Pending confirmation</span><b>{pendingBookings}</b></div><div className="flex justify-between"><span>Unread conversations</span><b>{unread}</b></div><div className="flex justify-between"><span>High-priority conversations</span><b>{highPriority}</b></div></div><Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => setActiveNav('bookings')}>Open Operations</Button></Card><Card padding="lg"><div className="flex items-center gap-2"><Workflow className="h-4 w-4 text-zinc-500" /><h3 className="text-sm font-semibold text-zinc-100">Automation</h3></div><div className="mt-4 space-y-2 text-xs text-zinc-300"><div className="flex justify-between"><span>Active workflows</span><b>{activeWorkflows}</b></div><div className="flex justify-between"><span>Failed executions</span><b>{failedWorkflows}</b></div><div className="flex justify-between"><span>Recent executions</span><b>{snapshot.workflowLogs.length}</b></div></div><Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => setActiveNav('workflows')}>Open Automation</Button></Card></div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><Card padding="lg"><div className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-zinc-500" /><h3 className="text-sm font-semibold text-zinc-100">Acquisition & Growth</h3></div>{snapshot.marketing ? <div className="mt-4 grid grid-cols-2 gap-4 text-xs"><div><div className="text-lg font-semibold text-zinc-100">{formatMoney(snapshot.marketing.googleAds.monthlySpend+snapshot.marketing.metaAds.monthlySpend,currency)}</div><div className="text-[10px] text-zinc-500">Ad spend</div></div><div><div className="text-lg font-semibold text-zinc-100">{snapshot.marketing.metaAds.leadsGenerated+snapshot.marketing.googleAds.conversions}</div><div className="text-[10px] text-zinc-500">Tracked leads / conversions</div></div><div><div className="text-lg font-semibold text-zinc-100">{formatMoney(snapshot.marketing.googleAds.lostRoasOpportunity,currency)}</div><div className="text-[10px] text-zinc-500">Lost opportunity</div></div><div><div className="text-lg font-semibold text-zinc-100">{snapshot.marketing.googleAds.campaigns.filter(c=>c.status==='leaking').length}</div><div className="text-[10px] text-zinc-500">Leaking campaigns</div></div></div> : <p className="mt-4 text-xs text-zinc-500">Marketing data is not available from connected sources.</p>}<Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => setActiveNav('campaigns')}>Open Campaigns</Button></Card><Card padding="lg"><div className="flex items-center gap-2"><Receipt className="h-4 w-4 text-zinc-500" /><h3 className="text-sm font-semibold text-zinc-100">Cash & Collections</h3></div><div className="mt-4 grid grid-cols-2 gap-4 text-xs"><div><div className="text-lg font-semibold text-zinc-100">{invoiceMoney(invoiced)}</div><div className="text-[10px] text-zinc-500">Invoiced</div></div><div><div className="text-lg font-semibold text-zinc-100">{invoiceMoney(collected)}</div><div className="text-[10px] text-zinc-500">Collected</div></div><div><div className="text-lg font-semibold text-zinc-100">{invoiceMoney(outstanding)}</div><div className="text-[10px] text-zinc-500">Outstanding</div></div><div><div className="text-lg font-semibold text-zinc-100">{overdueInvoices.length} overdue · {collectionRate==null?'—':collectionRate+'%'} collected</div><div className="text-[10px] text-zinc-500">Collection state</div></div></div><Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => setActiveNav('invoices')}>Open Invoices</Button></Card></div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><Card padding="lg"><div className="flex items-center gap-2"><Plug className="h-4 w-4 text-zinc-500" /><h3 className="text-sm font-semibold text-zinc-100">Connected Ecosystem</h3></div><div className="mt-4 space-y-3"><div className="flex justify-between text-xs text-zinc-300"><span>Connected</span><b>{connected || metrics.connectedIntegrationsCount}</b></div><div className="flex justify-between text-xs text-zinc-300"><span>Needs attention</span><b>{attention.length}</b></div>{attention.slice(0,3).map(item=><div key={item.id} className="rounded-lg border border-white/[0.06] p-2 text-[10px] text-zinc-500">{item.name} · {item.status}</div>)}</div><Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => setActiveNav('integrations')}>Open Integrations</Button></Card><Card padding="lg"><div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-zinc-500" /><h3 className="text-sm font-semibold text-zinc-100">Recent Business Activity</h3></div><div className="mt-2">{activity.length ? activity.map((item,index)=><div key={index} className="flex items-start gap-3 border-b border-white/[0.06] py-3 last:border-0"><Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" /><div className="min-w-0 flex-1"><p className="text-xs text-zinc-200">{item.title}</p><p className="mt-0.5 truncate text-[10px] text-zinc-500">{item.detail}</p></div><span className="shrink-0 text-[10px] text-zinc-600">{new Date(item.time).toLocaleString()}</span></div>) : <p className="py-4 text-xs text-zinc-500">No recent activity was returned.</p>}</div></Card></div>

    <APEXReveal><Card padding="lg" className="border-white/[0.08]"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-zinc-100">Commercial Pipeline</h3><p className="mt-1 text-xs text-zinc-500">Active commercial flow from current workspace data.</p></div><Button variant="ghost" size="sm" onClick={() => setActiveNav('pipeline')}>Open Pipeline</Button></div><div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3"><div className="rounded-lg border border-white/[0.06] p-3"><div className="text-lg font-semibold text-zinc-100">{metrics.openLeadsCount}</div><div className="text-[10px] text-zinc-500">Open leads</div></div><div className="rounded-lg border border-white/[0.06] p-3"><div className="text-lg font-semibold text-zinc-100">{formatMoney(metrics.activePipelineValue,currency)}</div><div className="text-[10px] text-zinc-500">Active pipeline</div></div><div className="rounded-lg border border-white/[0.06] p-3"><div className="text-lg font-semibold text-zinc-100">{formatMoney(metrics.wonValueThisMonth,currency)}</div><div className="text-[10px] text-zinc-500">Won this billing cycle</div></div></div></Card></APEXReveal>
  </div>;
};
