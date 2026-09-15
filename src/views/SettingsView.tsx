import React, { useState, useEffect } from 'react';
import { Building, ShieldCheck, CheckCircle2, AlertTriangle, Save, Globe, DollarSign, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Workspace } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';

export const SettingsView: React.FC = () => {
  const { addToast, triggerRefresh, refreshKey, currentWorkspace, setCurrentWorkspace } = useApp();
  const [workspace, setWorkspace] = useState<Workspace | null>(currentWorkspace);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState(currentWorkspace?.name || 'APEX3X Core Enterprises');
  const [taxId, setTaxId] = useState(currentWorkspace?.taxId || 'EIN-84-9201948');
  const [industry, setIndustry] = useState(currentWorkspace?.industry || 'Supply Chain Logistics');
  const [website, setWebsite] = useState(currentWorkspace?.website || 'https://apex3x.com');
  const [address, setAddress] = useState(currentWorkspace?.registeredAddress || '75 Rockefeller Plaza, New York, NY 10019');
  const [currency, setCurrency] = useState(currentWorkspace?.currency || 'USD');
  const [timezone, setTimezone] = useState(currentWorkspace?.timezone || 'America/New_York');

  useEffect(() => {
    if (currentWorkspace) {
      setWorkspace(currentWorkspace);
      setCompanyName(currentWorkspace.name);
      setTaxId(currentWorkspace.taxId || 'EIN-84-9201948');
      setIndustry(currentWorkspace.industry);
      setWebsite(currentWorkspace.website);
      setAddress(currentWorkspace.registeredAddress || '75 Rockefeller Plaza, New York, NY 10019');
      setCurrency(currentWorkspace.currency);
      setTimezone(currentWorkspace.timezone);
    }
  }, [currentWorkspace, refreshKey]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await api.updateWorkspace({
        name: companyName,
        taxId,
        industry,
        website,
        registeredAddress: address,
        currency,
        timezone,
      });
      setWorkspace(updated);
      setCurrentWorkspace(updated);
      addToast({
        type: 'success',
        title: 'Business Profile Updated',
        description: 'Commercial entity settings and registered operational parameters saved.',
      });
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save failed',
        description: (err as Error).message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    try {
      setVerifying(true);
      const res = await api.verifyWorkspace();
      setWorkspace(res.workspace);
      setCurrentWorkspace(res.workspace);
      addToast({
        type: 'success',
        title: 'Business Verified',
        description: 'Level 3 Corporate Verification active for high-volume WhatsApp & Stripe billing.',
      });
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Verification failed',
        description: (err as Error).message,
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-serif-display font-bold text-zinc-100">
              Business Profile & Verification
            </h2>
            <Badge
              variant={workspace?.verificationStatus === 'verified' ? 'emerald' : 'amber'}
              size="sm"
            >
              <ShieldCheck className="w-3 h-3" />{' '}
              {workspace?.verificationStatus === 'verified' ? 'VERIFIED ENTITY' : 'IN REVIEW'}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Official commercial corporate records, tax identification, and localized operating parameters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {workspace?.verificationStatus !== 'verified' && (
            <Button
              variant="secondary"
              size="md"
              isLoading={verifying}
              onClick={handleVerify}
            >
              Verify Commercial Entity
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            isLoading={saving}
            onClick={handleSave}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Verification Status Card */}
      <Card variant="gold-accent" padding="md" className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`p-2 rounded-lg border ${
            workspace?.verificationStatus === 'verified'
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-950/30 text-amber-400 border-amber-500/20'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <div className="text-xs font-semibold text-zinc-200">
              Corporate Verification: {workspace?.verificationStatus === 'verified' ? 'Level 3 Approved' : 'Submitted for Underwriting'}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Enables WhatsApp Cloud Business Tier messaging, automated Stripe ACH wires, and Google Ads programmatic management.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-zinc-500">
          DUNS: 88-294-0192
        </span>
      </Card>

      {/* Profile Form */}
      <Card variant="default" padding="lg" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Commercial Entity Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Operating Company Name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
            />

            <Input
              label="Federal Tax ID / EIN"
              value={taxId}
              onChange={e => setTaxId(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Industry Classification"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
            />

            <Input
              label="Corporate Website URL"
              value={website}
              onChange={e => setWebsite(e.target.value)}
            />
          </div>

          <Input
            label="Headquarters Postal Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-white/[0.06]">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Financial & Operational Localization
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Primary Settlement Currency"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              options={[
                { value: 'USD', label: 'USD - United States Dollar ($)' },
                { value: 'EUR', label: 'EUR - Euro (€)' },
                { value: 'GBP', label: 'GBP - British Pound (£)' },
                { value: 'SGD', label: 'SGD - Singapore Dollar (S$)' },
              ]}
            />

            <Select
              label="Operating Timezone"
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              options={[
                { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
                { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
                { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
                { value: 'Europe/London', label: 'London / GMT' },
                { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
              ]}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
