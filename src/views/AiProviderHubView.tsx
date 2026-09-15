import React, { useState, useEffect } from 'react';
import { Bot, Key, CheckCircle2, AlertTriangle, Sparkles, Shield, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { AIProviderConfig } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';

export const AiProviderHubView: React.FC = () => {
  const { addToast, triggerRefresh, refreshKey } = useApp();
  const [configs, setConfigs] = useState<AIProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<AIProviderConfig | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [modelInput, setModelInput] = useState('');

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await api.getAiProviders();
      setConfigs(res);
    } catch (err) {
      console.error('Failed fetching AI providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [refreshKey]);

  const handleTest = async (config: AIProviderConfig) => {
    try {
      setTestingId(config.id);
      const res = await api.testAiProvider(config.provider);
      addToast({
        type: 'success',
        title: `${config.name} Latency Check`,
        description: res.message,
      });
      await fetchConfigs();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Validation Failed',
        description: (err as Error).message,
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleSaveConfig = async () => {
    if (!editConfig) return;
    try {
      await api.configureAiProvider(editConfig.provider, {
        apiKey: keyInput || undefined,
        modelSelected: modelInput || editConfig.modelSelected,
      });
      addToast({
        type: 'success',
        title: 'Provider Config Saved',
        description: `${editConfig.name} settings updated.`,
      });
      setEditConfig(null);
      setKeyInput('');
      await fetchConfigs();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save failed',
        description: (err as Error).message,
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-serif-display font-bold text-zinc-100">
              BYOK AI Provider Hub
            </h2>
            <Badge variant="gold" size="sm">
              Multi-Model Mesh
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure private enterprise API keys for Google Gemini, OpenAI, Anthropic, or custom inference endpoints.
          </p>
        </div>
      </div>

      {/* Security Note */}
      <div className="p-4 rounded-xl bg-[#09090e] border border-amber-500/20 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-zinc-200">
            Enterprise BYOK (Bring Your Own Key) Isolation
          </p>
          <p className="text-zinc-400 leading-relaxed">
            API keys are encrypted in-memory and injected strictly into server-side inference calls. Prompts never leave your isolated tenant workspace context.
          </p>
        </div>
      </div>

      {/* Providers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configs.map(config => {
            const isConn = config.status === 'connected';

            return (
              <Card
                key={config.id}
                variant={isConn ? 'gold-accent' : 'default'}
                padding="lg"
                className="space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-100">{config.name}</h3>
                        {config.provider === 'gemini' && (
                          <Badge variant="gold" size="sm">
                            CORE ENGINE
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">
                        Model: {config.modelSelected}
                      </span>
                    </div>

                    <Badge variant={isConn ? 'emerald' : 'slate'} size="sm">
                      {config.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#07070a] border border-white/[0.05] flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>API Key:</span>
                    <span className="text-zinc-300">
                      {config.maskedKey || (config.provider === 'gemini' ? 'Configured via GEMINI_API_KEY' : 'Not Configured')}
                    </span>
                  </div>

                  {config.latencyMs && (
                    <div className="text-[11px] text-zinc-500 font-mono">
                      Last tested latency: <span className="text-emerald-400">{config.latencyMs}ms</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    isLoading={testingId === config.id}
                    onClick={() => handleTest(config)}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Test Latency
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditConfig(config);
                      setKeyInput('');
                      setModelInput(config.modelSelected);
                    }}
                  >
                    Configure
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Config Modal */}
      {editConfig && (
        <Modal
          isOpen={!!editConfig}
          onClose={() => setEditConfig(null)}
          title={`Configure ${editConfig.name}`}
          subtitle="Update target model parameters and private credentials."
        >
          <div className="space-y-4">
            <Input
              label="Selected Model Name"
              value={modelInput}
              onChange={e => setModelInput(e.target.value)}
              placeholder="e.g. gemini-2.5-flash or gpt-4o"
            />

            <Input
              label="Private API Secret Key (BYOK)"
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="Enter new key to replace existing..."
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <Button variant="secondary" size="md" onClick={() => setEditConfig(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleSaveConfig}>
                Save Provider Settings
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
