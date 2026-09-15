import React, { useState } from 'react';
import { ShieldCheck, Building2, Globe, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
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

  // Form states
  const [businessName, setBusinessName] = useState(currentWorkspace?.name || 'APEX Industrial Logistics');
  const [industry, setIndustry] = useState(currentWorkspace?.industry || 'B2B Logistics & Freight');
  const [website, setWebsite] = useState(currentWorkspace?.website || 'https://apexindustrial.com');
  const [taxId, setTaxId] = useState(currentWorkspace?.taxId || 'US-EIN-94-2819034');
  const [registeredAddress, setRegisteredAddress] = useState(
    currentWorkspace?.registeredAddress || '742 Executive Way, Suite 400, Chicago, IL 60601'
  );
  const [currency, setCurrency] = useState(currentWorkspace?.currency || 'USD');
  const [timezone, setTimezone] = useState(currentWorkspace?.timezone || 'America/New_York');

  if (!onboardingOpen) return null;

  const handleCompleteVerification = async () => {
    try {
      setIsSubmitting(true);
      await api.updateWorkspace({
        name: businessName,
        industry,
        website,
        taxId,
        registeredAddress,
        currency,
        timezone,
      });
      await api.verifyWorkspace();
      addToast({
        type: 'success',
        title: 'Business Verified',
        description: 'Workspace credentials verified and operating under production compliance.',
      });
      triggerRefresh();
      setOnboardingOpen(false);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Verification Failed',
        description: (err as Error).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={onboardingOpen}
      onClose={() => setOnboardingOpen(false)}
      title="Business Verification & Operational Profile"
      subtitle="Complete business verification to enable automated WhatsApp Cloud dispatch, Stripe live processing, and autonomous billing collections."
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                step >= 1 ? 'bg-amber-500 text-black' : 'bg-white/[0.06] text-zinc-400'
              }`}
            >
              1
            </span>
            <span className="text-xs font-medium text-zinc-200">Legal Entity</span>
          </div>
          <div className="w-8 h-px bg-white/[0.1]" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                step >= 2 ? 'bg-amber-500 text-black' : 'bg-white/[0.06] text-zinc-400'
              }`}
            >
              2
            </span>
            <span className="text-xs font-medium text-zinc-200">Financial & Currency</span>
          </div>
          <div className="w-8 h-px bg-white/[0.1]" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                step >= 3 ? 'bg-amber-500 text-black' : 'bg-white/[0.06] text-zinc-400'
              }`}
            >
              3
            </span>
            <span className="text-xs font-medium text-zinc-200">Compliance</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Registered Business / Organization Name"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="e.g. Acme Industrial Services LLC"
              leftIcon={<Building2 className="w-4 h-4 text-zinc-500" />}
            />

            <Input
              label="Primary Website URL"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://company.com"
              leftIcon={<Globe className="w-4 h-4 text-zinc-500" />}
            />

            <Select
              label="Primary Industry Vertical"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              options={[
                { value: 'B2B Logistics & Freight', label: 'B2B Logistics & Freight' },
                { value: 'Professional & Consulting Services', label: 'Professional & Consulting Services' },
                { value: 'B2B SaaS & Technology', label: 'B2B SaaS & Technology' },
                { value: 'Healthcare & Clinical Services', label: 'Healthcare & Clinical Services' },
                { value: 'Commercial Real Estate & Facilities', label: 'Commercial Real Estate & Facilities' },
                { value: 'Manufacturing & Distribution', label: 'Manufacturing & Distribution' },
              ]}
            />

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(2)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Financial Config
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Operating Currency"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                options={[
                  { value: 'USD', label: 'USD ($) - US Dollar' },
                  { value: 'EUR', label: 'EUR (€) - Euro' },
                  { value: 'GBP', label: 'GBP (£) - British Pound' },
                  { value: 'CAD', label: 'CAD ($) - Canadian Dollar' },
                  { value: 'AUD', label: 'AUD ($) - Australian Dollar' },
                  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
                ]}
              />

              <Select
                label="Operating Timezone"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                options={[
                  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
                  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
                  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
                  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
                  { value: 'Europe/London', label: 'London / UTC' },
                  { value: 'Europe/Berlin', label: 'Berlin / CET' },
                  { value: 'Asia/Dubai', label: 'Dubai / GST' },
                  { value: 'Asia/Singapore', label: 'Singapore / SGT' },
                ]}
              />
            </div>

            <Input
              label="Federal Tax ID / EIN / VAT Number"
              value={taxId}
              onChange={e => setTaxId(e.target.value)}
              placeholder="e.g. 12-3456789"
            />

            <Input
              label="Principal Registered Headquarters Address"
              value={registeredAddress}
              onChange={e => setRegisteredAddress(e.target.value)}
              placeholder="Full physical street address, City, State/Province, Postal Code"
            />

            <div className="flex justify-between pt-2">
              <Button variant="secondary" size="md" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(3)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Review & Certify
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#08080c] border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Certification & Operational SLA
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                By completing verification, you certify that <span className="text-zinc-100 font-medium">{businessName}</span> operates in compliance with international telecommunication and payment processing guidelines. APEX3X autonomous decisions will operate with isolated tenant encryption.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-400 font-mono">
                <div>Entity: <span className="text-zinc-200">{businessName}</span></div>
                <div>Tax ID: <span className="text-zinc-200">{taxId}</span></div>
                <div>Currency: <span className="text-zinc-200">{currency}</span></div>
                <div>Status: <span className="text-emerald-400">Ready for Verification</span></div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="secondary" size="md" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                onClick={handleCompleteVerification}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Complete & Verify Business
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
