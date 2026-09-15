import React, { useState, useEffect } from 'react';
import { X, Bell, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { AutonomousAlert } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AnimatedList } from '../apex3x/adapters/AnimatedList';

export const NotificationDrawer: React.FC = () => {
  const { notificationDrawerOpen, setNotificationDrawerOpen, addToast, triggerRefresh, refreshKey, setActiveNav } = useApp();
  const [alerts, setAlerts] = useState<AutonomousAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try { setLoading(true); setAlerts(await api.getBrainAlerts()); }
    catch (err) { console.error('Failed fetching alerts:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (notificationDrawerOpen) fetchAlerts(); }, [notificationDrawerOpen, refreshKey]);
  if (!notificationDrawerOpen) return null;

  const handleExecute = async (alertId: string) => {
    try { setExecutingId(alertId); const res = await api.executeBrainAction(alertId); addToast({ type: 'success', title: 'Autonomous Action Executed', description: res.message }); await fetchAlerts(); triggerRefresh(); }
    catch (err) { addToast({ type: 'error', title: 'Execution Failed', description: (err as Error).message }); }
    finally { setExecutingId(null); }
  };

  const pendingAlerts = alerts.filter(a => a.executionStatus === 'pending_approval');
  const executedAlerts = alerts.filter(a => a.executionStatus === 'executed');

  return <div className="fixed inset-0 z-50 overflow-hidden"><div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setNotificationDrawerOpen(false)} /><div className="fixed inset-y-0 right-0 max-w-full flex pl-10"><div className="w-screen max-w-md bg-[#0b0b10] border-l border-white/[0.1] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
    <div className="p-6 border-b border-white/[0.08] bg-[#09090d] flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20"><Bell className="w-4 h-4" /></span><div><h3 className="text-base font-serif-display font-semibold text-zinc-100">Autonomous Decision Feed</h3><p className="text-xs text-zinc-400">{pendingAlerts.length} pending revenue interventions</p></div></div><button onClick={() => setNotificationDrawerOpen(false)} className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-white/[0.05]"><X className="w-4 h-4" /></button></div>
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">Action Required (Pending Execution)</span>{loading ? <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0e0e15] text-center text-xs text-zinc-500">Loading decisions…</div> : pendingAlerts.length === 0 ? <div className="p-5 rounded-xl border border-white/[0.06] bg-[#0e0e15] text-center text-xs text-zinc-400"><CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />No pending autonomous decisions.</div> : <AnimatedList className="space-y-3">{pendingAlerts.map(alert => <div key={alert.id} className="p-4 rounded-xl bg-[#0e0e15] border border-amber-500/30 space-y-3"><div className="flex items-start justify-between"><Badge variant="rose" size="sm"><AlertTriangle className="w-3 h-3" /> Revenue Risk</Badge><span className="text-xs font-mono font-semibold text-amber-400">${alert.revenueAtRisk.toLocaleString()} at risk</span></div><div><h4 className="text-xs font-semibold text-zinc-100">{alert.headline}</h4><p className="text-xs text-zinc-400 mt-1 leading-relaxed">{alert.detectedIssue}</p></div><div className="p-2.5 rounded-lg bg-[#08080c] border border-white/[0.05] text-[11px] text-zinc-300"><span className="text-amber-400 font-medium">Prescribed Action: </span>{alert.recommendedAction}</div><div className="flex items-center justify-end gap-2 pt-1"><Button variant="primary" size="sm" isLoading={executingId === alert.id} onClick={() => handleExecute(alert.id)}>Execute Decision</Button></div></div>)}</AnimatedList>}</div>
      {executedAlerts.length > 0 && <div><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">Recently Executed Interventions</span><AnimatedList className="space-y-2">{executedAlerts.map(alert => <div key={alert.id} className="p-3.5 rounded-xl bg-[#08080c] border border-white/[0.06] flex items-center justify-between"><div className="space-y-0.5"><div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs font-medium text-zinc-300">{alert.headline}</span></div><p className="text-[11px] text-zinc-500 font-mono">Protected ${alert.revenueAtRisk.toLocaleString()}</p></div><Badge variant="emerald" size="sm">Executed</Badge></div>)}</AnimatedList></div>}
    </div>
    <div className="p-4 bg-[#08080c] border-t border-white/[0.08] flex items-center justify-between"><button onClick={() => { setNotificationDrawerOpen(false); setActiveNav('brain'); }} className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5">Open Autonomous Brain Analysis <ArrowRight className="w-3.5 h-3.5" /></button></div>
  </div></div></div>;
};
