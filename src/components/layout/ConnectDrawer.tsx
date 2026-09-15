import React, { useState, useEffect } from 'react';
import { X, Plug, CheckCircle2, AlertTriangle, RefreshCw, ChevronRight, Shield, Zap, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { IntegrationConnection, AIProviderConfig } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const ConnectDrawer: React.FC = () => {
  const { connectDrawerOpen, setConnectDrawerOpen, addToast, triggerRefresh, refreshKey, setActiveNav } = useApp();
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
  const [aiProviders, setAiProviders] = useState<AIProviderConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const [intRes, aiRes] = await Promise.all([api.getIntegrations(), api.getAiProviders()]);
      setIntegrations(intRes);
      setAiProviders(aiRes);
    } catch (err) {
      console.error('Error fetching connect ecosystem:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connectDrawerOpen) {
      fetchConnections();
    }
  }, [connectDrawerOpen, refreshKey]);

  if (!connectDrawerOpen) return null;

  const handleToggleConnection = async (item: IntegrationConnection) => {
    try {
      setConnectingProvider(item.provider);
      if (item.status === 'connected') {
        await api.disconnectIntegration(item.provider);
        addToast({
          type: 'info',
          title: `${item.name} Disconnected`,
          description: 'Provider synchronization paused.',
        });
      } else {
        await api.connectIntegration(item.provider, {
          accountName: `APEX Verified Account (${item.name})`,
        });
        addToast({
          type: 'success',
          title: `${item.name} Connected`,
          description: 'Authenticated and capability-ready.',
        });
      }
      await fetchConnections();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Connection Failed',
        description: (err as Error).message,
      });
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleSync = async (provider: string, name: string) => {
    try {
      setConnectingProvider(provider);
      await api.syncIntegration(provider);
      addToast({
        type: 'success',
        title: `${name} Synchronized`,
        description: 'Latest telemetry and conversion data updated.',
      });
      await fetchConnections();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Sync Failed',
        description: (err as Error).message,
      });
    } finally {
      setConnectingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setConnectDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0b0b10] border-l border-white/[0.1] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] bg-[#09090d] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Plug className="w-4 h-4" />
                </span>
                <h3 className="text-base font-serif-display font-semibold text-zinc-100">
                  + Connect Ecosystem
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Authenticate channels & BYOK AI models to empower APEX3X autonomous operations.
              </p>
            </div>
            <button
              onClick={() => setConnectDrawerOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* AI Providers BYOK section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Provider Hub (BYOK)
                </span>
                <button
                  onClick={() => {
                    setConnectDrawerOpen(false);
                    setActiveNav('ai_hub');
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-medium cursor-pointer"
                >
                  Manage Keys <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {aiProviders.map(ai => (
                  <div
                    key={ai.id}
                    className="p-3.5 rounded-xl bg-[#0e0e15] border border-white/[0.08] flex items-center justify-between hover:border-white/[0.14] transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-200">{ai.name}</span>
                        {ai.status === 'connected' ? (
                          <Badge variant="emerald" size="sm">
                            <CheckCircle2 className="w-3 h-3" /> Active Engine
                          </Badge>
                        ) : (
                          <Badge variant="slate" size="sm">
                            BYOK Available
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                        Model: {ai.modelSelected} {ai.latencyMs ? `(${ai.latencyMs}ms)` : ''}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setConnectDrawerOpen(false);
                        setActiveNav('ai_hub');
                      }}
                    >
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Channels Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" /> Operational Channels
                </span>
                <span className="text-[11px] text-zinc-500">
                  {integrations.filter(i => i.status === 'connected').length}/{integrations.length} Active
                </span>
              </div>

              <div className="space-y-3">
                {integrations.map(item => {
                  const isConn = item.status === 'connected';
                  const isOperating = connectingProvider === item.provider;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl bg-[#0e0e15] border ${
                        isConn ? 'border-amber-500/20' : 'border-white/[0.08]'
                      } space-y-3 transition-all`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-zinc-100">{item.name}</span>
                            {isConn ? (
                              <Badge variant="emerald" size="sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                              </Badge>
                            ) : (
                              <Badge variant="slate" size="sm">
                                Disconnected
                              </Badge>
                            )}
                          </div>
                          {item.connectedAccountName && (
                            <p className="text-[11px] text-zinc-400 font-mono mt-1">
                              {item.connectedAccountName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Capabilities pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.capabilities.map((cap, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.05]"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                        <span className="text-[10px] text-zinc-500">
                          {item.lastSyncedAt
                            ? `Synced ${new Date(item.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : 'No sync recorded'}
                        </span>
                        <div className="flex items-center gap-2">
                          {isConn && (
                            <Button
                              variant="ghost"
                              size="sm"
                              isLoading={isOperating}
                              onClick={() => handleSync(item.provider, item.name)}
                              title="Sync latest records"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant={isConn ? 'outline' : 'primary'}
                            size="sm"
                            isLoading={isOperating}
                            onClick={() => handleToggleConnection(item)}
                          >
                            {isConn ? 'Disconnect' : '+ Connect'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-4 bg-[#08080c] border-t border-white/[0.08] text-[11px] text-zinc-400 text-center">
            APEX3X enforces end-to-end workspace data isolation. Credentials remain securely encrypted.
          </div>
        </div>
      </div>
    </div>
  );
};
