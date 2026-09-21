import React, { useEffect, useState } from 'react';
import { ShieldCheck, Building2, Globe, CheckCircle2, ArrowRight, Image } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api, UI_PREVIEW_MODE } from '../../api/client';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const OnboardingModal: React.FC = () => {
  const {
    organisation,
    updateOrganisation,
    onboardingOpen,
    setOnboardingOpen,
    currentWorkspace,
    updateWorkspaceIdentity,
    triggerRefresh,
    addToast,
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organisationName, setOrganisationName] = useState('');
  const [organisationShortName, setOrganisationShortName] = useState('');
  const [organisationLogoUrl, setOrganisationLogoUrl] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceIconUrl, setWorkspaceIconUrl] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [taxId, setTaxId] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [currency, setCurrency] = useState('');
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    if (!onboardingOpen) return;
    setStep(1);
    setOrganisationName(organisation.name || '');
    setOrganisationShortName(organisation.shortName || '');
    setOrganisationLogoUrl(organisation.logoUrl || '');
    setWorkspaceName(currentWorkspace?.name || '');
    setWorkspaceIconUrl(currentWorkspace?.iconUrl || '');
    setIndustry(currentWorkspace?.industry || '');
    setWebsite(currentWorkspace?.website || '');
    setTaxId(currentWorkspace?.taxId || '');
    setRegisteredAddress(currentWorkspace?.registeredAddress || '');
    setCurrency(currentWorkspace?.currency || '');
    setTimezone(currentWorkspace?.timezone || '');
  }, [onboardingOpen, organisation, currentWorkspace]);

  if (!onboardingOpen) return null;

  const handleCompleteVerification = async () => {
    const trimmedOrganisationName = organisationName.trim();
    const trimmedShortName = organisationShortName.trim();
    const trimmedWorkspaceName = workspaceName.trim();

    if (!trimmedOrganisationName || !trimmedWorkspaceName) {
      addToast({
        type: 'warning',
        title: 'Organisation and Workspace Required',
        description: 'Enter both an organisation name and a workspace name.',
      });
      setStep(1);
      return;
    }

    try {
      setIsSubmitting(true);

      updateOrganisation({
        name: trimmedOrganisationName,
        shortName: trimmedShortName || trimmedOrganisationName,
        logoUrl: organisationLogoUrl.trim() || undefined,
      });

      updateWorkspaceIdentity({
        name: trimmedWorkspaceName,
        slug: trimmedWorkspaceName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        iconUrl: workspaceIconUrl.trim() || undefined,
        industry,
        website,
        taxId: taxId || undefined,
        registeredAddress: registeredAddress || undefined,
        currency,
        timezone,
      });

      if (!UI_PREVIEW_MODE) {
        await api.updateWorkspace({
          name: trimmedWorkspaceName,
          industry,
          website,
          taxId,
          registeredAddress,
          currency,
          timezone,
          logoUrl: workspaceIconUrl.trim() || undefined,
        });
        await api.verifyWorkspace();
      }

      addToast({
        type: 'success',
        title: 'Business Profile Updated',
        description: 'Organisation and workspace identity have been updated.',
      });
      triggerRefresh();
      setOnboardingOpen(false);
    } catch (err) {
      addToast({ type: 'error', title: 'Profile Update Failed', description: (err as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={onboardingOpen}
      onClose={() => setOnboardingOpen(false)}
      title="Business Profile"
      subtitle="Manage your organisation identity and the workspace it operates."
      maxWidth="xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          {[['1', 'Identity'], ['2', 'Financial & Currency'], ['3', 'Compliance']].map(([number, label], index) => (
            <React.Fragment key={number}>
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= index + 1 ? 'bg-white text-black' : 'bg-white/[0.06] text-zinc-400'}`}>{number}</span>
                <span className="text-xs font-medium text-zinc-200">{label}</span>
              </div>
              {index < 2 && <div className="w-8 h-px bg-white/[0.1]" />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && <div className="space-y-5">
          <section className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">Organisation Identity</p>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">The organisation is the top-level business identity shown in the application header.</p>
            </div>
            <Input label="Organisation Name" value={organisationName} onChange={e => setOrganisationName(e.target.value)} placeholder="Organisation name" leftIcon={<Building2 className="w-4 h-4 text-zinc-500" />} />
            <Input label="Organisation Short Name" value={organisationShortName} onChange={e => setOrganisationShortName(e.target.value)} placeholder="Short display name" />
            <Input label="Organisation Logo URL" value={organisationLogoUrl} onChange={e => setOrganisationLogoUrl(e.target.value)} placeholder="Optional logo URL" leftIcon={<Image className="w-4 h-4 text-zinc-500" />} />
          </section>

          <section className="space-y-4 border-t border-white/[0.08] pt-5">
            <div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">Workspace Identity</p>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">The current workspace remains separate from the organisation and can represent the organisation's operating space.</p>
            </div>
            <Input label="Workspace Name" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} placeholder="Workspace name" leftIcon={<Building2 className="w-4 h-4 text-zinc-500" />} />
            <Input label="Workspace Icon URL" value={workspaceIconUrl} onChange={e => setWorkspaceIconUrl(e.target.value)} placeholder="Optional workspace icon URL" leftIcon={<Image className="w-4 h-4 text-zinc-500" />} />
            <Input label="Primary Website URL" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://company.com" leftIcon={<Globe className="w-4 h-4 text-zinc-500" />} />
            <Select label="Primary Industry Vertical" value={industry} onChange={e => setIndustry(e.target.value)} options={[
              { value: '', label: 'Select industry' },
              { value: 'B2B Logistics & Freight', label: 'B2B Logistics & Freight' },
              { value: 'Professional & Consulting Services', label: 'Professional & Consulting Services' },
              { value: 'B2B SaaS & Technology', label: 'B2B SaaS & Technology' },
              { value: 'Healthcare & Clinical Services', label: 'Healthcare & Clinical Services' },
              { value: 'Commercial Real Estate & Facilities', label: 'Commercial Real Estate & Facilities' },
              { value: 'Manufacturing & Distribution', label: 'Manufacturing & Distribution' },
            ]} />
          </section>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="md" onClick={() => setStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>Proceed to Financial Config</Button>
          </div>
        </div>}

        {step === 2 && <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Operating Currency" value={currency} onChange={e => setCurrency(e.target.value)} options={[
              { value: '', label: 'Select currency' }, { value: 'USD', label: 'USD ($) - US Dollar' }, { value: 'EUR', label: 'EUR (€) - Euro' }, { value: 'GBP', label: 'GBP (£) - British Pound' }, { value: 'CAD', label: 'CAD ($) - Canadian Dollar' }, { value: 'AUD', label: 'AUD ($) - Australian Dollar' }, { value: 'INR', label: 'INR (₹) - Indian Rupee' },
            ]} />
            <Select label="Operating Timezone" value={timezone} onChange={e => setTimezone(e.target.value)} options={[
              { value: '', label: 'Select timezone' }, { value: 'America/New_York', label: 'Eastern Time (US & Canada)' }, { value: 'America/Chicago', label: 'Central Time (US & Canada)' }, { value: 'America/Denver', label: 'Mountain Time (US & Canada)' }, { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' }, { value: 'Europe/London', label: 'London / UTC' }, { value: 'Europe/Berlin', label: 'Berlin / CET' }, { value: 'Asia/Dubai', label: 'Dubai / GST' }, { value: 'Asia/Singapore', label: 'Singapore / SGT' },
            ]} />
          </div>
          <Input label="Federal Tax ID / EIN / VAT Number" value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="Tax identifier" />
          <Input label="Principal Registered Headquarters Address" value={registeredAddress} onChange={e => setRegisteredAddress(e.target.value)} placeholder="Registered business address" />
          <div className="flex justify-between pt-2">
            <Button variant="secondary" size="md" onClick={() => setStep(1)}>Back</Button>
            <Button variant="primary" size="md" onClick={() => setStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>Review & Certify</Button>
          </div>
        </div>}

        {step === 3 && <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#08080c] border border-white/20 space-y-3">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold text-xs uppercase tracking-wider"><ShieldCheck className="w-4 h-4" /> Business Verification</div>
            <p className="text-xs text-zinc-300 leading-relaxed">Review your business and workspace information before saving it.</p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-400 font-mono">
              <div>Organisation: <span className="text-zinc-200">{organisationName || ''}</span></div>
              <div>Workspace: <span className="text-zinc-200">{workspaceName || ''}</span></div>
              <div>Tax ID: <span className="text-zinc-200">{taxId || ''}</span></div>
              <div>Currency: <span className="text-zinc-200">{currency || ''}</span></div>
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="secondary" size="md" onClick={() => setStep(2)}>Back</Button>
            <Button variant="primary" size="md" isLoading={isSubmitting} onClick={handleCompleteVerification} leftIcon={<CheckCircle2 className="w-4 h-4" />}>Save Business Profile</Button>
          </div>
        </div>}
      </div>
    </Modal>
  );
};
