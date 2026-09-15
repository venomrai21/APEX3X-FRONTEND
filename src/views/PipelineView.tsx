import React, { useState, useEffect } from 'react';
import {
  GitPullRequest,
  Plus,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { PipelineDeal } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';

const STAGES: { id: PipelineDeal['stage']; label: string }[] = [
  { id: 'discovery', label: 'Discovery' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal_sent', label: 'Proposal Sent' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'closed_won', label: 'Closed Won' },
];

export const PipelineView: React.FC = () => {
  const { addToast, triggerRefresh, refreshKey } = useApp();
  const [deals, setDeals] = useState<PipelineDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [movingDealId, setMovingDealId] = useState<string | null>(null);

  // New deal form
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [value, setValue] = useState('35000');
  const [stage, setStage] = useState<PipelineDeal['stage']>('discovery');
  const [closeDate, setCloseDate] = useState('2026-10-15');

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await api.getDeals();
      setDeals(res);
    } catch (err) {
      console.error('Failed fetching pipeline deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [refreshKey]);

  const handleCreateDeal = async () => {
    if (!title || !company) return;
    try {
      await api.createDeal({
        title,
        company,
        customerName: customerName || 'Executive Contact',
        value: Number(value) || 25000,
        stage,
        probability: stage === 'discovery' ? 30 : stage === 'qualified' ? 50 : 70,
        expectedCloseDate: closeDate,
      });
      addToast({
        type: 'success',
        title: 'Deal Created',
        description: `${title} ($${Number(value).toLocaleString()}) added to pipeline.`,
      });
      setIsCreateOpen(false);
      setTitle('');
      setCompany('');
      await fetchDeals();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Deal creation failed',
        description: (err as Error).message,
      });
    }
  };

  const handleAdvanceStage = async (dealId: string, currentStage: PipelineDeal['stage']) => {
    const stageOrder: PipelineDeal['stage'][] = ['discovery', 'qualified', 'proposal_sent', 'negotiation', 'closed_won'];
    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      try {
        setMovingDealId(dealId);
        await api.moveDealStage(dealId, nextStage);
        addToast({
          type: 'success',
          title: 'Deal Advanced',
          description: `Progressed to ${nextStage.replace('_', ' ').toUpperCase()}.`,
        });
        await fetchDeals();
        triggerRefresh();
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Update failed',
          description: (err as Error).message,
        });
      } finally {
        setMovingDealId(null);
      }
    }
  };

  const totalPipelineValue = deals
    .filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
    .reduce((acc, d) => acc + d.value, 0);

  const wonTotal = deals
    .filter(d => d.stage === 'closed_won')
    .reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-serif-display font-bold text-zinc-100">
              Sales Pipeline & Deal Velocity
            </h2>
            <Badge variant="gold" size="sm">
              ${totalPipelineValue.toLocaleString()} Active
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Contract progression tracking with weighted win probabilities and stage velocity alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Commercial Deal
          </Button>
        </div>
      </div>

      {/* Pipeline Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" padding="sm">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Total Active Deal Volume
          </span>
          <div className="text-xl font-serif-display font-bold text-zinc-100 mt-1">
            ${totalPipelineValue.toLocaleString()}
          </div>
        </Card>

        <Card variant="default" padding="sm">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Closed Won (Month to Date)
          </span>
          <div className="text-xl font-serif-display font-bold text-emerald-400 mt-1">
            ${wonTotal.toLocaleString()}
          </div>
        </Card>

        <Card variant="default" padding="sm">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Average Sales Cycle
          </span>
          <div className="text-xl font-serif-display font-bold text-amber-300 mt-1">
            18.4 Days
          </div>
        </Card>
      </div>

      {/* Kanban Board Columns */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-w-[900px] pb-4">
          {STAGES.map(st => {
            const stageDeals = deals.filter(d => d.stage === st.id);
            const stageValue = stageDeals.reduce((acc, d) => acc + d.value, 0);

            return (
              <div
                key={st.id}
                className="flex flex-col rounded-xl bg-[#09090e] border border-white/[0.07] p-3 space-y-3 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                      {st.label}
                    </h3>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      ${stageValue.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-white/[0.05] text-zinc-400">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageDeals.map(deal => (
                    <Card
                      key={deal.id}
                      variant="elevated"
                      padding="sm"
                      className="border-white/[0.09] space-y-2.5 hover:border-amber-500/40 transition-all group"
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors">
                          {deal.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400">{deal.company}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="font-mono font-bold text-amber-300">
                          ${deal.value.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {deal.probability}% win
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-white/[0.05]">
                        <span>Rep: {deal.assignedTo}</span>
                        <span>{deal.expectedCloseDate}</span>
                      </div>

                      {deal.stage !== 'closed_won' && (
                        <div className="pt-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            isLoading={movingDealId === deal.id}
                            onClick={() => handleAdvanceStage(deal.id, deal.stage)}
                            className="w-full text-[10px] py-1 justify-between"
                            rightIcon={<ChevronRight className="w-3 h-3 text-amber-400" />}
                          >
                            Advance
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="py-12 text-center text-xs text-zinc-600 font-mono">
                      Empty Stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Deal Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Commercial Deal"
        subtitle="Record pipeline contract, estimated volume, and target closing horizon."
      >
        <div className="space-y-4">
          <Input
            label="Deal Title"
            placeholder="e.g. Northeast Freight Master Haulage Contract"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company Name"
              placeholder="e.g. Cardinal Freightlines"
              value={company}
              onChange={e => setCompany(e.target.value)}
              required
            />
            <Input
              label="Primary Contact"
              placeholder="e.g. Marcus Vance"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Deal Value (USD)"
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              required
            />
            <Select
              label="Initial Stage"
              value={stage}
              onChange={e => setStage(e.target.value as any)}
              options={[
                { value: 'discovery', label: 'Discovery' },
                { value: 'qualified', label: 'Qualified' },
                { value: 'proposal_sent', label: 'Proposal Sent' },
                { value: 'negotiation', label: 'Negotiation' },
              ]}
            />
          </div>

          <Input
            label="Target Close Date"
            type="date"
            value={closeDate}
            onChange={e => setCloseDate(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button variant="secondary" size="md" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleCreateDeal}>
              Create Pipeline Deal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
