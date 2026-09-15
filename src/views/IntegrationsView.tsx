import React, { useState, useEffect } from 'react';
import { Plug, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, ShieldCheck, Key, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { IntegrationConnection } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

export const IntegrationsView: React.FC = () => {
  const { addToast, triggerRefresh, refreshKey } = useApp();
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [activeConfigureModal, setActiveConfigureModal] = useState<IntegrationConnection | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountId, setAccountId] = useState('');

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await api.getIntegrations();
      setIntegrations(res);
    } catch (err) {
      console.error('Failed fetching integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [refreshKey]);

  const handleToggle = async (item: IntegrationConnection) => {
    if (item.status === 'connected') {
      try {
        setSyncingProvider(item.provider);
        await api.disconnectIntegration(item.provider);
        addToast({
          type: 'info',
          title: `${item.name} Disconnected`,
          description: 'Provider synchronization paused.',
        });
        await fetchIntegrations();
        triggerRefresh();
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Disconnection failed',
          description: (err as Error).message,
        });
      } finally {
        setSyncingProvider(null);
      }
    } else {
      setActiveConfigureModal(item);
      setAccountName(`APEX Primary Account (${item.name})`);
      setAccountId(`act_${item.provider}_${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const handleConnectConfirm = async () => {
    if (!activeConfigureModal) return;
    try {
      setSyncingProvider(activeConfigureModal.provider);
      await api.connectIntegration(activeConfigureModal.provider, {
        accountName,
        accountId,
      });
      addToast({
        type: 'success',
        title: `${activeConfigureModal.name} Authenticated`,
        description: 'Capability permissions granted and ready for autonomous dispatch.',
      });
      setActiveConfigureModal(null);
      await fetchIntegrations();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Connection failed',
        description: (err as Error).message,
      });
    } finally {
      setSyncingProvider(null);
    }
  };

  const handleSync = async (item: IntegrationConnection) => {
    try {
      setSyncingProvider(item.provider);
      await api.syncIntegration(item.provider);
      addToast({
        type: 'success',
        title: `${item.name} Synchronized`,
        description: 'Latest operational telemetry and webhook states verified.',
      });
      await fetchIntegrations();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Sync failed',
        description: (err as Error).message,
      });
    } finally {
      setSyncingProvider(null);
    }
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-serif-display font-bold text-zinc-100">
              Integrations Ecosystem & + Connect Hub
            </h2>
            <Badge variant="gold" size="sm">
              {connectedCount} of {integrations.length} Active
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Capability-bearing connections for advertising, omnichannel communications, payments, and reputation.
          </p>
        </div>
      </div>

      {/* Grid of integrations */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map(item => {
            const isConn = item.status === 'connected';
            const isOperating = syncingProvider === item.provider;

            return (
              <Card
                key={item.id}
                variant={isConn ? 'default' : 'sunken'}
                padding="lg"
                className={`space-y-4 transition-all flex flex-col justify-between ${
                  isConn ? 'border-amber-500/20' : 'border-white/[0.06]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-100">{item.name}</h3>
                        {isConn ? (
                          <Badge variant="emerald" size="sm">
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="slate" size="sm">
                            Disconnected
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                        Category: {item.category}
                      </span>
                    </div>

                    <span className="p-2 rounded-lg bg-[#14141e] border border-white/[0.08] text-amber-400">
                      <Plug className="w-4 h-4" />
                    </span>
                  </div>

                  {item.connectedAccountName ? (
                    <div className="p-2.5 rounded-lg bg-[#08080c] border border-white/[0.05] space-y-0.5 text-xs">
                      <div className="text-[11px] font-medium text-zinc-300 truncate">
                        Account: {item.connectedAccountName}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 truncate">
                        ID: {item.connectedAccountId}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-[#08080c] border border-white/[0.04] text-[11px] text-zinc-500">
                      Not authenticated. Connect to enable automated capability routing.
                    </div>
                  )}

                  {/* Capabilities */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-zinc-400">Capabilities:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.capabilities.map((cap, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.05]"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {item.lastSyncedAt
                      ? `Synced ${new Date(item.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'No sync'}
                  </span>

                  <div className="flex items-center gap-2">
                    {isConn && (
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={isOperating}
                        onClick={() => handleSync(item)}
                        title="Sync now"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant={isConn ? 'outline' : 'primary'}
                      size="sm"
                      isLoading={isOperating}
                      onClick={() => handleToggle(item)}
                    >
                      {isConn ? 'Disconnect' : '+ Connect'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Connection Modal */}
      {activeConfigureModal && (
        <Modal
          isOpen={!!activeConfigureModal}
          onClose={() => setActiveConfigureModal(null)}
          title={`+ Connect ${activeConfigureModal.name}`}
          subtitle={`Authenticate ${activeConfigureModal.name} to allow APEX3X autonomous dispatch.`}
        >
          <div className="space-y-4">
            <Input
              label="Account Identity / Display Name"
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
              placeholder="e.g. APEX Logistics Official"
              required
            />

            <Input
              label="Provider Account ID / Handle"
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              placeholder="e.g. act_19828401"
              required
            />

            <div className="p-3.5 rounded-lg bg-[#08080c] border border-amber-500/20 text-xs text-zinc-300 space-y-1">
              <span className="text-amber-400 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Scope & Capability Consent
              </span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                APEX3X will request capability permissions for: {activeConfigureModal.capabilities.join(', ')}.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <Button variant="secondary" size="md" onClick={() => setActiveConfigureModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleConnectConfirm}>
                Authenticate & Connect
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
