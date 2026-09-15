import React, { useState, useEffect } from 'react';
import { Zap, Play, CheckCircle2, AlertTriangle, Clock, RefreshCw, Power } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { WorkflowRule, WorkflowExecutionLog } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Tabs } from '../components/ui/Tabs';

export const WorkflowsView: React.FC = () => {
  const { addToast, triggerRefresh, refreshKey } = useApp();
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [logs, setLogs] = useState<WorkflowExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rules' | 'logs'>('rules');
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wfRes, logsRes] = await Promise.all([api.getWorkflows(), api.getWorkflowLogs()]);
      setWorkflows(wfRes);
      setLogs(logsRes);
    } catch (err) {
      console.error('Failed fetching workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleToggle = async (id: string, title: string) => {
    try {
      const updated = await api.toggleWorkflow(id);
      addToast({
        type: 'info',
        title: updated.isActive ? 'Workflow Activated' : 'Workflow Paused',
        description: `"${title}" status updated.`,
      });
      await fetchData();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Toggle failed',
        description: (err as Error).message,
      });
    }
  };

  const handleTestRun = async (id: string, title: string) => {
    try {
      setTestingId(id);
      const res = await api.testWorkflow(id);
      addToast({
        type: 'success',
        title: 'Workflow Simulation Succeeded',
        description: res.message,
      });
      await fetchData();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Test failed',
        description: (err as Error).message,
      });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-serif-display font-bold text-zinc-100">
              Workflows & Autonomous Rules
            </h2>
            <Badge variant="gold" size="sm">
              {workflows.filter(w => w.isActive).length} Active Rules
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Event-driven business triggers connecting lead decay, payment collection, and calendar notifications.
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'rules', label: 'Autonomous Rules', count: workflows.length },
          { id: 'logs', label: 'Execution Audit Logs', count: logs.length },
        ]}
        activeTab={activeTab}
        onChange={id => setActiveTab(id as any)}
      />

      {activeTab === 'rules' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : (
            workflows.map(wf => (
              <Card
                key={wf.id}
                variant="default"
                padding="lg"
                className="space-y-3 hover:border-white/[0.14] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-semibold text-zinc-100">{wf.title}</h3>
                      <Badge variant={wf.isActive ? 'emerald' : 'slate'} size="sm">
                        {wf.isActive ? 'ACTIVE' : 'PAUSED'}
                      </Badge>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                        Trigger: {wf.triggerEvent}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Condition: {wf.conditionSummary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      isLoading={testingId === wf.id}
                      onClick={() => handleTestRun(wf.id, wf.title)}
                      leftIcon={<Play className="w-3 h-3 text-amber-400" />}
                    >
                      Test Run
                    </Button>
                    <Button
                      variant={wf.isActive ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggle(wf.id, wf.title)}
                    >
                      {wf.isActive ? 'Pause' : 'Activate'}
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#08080c] border border-white/[0.05] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-amber-400 font-medium">Action: </span>
                    <span className="text-zinc-300">{wf.actionSummary}</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {wf.totalExecutions} runs &middot; {wf.successRate}% success
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="divide-y divide-white/[0.06]">
            {logs.map(log => (
              <div key={log.id} className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="emerald" size="sm">
                      <CheckCircle2 className="w-3 h-3" /> SUCCESS
                    </Badge>
                    <span className="text-xs font-semibold text-zinc-200">{log.triggerEvent}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{log.details}</p>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {new Date(log.executedAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
