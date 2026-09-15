import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  Building,
  ArrowRight,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Lead } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const LeadsView: React.FC = () => {
  const { addToast, triggerRefresh, refreshKey, setActiveNav } = useApp();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // New lead form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formSource, setFormSource] = useState<'website_form' | 'google_ads' | 'meta_ads' | 'whatsapp' | 'referral'>('website_form');
  const [formValue, setFormValue] = useState('20000');
  const [formNotes, setFormNotes] = useState('');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.getLeads();
      setLeads(res);
    } catch (err) {
      console.error('Failed fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [refreshKey]);

  const handleCreateLead = async () => {
    if (!formName) return;
    try {
      setActionInProgress('create');
      const newLead = await api.createLead({
        name: formName,
        email: formEmail,
        phone: formPhone,
        company: formCompany,
        source: formSource,
        estimatedValue: Number(formValue) || 15000,
        notes: formNotes,
      });
      addToast({
        type: 'success',
        title: 'Lead Created',
        description: `${newLead.name} (${newLead.company}) added to active triage.`,
      });
      setIsCreateOpen(false);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormCompany('');
      await fetchLeads();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed creating lead',
        description: (err as Error).message,
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleQualify = async (leadId: string, leadName: string) => {
    try {
      setActionInProgress(leadId);
      await api.qualifyLead(leadId);
      addToast({
        type: 'success',
        title: 'Lead Qualified',
        description: `${leadName} qualified with high deal velocity.`,
      });
      await fetchLeads();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Qualification failed',
        description: (err as Error).message,
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleConvert = async (leadId: string, leadName: string) => {
    try {
      setActionInProgress(leadId);
      await api.convertLead(leadId);
      addToast({
        type: 'success',
        title: 'Lead Converted to Customer',
        description: `${leadName} converted to active account in customer directory.`,
      });
      await fetchLeads();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Conversion failed',
        description: (err as Error).message,
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = filteredLeads.reduce((acc, l) => acc + l.estimatedValue, 0);
  const highRiskCount = filteredLeads.filter(l => l.leakRisk === 'high').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-serif-display font-bold text-zinc-100">
              CRM & Qualified Leads
            </h2>
            <Badge variant="gold" size="sm">
              {leads.length} Tracked
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Autonomous qualification scoring, inbound attribution, and real-time response decay alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Inbound Lead
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" padding="sm">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Total Inbound Value
          </span>
          <div className="text-xl font-serif-display font-bold text-zinc-100 mt-1">
            ${totalValue.toLocaleString()}
          </div>
        </Card>

        <Card variant="gold-accent" padding="sm">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            High Leak Risk Leads
          </span>
          <div className="text-xl font-serif-display font-bold text-rose-300 mt-1 flex items-center gap-2">
            <span>{highRiskCount}</span>
            <span className="text-xs font-sans text-rose-400 font-normal">Requires SLA intervention</span>
          </div>
        </Card>

        <Card variant="default" padding="sm">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Avg Lead Qualification Score
          </span>
          <div className="text-xl font-serif-display font-bold text-amber-300 mt-1">
            82 / 100
          </div>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#0a0a0f] border border-white/[0.08] rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by contact name, company, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0e0e16] border border-white/[0.08] rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'new', label: 'New Inbounds' },
              { value: 'contacted', label: 'Contacted' },
              { value: 'qualifying', label: 'Qualifying' },
              { value: 'qualified', label: 'Qualified' },
              { value: 'converted', label: 'Converted' },
            ]}
            className="py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Leads Table / List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No Leads Found"
          description="No inbound inquiries match the selected criteria."
          actionLabel="Create Inbound Lead"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredLeads.map(lead => {
            const isHighRisk = lead.leakRisk === 'high';

            return (
              <Card
                key={lead.id}
                variant={isHighRisk ? 'gold-accent' : 'default'}
                padding="md"
                className="hover:border-white/[0.16] transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Contact Info */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-zinc-100">{lead.name}</h4>
                      <span className="text-xs text-zinc-400 font-medium">({lead.company})</span>

                      <Badge
                        variant={
                          lead.status === 'qualified'
                            ? 'emerald'
                            : lead.status === 'converted'
                            ? 'gold'
                            : lead.status === 'new'
                            ? 'amber'
                            : 'slate'
                        }
                        size="sm"
                      >
                        {lead.status.toUpperCase()}
                      </Badge>

                      {isHighRisk && (
                        <Badge variant="rose" size="sm">
                          <AlertTriangle className="w-3 h-3" /> SLA DECAY RISK
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" /> {lead.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-500" /> {lead.phone}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                        Source: {lead.source.replace('_', ' ')}
                      </span>
                    </div>

                    {lead.leakReason && (
                      <p className="text-xs text-amber-400/90 font-mono pt-1">
                        Anomaly Reason: {lead.leakReason}
                      </p>
                    )}
                  </div>

                  {/* Value & Score */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-zinc-500">Estimated Value</div>
                      <div className="text-base font-mono font-bold text-amber-300">
                        ${lead.estimatedValue.toLocaleString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-zinc-500">Score</div>
                      <div className="text-sm font-mono font-semibold text-zinc-200">
                        {lead.score} / 100
                      </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="flex items-center gap-2">
                      {lead.status !== 'qualified' && lead.status !== 'converted' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          isLoading={actionInProgress === lead.id}
                          onClick={() => handleQualify(lead.id, lead.name)}
                        >
                          Qualify
                        </Button>
                      )}

                      {lead.status === 'qualified' && (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={actionInProgress === lead.id}
                          onClick={() => handleConvert(lead.id, lead.name)}
                          leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                        >
                          Convert to Customer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Lead Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Inbound Lead"
        subtitle="Record prospective buyer specs to initiate qualification and autonomous routing."
      >
        <div className="space-y-4">
          <Input
            label="Full Contact Name"
            placeholder="e.g. Jessica Chen"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Work Email"
              type="email"
              placeholder="jessica@client.com"
              value={formEmail}
              onChange={e => setFormEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 982-1200"
              value={formPhone}
              onChange={e => setFormPhone(e.target.value)}
            />
          </div>

          <Input
            label="Company / Organization"
            placeholder="e.g. Global Freight Dynamics Inc"
            value={formCompany}
            onChange={e => setFormCompany(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Acquisition Channel"
              value={formSource}
              onChange={e => setFormSource(e.target.value as any)}
              options={[
                { value: 'website_form', label: 'Website Inbound Form' },
                { value: 'google_ads', label: 'Google Search Ads' },
                { value: 'meta_ads', label: 'Meta B2B Ads' },
                { value: 'whatsapp', label: 'WhatsApp Inbound' },
                { value: 'referral', label: 'Partner Referral' },
              ]}
            />
            <Input
              label="Estimated Deal Value (USD)"
              type="number"
              value={formValue}
              onChange={e => setFormValue(e.target.value)}
            />
          </div>

          <Input
            label="Initial Inbound Notes"
            placeholder="Operational requirements, cargo volume, SLA specifics..."
            value={formNotes}
            onChange={e => setFormNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button variant="secondary" size="md" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={actionInProgress === 'create'}
              onClick={handleCreateLead}
            >
              Save & Route Lead
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
