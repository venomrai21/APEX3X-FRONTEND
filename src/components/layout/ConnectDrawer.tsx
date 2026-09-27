import React, { useState, useEffect } from 'react';
import { X, Plug, CheckCircle2, RefreshCw, ChevronRight, Shield, Sparkles, Globe2, Webhook, KeyRound, Server } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { IntegrationConnection, AIProviderConfig } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { UniversalConnector, UniversalConnectionDraft } from '../integrations/UniversalConnector';

export const ConnectDrawer: React.FC = () => {
  const { connectDrawerOpen, setConnectDrawerOpen, addToast, triggerRefresh, refreshKey, setActiveNav } = useApp();
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
  const [aiProviders, setAiProviders] = useState<AIProviderConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [universalOpen, setUniversalOpen] = useState(false);

  const fetchConnections = async () => { try { setLoading(true); const [intRes, aiRes] = await Promise.all([api.getIntegrations(), api.getAiProviders()]); setIntegrations(intRes); setAiProviders(aiRes); } catch (err) { console.error('Error fetching connect ecosystem:', err); } finally { setLoading(false); } };
  useEffect(() => { if (connectDrawerOpen) fetchConnections(); }, [connectDrawerOpen, refreshKey]);
  if (!connectDrawerOpen) return null;

  const handleUniversalSubmit = async (draft: UniversalConnectionDraft) => {
    try {
      await api.connectUniversalIntegration(draft);
      setUniversalOpen(false);
      addToast({ type: 'success', title: `${draft.name} Connection Accepted`, description: 'Connection completed.' });
      await fetchConnections();
      triggerRefresh();
    } catch (err) {
      addToast({ type: 'error', title: 'Connection not completed', description: (err as Error).message });
    }
  };

  const handleToggleConnection = async (item: IntegrationConnection) => {
    try { setConnectingProvider(item.provider); if (item.status === 'connected') { await api.disconnectIntegration(item.provider); addToast({ type: 'info', title: `${item.name} Disconnected`, description: 'Sync paused.' }); } else { setUniversalOpen(true); return; } await fetchConnections(); triggerRefresh(); }
    catch (err) { addToast({ type: 'error', title: 'Connection Failed', description: (err as Error).message }); } finally { setConnectingProvider(null); }
  };
  const handleSync = async (provider: string, name: string) => { try { setConnectingProvider(provider); await api.syncIntegration(provider); addToast({ type: 'success', title: `${name} Synchronized`, description: 'Synchronization completed.' }); await fetchConnections(); triggerRefresh(); } catch (err) { addToast({ type: 'error', title: 'Sync Failed', description: (err as Error).message }); } finally { setConnectingProvider(null); } };

  return <>
    <div className="fixed inset-0 z-50 overflow-hidden"><div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConnectDrawerOpen(false)} /><div className="fixed inset-y-0 right-0 max-w-full flex pl-10"><div className="w-screen max-w-md bg-[#0b0b10] border-l border-white/[0.1] shadow-2xl flex flex-col">
      <div className="p-6 border-b border-white/[0.08] bg-[#09090d] flex items-center justify-between"><div><div className="flex items-center gap-2"><span className="p-1 rounded bg-white/10 text-zinc-200 border border-white/20"><Plug className="w-4 h-4" /></span><h3 className="text-base font-serif-display font-semibold text-zinc-100">+ Connect Ecosystem</h3></div><p className="text-xs text-zinc-400 mt-1">Connect the tools and services your business already uses.</p></div><button onClick={() => setConnectDrawerOpen(false)} className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-white/[0.05]"><X className="w-4 h-4" /></button></div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <button type="button" onClick={() => setUniversalOpen(true)} className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-white/12 to-transparent border border-white/25 hover:border-zinc-200/45 transition-all group"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-semibold text-zinc-100"><Globe2 className="w-4 h-4 text-zinc-200" /> Connect</div><p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">Connect a common service or add one of your business systems.</p></div><ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-200 mt-1" /></div><div className="flex flex-wrap gap-1.5 mt-3"></div></button>
        <div><div className="flex items-center justify-between mb-3"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-zinc-200" /> AI Provider Connections</span><button onClick={() => { setConnectDrawerOpen(false); setActiveNav('ai_hub'); }} className="text-xs text-zinc-200 hover:text-zinc-300 flex items-center gap-1">Manage <ChevronRight className="w-3 h-3" /></button></div>{loading ? <p className="text-xs text-zinc-500">Loading provider connections…</p> : aiProviders.length === 0 ? <p className="text-xs text-zinc-500">No AI provider connections configured.</p> : <div className="space-y-2">{aiProviders.map(ai => <div key={ai.id} className="p-3.5 rounded-xl bg-[#0e0e15] border border-white/[0.08] flex items-center justify-between"><div><div className="flex items-center gap-2"><span className="text-xs font-semibold text-zinc-200">{ai.name}</span><Badge variant={ai.status === 'connected' ? 'emerald' : 'slate'} size="sm">{ai.status === 'connected' ? <><CheckCircle2 className="w-3 h-3" /> Connected</> : 'Not Configured'}</Badge></div><p className="text-[11px] text-zinc-400 mt-0.5 font-mono">{ai.modelSelected || 'Model not selected'}</p></div><Button variant="outline" size="sm" onClick={() => { setConnectDrawerOpen(false); setActiveNav('ai_hub'); }}>Configure</Button></div>)}</div>}</div>
        <div><div className="flex items-center justify-between mb-3"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-zinc-200" /> Connected Services</span><span className="text-[11px] text-zinc-500">{integrations.filter(i => i.status === 'connected').length}/{integrations.length} Connected</span></div>{loading ? <p className="text-xs text-zinc-500">Loading integrations…</p> : integrations.length === 0 ? <p className="text-xs text-zinc-500">No integration records available.</p> : <div className="space-y-3">{integrations.map(item => { const isConn = item.status === 'connected'; const isOperating = connectingProvider === item.provider; return <div key={item.id} className={`p-4 rounded-xl bg-[#0e0e15] border ${isConn ? 'border-white/20' : 'border-white/[0.08]'} space-y-3`}><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><span className="text-sm font-semibold text-zinc-100">{item.name}</span><Badge variant={isConn ? 'emerald' : 'slate'} size="sm">{isConn ? 'Connected' : item.status === 'pending' ? 'Pending' : 'Disconnected'}</Badge></div><p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">{item.category}{item.connectionMethod ? ` · ${item.connectionMethod}` : ''}</p>{item.connectedAccountName && <p className="text-[11px] text-zinc-400 font-mono mt-1">{item.connectedAccountName}</p>}</div></div><div className="flex flex-wrap gap-1.5">{item.capabilities.map((cap, idx) => <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.05]">{cap}</span>)}</div><div className="flex items-center justify-between pt-2 border-t border-white/[0.05]"><span className="text-[10px] text-zinc-500">{item.lastSyncedAt ? `Synced ${new Date(item.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No sync recorded'}</span><div className="flex items-center gap-2">{isConn && <Button variant="ghost" size="sm" isLoading={isOperating} onClick={() => handleSync(item.provider, item.name)}><RefreshCw className="w-3.5 h-3.5" /></Button>}<Button variant={isConn ? 'outline' : 'primary'} size="sm" isLoading={isOperating} onClick={() => handleToggleConnection(item)}>{isConn ? 'Disconnect' : '+ Connect'}</Button></div></div></div>; })}</div>}</div>
      </div>
      <div className="p-4 bg-[#08080c] border-t border-white/[0.08] text-[11px] text-zinc-400 text-center">Your connection details are handled securely.</div>
    </div></div></div>
    <UniversalConnector open={universalOpen} onClose={() => setUniversalOpen(false)} onSubmit={handleUniversalSubmit} />
  </>;
};
