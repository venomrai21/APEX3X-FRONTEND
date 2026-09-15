import React, { useEffect, useState } from 'react';
import { ShieldCheck, Building2, Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const OnboardingModal: React.FC = () => {
  const { onboardingOpen, setOnboardingOpen, currentWorkspace, triggerRefresh, addToast } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [taxId, setTaxId] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [currency, setCurrency] = useState('');
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    if (!onboardingOpen) return;
    setStep(1);
    setBusinessName(currentWorkspace?.name || '');
    setIndustry(currentWorkspace?.industry || '');
    setWebsite(currentWorkspace?.website || '');
    setTaxId(currentWorkspace?.taxId || '');
    setRegisteredAddress(currentWorkspace?.registeredAddress || '');
    setCurrency(currentWorkspace?.currency || '');
    setTimezone(currentWorkspace?.timezone || '');
  }, [onboardingOpen, currentWorkspace]);

  if (!onboardingOpen) return null;

  const handleCompleteVerification = async () => {
    try {
      setIsSubmitting(true);
      await api.updateWorkspace({ name: businessName, industry, website, taxId, registeredAddress, currency, timezone });
      await api.verifyWorkspace();
      addToast({ type: 'success', title: 'Business Profile Updated', description: 'Business verification request submitted.' });
      triggerRefresh();
      setOnboardingOpen(false);
    } catch (err) {
      addToast({ type: 'error', title: 'Verification Failed', description: (err as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={onboardingOpen} onClose={() => setOnboardingOpen(false)} title="Business Verification & Operational Profile" subtitle="Maintain the business information required by the connected APEX3X platform." maxWidth="xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          {[['1', 'Legal Entity'], ['2', 'Financial & Currency'], ['3', 'Compliance']].map(([number, label], index) => (
            <React.Fragment key={number}>
              <div className="flex items-center gap-2"><span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= index + 1 ? 'bg-amber-500 text-black' : 'bg-white/[0.06] text-zinc-400'}`}>{number}</span><span className="text-xs font-medium text-zinc-200">{label}</span></div>
              {index < 2 && <div className="w-8 h-px bg-white/[0.1]" />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && <div className="space-y-4">
          <Input label="Registered Business / Organization Name" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Legal business name" leftIcon={<Building2 className="w-4 h-4 text-zinc-500" />} />
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
          <div className="flex justify-end pt-2"><Button variant="primary" size="md" onClick={() => setStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>Proceed to Financial Config</Button></div>
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
          <div className="flex justify-between pt-2"><Button variant="secondary" size="md" onClick={() => setStep(1)}>Back</Button><Button variant="primary" size="md" onClick={() => setStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>Review & Certify</Button></div>
        </div>}

        {step === 3 && <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#08080c] border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider"><ShieldCheck className="w-4 h-4" /> Business Verification</div>
            <p className="text-xs text-zinc-300 leading-relaxed">Review the information supplied for <span className="text-zinc-100 font-medium">{businessName || 'this business'}</span> before submitting it to the connected platform.</p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-400 font-mono">
              <div>Entity: <span className="text-zinc-200">{businessName || '—'}</span></div>
              <div>Tax ID: <span className="text-zinc-200">{taxId || '—'}</span></div>
              <div>Currency: <span className="text-zinc-200">{currency || '—'}</span></div>
              <div>Status: <span className="text-amber-400">Ready to submit</span></div>
            </div>
          </div>
          <div className="flex justify-between pt-2"><Button variant="secondary" size="md" onClick={() => setStep(2)}>Back</Button><Button variant="primary" size="md" isLoading={isSubmitting} onClick={handleCompleteVerification} leftIcon={<CheckCircle2 className="w-4 h-4" />}>Submit Verification</Button></div>
        </div>}
      </div>
    </Modal>
  );
};
