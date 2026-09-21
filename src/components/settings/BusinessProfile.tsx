import React, { useMemo, useState } from 'react';
import {
  ArrowRight, Check, ChevronDown, CircleHelp, FileCheck2, Gauge,
  MapPin, Plus, Save, Sparkles, Target, Trash2, Users, X
} from 'lucide-react';
import { api } from '../../api/client';
import { Workspace } from '../../types';
import { Badge, Button, Card, Input, Select } from '../apex3x';

type StageId = 1 | 2 | 3;
type Source = 'user_declared' | 'connected' | 'observed' | 'calculated' | 'inferred';
type ValueState = 'provided' | 'unknown' | 'not_applicable' | 'not_provided';

type ProfileMeta = {
  source: Source;
  confidence: 'confirmed' | 'high' | 'medium' | 'low';
  state: ValueState;
  updatedAt: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  type: string;
  price: string;
  priority: string;
  recurring: string;
  delivery: string;
};

type CustomerSegment = {
  id: string;
  name: string;
  description: string;
  needs: string;
  painPoints: string;
  triggers: string;
  objections: string;
  decisionMaker: string;
  channels: string;
};

type Goal = {
  id: string;
  goal: string;
  target: string;
  current: string;
  timeframe: string;
  priority: string;
};

type BusinessProfileDraft = {
  businessName: string;
  industry: string;
  description: string;
  products: Product[];
  targetCustomers: string[];
  targetCustomerDescription: string;
  businessModels: string[];
  location: string;
  market: string;
  story: string;
  mission: string;
  vision: string;
  differentiators: string;
  strengths: string;
  challenges: string;
  customerSegments: CustomerSegment[];
  acquisitionChannels: string[];
  primaryAcquisitionChannel: string;
  growthChannel: string;
  salesJourney: string;
  qualificationCriteria: string;
  salesCycle: string;
  conversionDefinition: string;
  objections: string;
  currentCondition: string;
  biggestChallenge: string;
  goals: Goal[];
  growthPriorities: string[];
  competitors: string;
  positioning: string;
  competitorStrengths: string;
  brandPersonality: string;
  communicationStyle: string;
  valueProposition: string;
  promises: string;
  proofPoints: string;
  website: string;
  socialProfiles: string;
  legalName: string;
  tradingName: string;
  entityType: string;
  registrationNumber: string;
  taxId: string;
  taxJurisdiction: string;
  incorporationDate: string;
  registeredAddress: string;
  licenses: string;
  certifications: string;
  regulatoryRequirements: string;
  complianceRequirements: string;
  employeeRange: string;
  departments: string;
  roles: string;
  branches: string;
  businessHours: string;
  holidaySchedule: string;
  timezone: string;
  languages: string;
  serviceArea: string;
  capacity: string;
  appointmentDuration: string;
  bookingRules: string;
  fulfillment: string;
  inventory: string;
  shipping: string;
  acceptedPayments: string[];
  acceptedCurrencies: string[];
  paymentTerms: string;
  creditTerms: string;
  depositRequirements: string;
  averageTransactionValue: string;
  typicalSalesCycle: string;
  recurringRevenue: string;
  refundPolicy: string;
  cancellationPolicy: string;
  discountRules: string;
  approvalRequirements: string;
  communicationRules: string;
  operationalConstraints: string;
};

const sourceMeta = (source: Source = 'user_declared'): ProfileMeta => ({
  source,
  confidence: source === 'user_declared' ? 'confirmed' : 'medium',
  state: 'provided',
  updatedAt: new Date().toISOString(),
});

const createProduct = (): Product => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  type: 'service',
  price: '',
  priority: 'normal',
  recurring: 'one_time',
  delivery: '',
});

const createSegment = (): CustomerSegment => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  needs: '',
  painPoints: '',
  triggers: '',
  objections: '',
  decisionMaker: '',
  channels: '',
});

const createGoal = (): Goal => ({
  id: crypto.randomUUID(),
  goal: '',
  target: '',
  current: '',
  timeframe: '90_days',
  priority: 'high',
});

const createDraft = (workspace: Workspace | null): BusinessProfileDraft => ({
  businessName: workspace?.name ?? '',
  industry: workspace?.industry ?? '',
  description: '',
  products: [],
  targetCustomers: [],
  targetCustomerDescription: '',
  businessModels: [],
  location: workspace?.registeredAddress ?? '',
  market: '',
  story: '',
  mission: '',
  vision: '',
  differentiators: '',
  strengths: '',
  challenges: '',
  customerSegments: [],
  acquisitionChannels: [],
  primaryAcquisitionChannel: '',
  growthChannel: '',
  salesJourney: '',
  qualificationCriteria: '',
  salesCycle: '',
  conversionDefinition: '',
  objections: '',
  currentCondition: '',
  biggestChallenge: '',
  goals: [],
  growthPriorities: [],
  competitors: '',
  positioning: '',
  competitorStrengths: '',
  brandPersonality: '',
  communicationStyle: '',
  valueProposition: '',
  promises: '',
  proofPoints: '',
  website: workspace?.website ?? '',
  socialProfiles: '',
  legalName: '',
  tradingName: '',
  entityType: '',
  registrationNumber: '',
  taxId: workspace?.taxId ?? '',
  taxJurisdiction: '',
  incorporationDate: '',
  registeredAddress: workspace?.registeredAddress ?? '',
  licenses: '',
  certifications: '',
  regulatoryRequirements: '',
  complianceRequirements: '',
  employeeRange: '',
  departments: '',
  roles: '',
  branches: '',
  businessHours: '',
  holidaySchedule: '',
  timezone: workspace?.timezone ?? 'Asia/Kolkata',
  languages: '',
  serviceArea: '',
  capacity: '',
  appointmentDuration: '',
  bookingRules: '',
  fulfillment: '',
  inventory: '',
  shipping: '',
  acceptedPayments: [],
  acceptedCurrencies: workspace?.currency ? [workspace.currency] : ['INR'],
  paymentTerms: '',
  creditTerms: '',
  depositRequirements: '',
  averageTransactionValue: '',
  typicalSalesCycle: '',
  recurringRevenue: '',
  refundPolicy: '',
  cancellationPolicy: '',
  discountRules: '',
  approvalRequirements: '',
  communicationRules: '',
  operationalConstraints: '',
});

const stageMeta: Record<StageId, { title: string; subtitle: string; weight: number }> = {
  1: { title: 'Business Foundation', subtitle: 'The minimum context APEX needs to start working.', weight: 40 },
  2: { title: 'Business Intelligence', subtitle: 'Teach APEX how your business grows and what you want next.', weight: 40 },
  3: { title: 'Operations & Verification', subtitle: 'Add deeper legal, operational and commercial context when ready.', weight: 20 },
};

const customerTypes = ['Consumers / Individuals', 'Families', 'Small businesses', 'Medium businesses', 'Enterprises', 'Startups', 'Professionals', 'Government', 'Other'];
const businessModels = ['Product sales', 'Service business', 'Subscription', 'Membership', 'Contract', 'Retainer', 'Marketplace', 'Commission', 'Advertising', 'Licensing', 'Freemium', 'Mixed', 'Other'];
const acquisitionChannels = ['Website', 'Google Search', 'Google Business Profile', 'WhatsApp', 'Facebook', 'Instagram', 'LinkedIn', 'YouTube', 'Referrals', 'Email', 'Paid advertising', 'Marketplace', 'Partners', 'Walk-in', 'Phone', 'Other'];
const goalOptions = ['Increase leads', 'Improve lead quality', 'Increase conversion', 'Increase sales', 'Increase average transaction value', 'Recover abandoned leads', 'Reduce appointment no-shows', 'Collect outstanding payments', 'Increase repeat purchases', 'Reactivate inactive customers', 'Increase referrals', 'Improve customer experience', 'Launch a new product', 'Expand geographically', 'Improve operational efficiency'];
const paymentOptions = ['Cash', 'Bank transfer', 'Credit/debit card', 'UPI', 'Digital wallet', 'Payment link', 'Direct debit', 'Other'];
const currencyOptions = typeof Intl !== 'undefined' && Intl.supportedValuesOf
  ? Intl.supportedValuesOf('currency').sort().map(code => ({ value: code, label: code }))
  : [
      'INR', 'USD', 'EUR', 'GBP', 'AED', 'AUD', 'CAD', 'SGD', 'JPY', 'CNY',
      'CHF', 'HKD', 'NZD', 'SEK', 'NOK', 'DKK', 'ZAR', 'BRL', 'MXN', 'SAR', 'QAR', 'KWD', 'BHD', 'THB', 'MYR', 'IDR', 'PHP', 'KRW', 'TWD'
    ].map(code => ({ value: code, label: code }));

const timezoneOptions = typeof Intl !== 'undefined' && Intl.supportedValuesOf
  ? Intl.supportedValuesOf('timeZone').sort().map(zone => ({ value: zone, label: zone }))
  : [{ value: 'Asia/Kolkata', label: 'Asia/Kolkata' }, { value: 'UTC', label: 'UTC' }];

const ToggleChips: React.FC<{
  values: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  ariaLabel: string;
}> = ({ values, selected, onChange, ariaLabel }) => (
  <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
    {values.map(value => {
      const active = selected.includes(value);
      return (
        <button
          key={value}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(active ? selected.filter(item => item !== value) : [...selected, value])}
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${active ? 'border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text-primary)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'}`}
        >
          {active && <Check className="mr-1 inline h-3 w-3" />}
          {value}
        </button>
      );
    })}
  </div>
);

const Section: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <section className="space-y-4 border-t border-[var(--border-subtle)] pt-6 first:border-t-0 first:pt-0">
    <div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">{description}</p>
    </div>
    {children}
  </section>
);

const TextAreaField: React.FC<{ id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }> = ({ id, label, value, onChange, placeholder, required }) => (
  <label htmlFor={id} className="block">
    <span className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">{label}{required && <span className="ml-1 text-[var(--text-primary)]">*</span>}</span>
    <textarea
      id={id}
      value={value}
      onChange={event => onChange(event.target.value)}
      placeholder={placeholder}
      rows={4}
      className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] focus:ring-1 focus:ring-[var(--ring-brand)]"
    />
  </label>
);

const CompletionBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-[var(--text-secondary)]">APEX Business Understanding</span>
      <span className="font-semibold text-[var(--text-primary)]">{value}%</span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
      <div className="h-full rounded-full bg-[var(--text-primary)] transition-all duration-500" style={{ width: `${value}%` }} />
    </div>
  </div>
);

export const BusinessProfile: React.FC<{
  workspace: Workspace | null;
  addToast: (toast: { type: 'success' | 'warning' | 'error' | 'info'; title: string; description?: string }) => void;
  onWorkspaceUpdated: (workspace: Workspace) => void;
}> = ({ workspace, addToast, onWorkspaceUpdated }) => {
  const [activeStage, setActiveStage] = useState<StageId>(1);
  const [draft, setDraft] = useState<BusinessProfileDraft>(() => createDraft(workspace));
  const [savingStage, setSavingStage] = useState<StageId | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);
  const [profileMeta] = useState<Record<string, ProfileMeta>>(() => ({ businessName: sourceMeta(), industry: sourceMeta(), description: sourceMeta(), products: sourceMeta(), targetCustomers: sourceMeta(), businessModels: sourceMeta(), location: sourceMeta() }));

  const stage1Complete = useMemo(() => {
    const required = [
      draft.businessName.trim(),
      draft.industry.trim(),
      draft.description.trim(),
      draft.products.some(item => item.name.trim()),
      draft.targetCustomers.length > 0 || draft.targetCustomerDescription.trim(),
      draft.businessModels.length > 0,
      draft.location.trim() || draft.market.trim(),
    ];
    return Math.round((required.filter(Boolean).length / required.length) * 100);
  }, [draft]);

  const stage2Complete = useMemo(() => {
    const checks = [
      draft.story, draft.customerSegments.length, draft.acquisitionChannels.length,
      draft.salesJourney, draft.currentCondition, draft.goals.length,
      draft.growthPriorities.length, draft.valueProposition,
    ];
    return Math.round((checks.filter(value => Boolean(value)).length / checks.length) * 100);
  }, [draft]);

  const stage3Complete = useMemo(() => {
    const checks = [draft.legalName || draft.tradingName, draft.entityType, draft.employeeRange, draft.timezone, draft.serviceArea, draft.acceptedPayments.length, draft.acceptedCurrencies.length, draft.paymentTerms || draft.averageTransactionValue];
    return Math.round((checks.filter(value => Boolean(value)).length / checks.length) * 100);
  }, [draft]);

  const overallScore = Math.round(stage1Complete * 0.4 + stage2Complete * 0.4 + stage3Complete * 0.2);
  const stageReady = stage1Complete === 100;

  const update = <K extends keyof BusinessProfileDraft>(key: K, value: BusinessProfileDraft[K]) => setDraft(previous => ({ ...previous, [key]: value }));

  const saveStage = async (stage: StageId) => {
    setSavingStage(stage);
    try {
      if (stage === 1 && workspace) {
        const updated = await api.updateWorkspace({
          name: draft.businessName,
          industry: draft.industry,
          website: draft.website,
          registeredAddress: draft.location,
          taxId: draft.taxId,
          currency: draft.acceptedCurrencies[0] || workspace.currency,
          timezone: draft.timezone || workspace.timezone,
        });
        onWorkspaceUpdated(updated);
      }
      addToast({
        type: 'success',
        title: `Stage ${stage} saved`,
        description: stage === 1 ? 'Your business foundation is ready for APEX.' : 'Your additional business context is captured in the frontend profile.',
      });
    } catch (error) {
      addToast({ type: 'error', title: 'Save failed', description: error instanceof Error ? error.message : 'Unable to save the profile.' });
    } finally {
      setSavingStage(null);
    }
  };

  const addProduct = () => {
    const product = createProduct();
    update('products', [...draft.products, product]);
    setExpandedProduct(product.id);
  };

  const addSegment = () => {
    const segment = createSegment();
    update('customerSegments', [...draft.customerSegments, segment]);
    setExpandedSegment(segment.id);
  };

  const addGoal = () => update('goals', [...draft.goals, createGoal()]);

  const updateProduct = (id: string, patch: Partial<Product>) => update('products', draft.products.map(item => item.id === id ? { ...item, ...patch } : item));
  const updateSegment = (id: string, patch: Partial<CustomerSegment>) => update('customerSegments', draft.customerSegments.map(item => item.id === id ? { ...item, ...patch } : item));
  const updateGoal = (id: string, patch: Partial<Goal>) => update('goals', draft.goals.map(item => item.id === id ? { ...item, ...patch } : item));

  const removeById = <T extends { id: string }>(items: T[], id: string) => items.filter(item => item.id !== id);

  return (
    <div className="space-y-5">
      <Card padding="lg" className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--text-primary)]" />
              <Badge variant="neutral" size="sm">APEX Business Understanding</Badge>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Teach APEX your business — progressively.</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">Stage 1 gets you working immediately. Stages 2 and 3 deepen APEX's understanding whenever you have time. Nothing beyond Stage 1 is required to use APEX.</p>
          </div>
          <div className="w-full shrink-0 lg:w-64">
            <CompletionBar value={overallScore} />
            <p className="mt-2 text-[10px] leading-relaxed text-[var(--text-muted)]">This measures how much business context APEX has, not business performance or business quality.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-3" role="tablist" aria-label="Business Profile stages">
          {[1, 2, 3].map(stageNumber => {
            const stage = stageNumber as StageId;
            const score = stage === 1 ? stage1Complete : stage === 2 ? stage2Complete : stage3Complete;
            const active = activeStage === stage;
            return (
              <button
                key={stage}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveStage(stage)}
                className={`rounded-xl border p-3 text-left transition-colors ${active ? 'border-[var(--border-strong)] bg-[var(--surface-2)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Stage 0{stage}</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)]">{score}%</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{stageMeta[stage].title}</div>
                <div className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">{stageMeta[stage].subtitle}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {activeStage === 1 && (
        <Card padding="lg" className="space-y-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Stage 01 · Required for activation</div>
              <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Business Foundation</h3>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[var(--text-secondary)]">The smallest useful business context. Complete this stage and enter APEX; everything deeper can wait.</p>
            </div>
            <Badge variant={stageReady ? 'success' : 'neutral'} size="sm">{stageReady ? 'READY TO USE APEX' : 'FOUNDATION INCOMPLETE'}</Badge>
          </div>

          <Section title="Identity" description="Tell APEX what the business is. These are the only identity fields required at activation.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input id="bp-business-name" label="Business Name" value={draft.businessName} onChange={event => update('businessName', event.target.value)} required />
              <Input id="bp-industry" label="Industry" value={draft.industry} onChange={event => update('industry', event.target.value)} placeholder="e.g. Home Services · Cleaning" required />
            </div>
            <TextAreaField id="bp-description" label="What does your business do?" value={draft.description} onChange={value => update('description', value)} placeholder="Describe what you provide, who you help, and the problem you solve." required />
          </Section>

          <Section title="Products & Services" description="Create structured offers. Pricing and deeper commercial details can be added in Stage 2.">
            <div className="space-y-3">
              {draft.products.map(product => (
                <div key={product.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                  <button type="button" className="flex w-full items-center justify-between gap-3 p-3 text-left" onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)} aria-expanded={expandedProduct === product.id}>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[var(--text-primary)]">{product.name || 'New product or service'}</div>
                      <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">{product.type} · {product.recurring === 'recurring' ? 'Recurring' : 'One-time'}</div>
                    </div>
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${expandedProduct === product.id ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedProduct === product.id && (
                    <div className="grid grid-cols-1 gap-4 border-t border-[var(--border-subtle)] p-4 md:grid-cols-2">
                      <Input id={`product-name-${product.id}`} label="Name" value={product.name} onChange={event => updateProduct(product.id, { name: event.target.value })} required />
                      <Select id={`product-type-${product.id}`} label="Type" value={product.type} onChange={event => updateProduct(product.id, { type: event.target.value })} options={[{ value: 'product', label: 'Product' }, { value: 'service', label: 'Service' }, { value: 'subscription', label: 'Subscription' }, { value: 'membership', label: 'Membership' }, { value: 'package', label: 'Package' }, { value: 'other', label: 'Other' }]} />
                      <div className="md:col-span-2"><TextAreaField id={`product-description-${product.id}`} label="Short description" value={product.description} onChange={value => updateProduct(product.id, { description: value })} /></div>
                      <div className="md:col-span-2 flex justify-end"><Button variant="ghost" size="sm" onClick={() => update('products', removeById(draft.products, product.id))} leftIcon={<Trash2 className="h-3.5 w-3.5" />}>Remove</Button></div>
                    </div>
                  )}
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={addProduct} leftIcon={<Plus className="h-3.5 w-3.5" />}>Add product or service</Button>
            </div>
          </Section>

          <Section title="Target Customers" description="This is the customer's declared view of who they serve. APEX can later compare it with observed data instead of silently replacing it.">
            <ToggleChips values={customerTypes} selected={draft.targetCustomers} onChange={values => update('targetCustomers', values)} ariaLabel="Target customer types" />
            <TextAreaField id="bp-target-customer-description" label="Primary customer description" value={draft.targetCustomerDescription} onChange={value => update('targetCustomerDescription', value)} placeholder="Who typically buys from you, and why?" />
          </Section>

          <Section title="Business Model" description="Select every revenue model that genuinely applies. This helps APEX reason about acquisition, conversion and retention.">
            <ToggleChips values={businessModels} selected={draft.businessModels} onChange={values => update('businessModels', values)} ariaLabel="Business models" />
          </Section>

          <Section title="Location & Market" description="Physical headquarters and customer market are separate concepts. Provide either or both as applicable.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input id="bp-location" label="Primary Business Location" value={draft.location} onChange={event => update('location', event.target.value)} placeholder="Business address or primary operating location" />
              <Select id="bp-market" label="Primary Market / Service Area" value={draft.market} onChange={event => update('market', event.target.value)} options={[{ value: '', label: 'Select market' }, { value: 'local', label: 'Local' }, { value: 'city', label: 'City / metro' }, { value: 'regional', label: 'Multiple cities / region' }, { value: 'national', label: 'National' }, { value: 'international', label: 'International' }, { value: 'online', label: 'Online / global' }]} />
            </div>
          </Section>

          <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold text-[var(--text-primary)]">Stage 1 score: {stage1Complete}%</div>
              <p className="mt-1 text-[10px] text-[var(--text-muted)]">Once this reaches 100%, Stage 2 and Stage 3 remain completely optional.</p>
            </div>
            <Button variant="primary" size="md" isLoading={savingStage === 1} onClick={() => saveStage(1)} disabled={!stageReady} leftIcon={<Save className="h-4 w-4" />}>Save Foundation</Button>
          </div>
        </Card>
      )}

      {activeStage === 2 && (
        <Card padding="lg" className="space-y-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Stage 02 · Optional</div>
              <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Business Intelligence</h3>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[var(--text-secondary)]">Add depth when you have time. More context lets APEX make more specific growth recommendations, but no field here is required to use APEX.</p>
            </div>
            <Badge variant="neutral" size="sm">OPTIONAL · {stage2Complete}%</Badge>
          </div>

          <Section title="Business Story" description="Give APEX the context that normally takes a human advisor months to learn.">
            <TextAreaField id="bp-story" label="Business overview" value={draft.story} onChange={value => update('story', value)} placeholder="How did the business start, what does it do today, and what matters most?" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextAreaField id="bp-mission" label="Mission" value={draft.mission} onChange={value => update('mission', value)} />
              <TextAreaField id="bp-vision" label="Vision" value={draft.vision} onChange={value => update('vision', value)} />
              <TextAreaField id="bp-differentiators" label="Differentiators" value={draft.differentiators} onChange={value => update('differentiators', value)} />
              <TextAreaField id="bp-strengths" label="Business strengths" value={draft.strengths} onChange={value => update('strengths', value)} />
              <div className="md:col-span-2"><TextAreaField id="bp-challenges" label="Current challenges" value={draft.challenges} onChange={value => update('challenges', value)} /></div>
            </div>
          </Section>

          <Section title="Customer Segments" description="Segments are first-class business entities. APEX can use these independently for targeting, messaging and growth analysis.">
            <div className="space-y-3">
              {draft.customerSegments.map(segment => (
                <div key={segment.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                  <button type="button" className="flex w-full items-center justify-between gap-3 p-3 text-left" onClick={() => setExpandedSegment(expandedSegment === segment.id ? null : segment.id)} aria-expanded={expandedSegment === segment.id}>
                    <div className="truncate text-sm font-medium text-[var(--text-primary)]">{segment.name || 'New customer segment'}</div>
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${expandedSegment === segment.id ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSegment === segment.id && (
                    <div className="grid grid-cols-1 gap-4 border-t border-[var(--border-subtle)] p-4 md:grid-cols-2">
                      <Input id={`segment-name-${segment.id}`} label="Segment name" value={segment.name} onChange={event => updateSegment(segment.id, { name: event.target.value })} />
                      <Input id={`segment-decision-${segment.id}`} label="Decision maker" value={segment.decisionMaker} onChange={event => updateSegment(segment.id, { decisionMaker: event.target.value })} />
                      <TextAreaField id={`segment-description-${segment.id}`} label="Description" value={segment.description} onChange={value => updateSegment(segment.id, { description: value })} />
                      <TextAreaField id={`segment-needs-${segment.id}`} label="Needs" value={segment.needs} onChange={value => updateSegment(segment.id, { needs: value })} />
                      <TextAreaField id={`segment-pain-${segment.id}`} label="Pain points" value={segment.painPoints} onChange={value => updateSegment(segment.id, { painPoints: value })} />
                      <TextAreaField id={`segment-triggers-${segment.id}`} label="Buying triggers" value={segment.triggers} onChange={value => updateSegment(segment.id, { triggers: value })} />
                      <TextAreaField id={`segment-objections-${segment.id}`} label="Common objections" value={segment.objections} onChange={value => updateSegment(segment.id, { objections: value })} />
                      <TextAreaField id={`segment-channels-${segment.id}`} label="Typical acquisition channels" value={segment.channels} onChange={value => updateSegment(segment.id, { channels: value })} />
                      <div className="md:col-span-2 flex justify-end"><Button variant="ghost" size="sm" onClick={() => update('customerSegments', removeById(draft.customerSegments, segment.id))} leftIcon={<Trash2 className="h-3.5 w-3.5" />}>Remove segment</Button></div>
                    </div>
                  )}
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={addSegment} leftIcon={<Plus className="h-3.5 w-3.5" />}>Add customer segment</Button>
            </div>
          </Section>

          <Section title="Offer Intelligence" description="Add commercial and delivery context to products/services without forcing it into Stage 1.">
            <div className="space-y-4">
              {draft.products.map(product => (
                <div key={product.id} className="grid grid-cols-1 gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-4">
                  <Input id={`offer-price-${product.id}`} label={`${product.name || 'Offer'} · Price / range`} value={product.price} onChange={event => updateProduct(product.id, { price: event.target.value })} />
                  <Select id={`offer-recurring-${product.id}`} label="Revenue pattern" value={product.recurring} onChange={event => updateProduct(product.id, { recurring: event.target.value })} options={[{ value: 'one_time', label: 'One-time' }, { value: 'recurring', label: 'Recurring' }]} />
                  <Select id={`offer-priority-${product.id}`} label="Business priority" value={product.priority} onChange={event => updateProduct(product.id, { priority: event.target.value })} options={[{ value: 'normal', label: 'Normal' }, { value: 'revenue', label: 'Revenue priority' }, { value: 'margin', label: 'Margin priority' }, { value: 'popular', label: 'Most popular' }, { value: 'strategic', label: 'Strategic' }]} />
                  <Input id={`offer-delivery-${product.id}`} label="Delivery method" value={product.delivery} onChange={event => updateProduct(product.id, { delivery: event.target.value })} placeholder="Online, onsite, shipped…" />
                </div>
              ))}
              {draft.products.length === 0 && <p className="text-xs text-[var(--text-muted)]">Add products or services in Stage 1 to unlock offer-level intelligence here.</p>}
            </div>
          </Section>

          <Section title="Acquisition" description="Separate what currently happens from what the business wants to grow.">
            <ToggleChips values={acquisitionChannels} selected={draft.acquisitionChannels} onChange={values => update('acquisitionChannels', values)} ariaLabel="Current acquisition channels" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select id="bp-primary-channel" label="Primary current acquisition channel" value={draft.primaryAcquisitionChannel} onChange={event => update('primaryAcquisitionChannel', event.target.value)} options={[{ value: '', label: 'Select channel' }, ...acquisitionChannels.map(value => ({ value, label: value }))]} />
              <Select id="bp-growth-channel" label="Channel you want to grow" value={draft.growthChannel} onChange={event => update('growthChannel', event.target.value)} options={[{ value: '', label: 'Select channel' }, ...acquisitionChannels.map(value => ({ value, label: value }))]} />
            </div>
          </Section>

          <Section title="Sales & Conversion" description="Help APEX understand the path from attention to revenue.">
            <TextAreaField id="bp-sales-journey" label="Customer journey" value={draft.salesJourney} onChange={value => update('salesJourney', value)} placeholder="e.g. Ad → website → WhatsApp → qualification → quote → booking → payment" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextAreaField id="bp-qualification" label="Lead qualification criteria" value={draft.qualificationCriteria} onChange={value => update('qualificationCriteria', value)} />
              <Select id="bp-sales-cycle" label="Typical sales cycle" value={draft.salesCycle} onChange={event => update('salesCycle', event.target.value)} options={[{ value: '', label: 'Select cycle' }, { value: 'immediate', label: 'Immediate' }, { value: 'same_day', label: 'Same day' }, { value: '1_7_days', label: '1–7 days' }, { value: '1_4_weeks', label: '1–4 weeks' }, { value: '1_3_months', label: '1–3 months' }, { value: '3_plus_months', label: '3+ months' }]} />
              <Select id="bp-conversion" label="What counts as conversion?" value={draft.conversionDefinition} onChange={event => update('conversionDefinition', event.target.value)} options={[{ value: '', label: 'Select conversion' }, { value: 'purchase', label: 'Purchase' }, { value: 'booking', label: 'Booking' }, { value: 'contract', label: 'Contract signed' }, { value: 'subscription', label: 'Subscription started' }, { value: 'payment', label: 'Payment received' }]} />
              <TextAreaField id="bp-objections" label="Common sales objections" value={draft.objections} onChange={value => update('objections', value)} />
            </div>
          </Section>

          <Section title="Current Condition" description="This is the owner's current view, not an objective APEX diagnosis. Observed state can be stored separately later.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select id="bp-condition" label="Current business condition" value={draft.currentCondition} onChange={event => update('currentCondition', event.target.value)} options={[{ value: '', label: 'Select condition' }, { value: 'pre_launch', label: 'Pre-launch' }, { value: 'newly_launched', label: 'Newly launched' }, { value: 'growing', label: 'Growing' }, { value: 'stable', label: 'Stable' }, { value: 'slowing', label: 'Slowing' }, { value: 'recovering', label: 'Recovering' }, { value: 'seasonal', label: 'Seasonal' }, { value: 'expanding', label: 'Expanding' }, { value: 'restructuring', label: 'Restructuring' }, { value: 'operational_challenges', label: 'Operational challenges' }, { value: 'unsure', label: 'Unsure' }]} />
              <TextAreaField id="bp-biggest-challenge" label="Biggest challenge right now" value={draft.biggestChallenge} onChange={value => update('biggestChallenge', value)} />
            </div>
          </Section>

          <Section title="Goals & Priorities" description="Goals describe desired outcomes. Priorities describe what deserves attention first. Neither should automatically trigger an action.">
            <div className="space-y-3">
              {draft.goals.map(goal => (
                <div key={goal.id} className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-5">
                  <Select id={`goal-${goal.id}`} label="Goal" value={goal.goal} onChange={event => updateGoal(goal.id, { goal: event.target.value })} options={[{ value: '', label: 'Select goal' }, ...goalOptions.map(value => ({ value, label: value }))]} />
                  <Input id={`goal-current-${goal.id}`} label="Current value" value={goal.current} onChange={event => updateGoal(goal.id, { current: event.target.value })} />
                  <Input id={`goal-target-${goal.id}`} label="Target" value={goal.target} onChange={event => updateGoal(goal.id, { target: event.target.value })} />
                  <Select id={`goal-timeframe-${goal.id}`} label="Timeframe" value={goal.timeframe} onChange={event => updateGoal(goal.id, { timeframe: event.target.value })} options={[{ value: '30_days', label: '30 days' }, { value: '90_days', label: '90 days' }, { value: '6_months', label: '6 months' }, { value: '12_months', label: '12 months' }]} />
                  <div className="flex items-end gap-2"><Select id={`goal-priority-${goal.id}`} label="Priority" value={goal.priority} onChange={event => updateGoal(goal.id, { priority: event.target.value })} options={[{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} /><Button variant="ghost" size="sm" aria-label="Remove goal" onClick={() => update('goals', removeById(draft.goals, goal.id))}><Trash2 className="h-3.5 w-3.5" /></Button></div>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={addGoal} leftIcon={<Plus className="h-3.5 w-3.5" />}>Add goal</Button>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Top growth priorities · choose up to 3</div>
              <ToggleChips values={goalOptions} selected={draft.growthPriorities} onChange={values => update('growthPriorities', values.slice(0, 3))} ariaLabel="Growth priorities" />
            </div>
          </Section>

          <Section title="Competitive Context" description="These are user-provided perceptions. APEX should keep them distinct from verified market facts.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <TextAreaField id="bp-competitors" label="Competitors" value={draft.competitors} onChange={value => update('competitors', value)} />
              <TextAreaField id="bp-positioning" label="Your positioning" value={draft.positioning} onChange={value => update('positioning', value)} />
              <TextAreaField id="bp-competitor-strengths" label="Where competitors seem stronger" value={draft.competitorStrengths} onChange={value => update('competitorStrengths', value)} />
            </div>
          </Section>

          <Section title="Brand & Communication" description="Give APEX the language and positioning it should preserve when helping create customer-facing experiences.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input id="bp-brand-personality" label="Brand personality" value={draft.brandPersonality} onChange={event => update('brandPersonality', event.target.value)} placeholder="e.g. Expert, direct, reassuring" />
              <Input id="bp-communication-style" label="Communication style" value={draft.communicationStyle} onChange={event => update('communicationStyle', event.target.value)} placeholder="e.g. Concise and professional" />
              <TextAreaField id="bp-value-proposition" label="Value proposition" value={draft.valueProposition} onChange={value => update('valueProposition', value)} />
              <TextAreaField id="bp-promises" label="Key promises" value={draft.promises} onChange={value => update('promises', value)} />
              <TextAreaField id="bp-proof-points" label="Proof points" value={draft.proofPoints} onChange={value => update('proofPoints', value)} />
              <TextAreaField id="bp-social-profiles" label="Social profiles" value={draft.socialProfiles} onChange={value => update('socialProfiles', value)} />
            </div>
            <Input id="bp-website" label="Website" value={draft.website} onChange={event => update('website', event.target.value)} placeholder="https://example.com" />
          </Section>

          <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="text-xs font-semibold text-[var(--text-primary)]">Stage 2 score: {stage2Complete}%</div><p className="mt-1 text-[10px] text-[var(--text-muted)]">Save this stage whenever you are ready. You can leave and return later.</p></div>
            <Button variant="primary" size="md" isLoading={savingStage === 2} onClick={() => saveStage(2)} leftIcon={<Save className="h-4 w-4" />}>Save Intelligence</Button>
          </div>
        </Card>
      )}

      {activeStage === 3 && (
        <Card padding="lg" className="space-y-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Stage 03 · Optional & conditional</div>
              <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Operations & Verification</h3>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[var(--text-secondary)]">Add deeper business infrastructure only where it applies. Legal/compliance facts remain separate from growth intelligence; operational rules become execution context.</p>
            </div>
            <Badge variant="neutral" size="sm">OPTIONAL · {stage3Complete}%</Badge>
          </div>

          <Section title="Legal & Registration" description="Formal business facts. These should be treated as legal/compliance context, not as marketing or growth assumptions.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input id="bp-legal-name" label="Legal business name" value={draft.legalName} onChange={event => update('legalName', event.target.value)} />
              <Input id="bp-trading-name" label="Trading / brand name" value={draft.tradingName} onChange={event => update('tradingName', event.target.value)} />
              <Select id="bp-entity-type" label="Entity type" value={draft.entityType} onChange={event => update('entityType', event.target.value)} options={[{ value: '', label: 'Select entity type' }, { value: 'sole_proprietorship', label: 'Sole proprietorship' }, { value: 'partnership', label: 'Partnership' }, { value: 'llp', label: 'LLP' }, { value: 'private_company', label: 'Private company' }, { value: 'public_company', label: 'Public company' }, { value: 'nonprofit', label: 'Nonprofit' }, { value: 'other', label: 'Other' }]} />
              <Input id="bp-registration-number" label="Registration number" value={draft.registrationNumber} onChange={event => update('registrationNumber', event.target.value)} />
              <Input id="bp-tax-id" label="Tax identification number" value={draft.taxId} onChange={event => update('taxId', event.target.value)} />
              <Input id="bp-tax-jurisdiction" label="Tax jurisdiction" value={draft.taxJurisdiction} onChange={event => update('taxJurisdiction', event.target.value)} />
              <Input id="bp-incorporation-date" label="Incorporation / registration date" type="date" value={draft.incorporationDate} onChange={event => update('incorporationDate', event.target.value)} />
              <Input id="bp-registered-address" label="Registered address" value={draft.registeredAddress} onChange={event => update('registeredAddress', event.target.value)} />
              <TextAreaField id="bp-licenses" label="Licenses" value={draft.licenses} onChange={value => update('licenses', value)} />
              <TextAreaField id="bp-certifications" label="Certifications" value={draft.certifications} onChange={value => update('certifications', value)} />
              <TextAreaField id="bp-regulatory" label="Regulatory requirements" value={draft.regulatoryRequirements} onChange={value => update('regulatoryRequirements', value)} />
              <TextAreaField id="bp-compliance" label="Compliance requirements" value={draft.complianceRequirements} onChange={value => update('complianceRequirements', value)} />
            </div>
          </Section>

          <Section title="Operational Structure" description="Describe people, locations, hours and capacity. These values can later be enriched by connected systems.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select id="bp-employees" label="Employee count / range" value={draft.employeeRange} onChange={event => update('employeeRange', event.target.value)} options={[{ value: '', label: 'Select range' }, { value: '1', label: '1' }, { value: '2_10', label: '2–10' }, { value: '11_50', label: '11–50' }, { value: '51_200', label: '51–200' }, { value: '201_500', label: '201–500' }, { value: '500_plus', label: '500+' }]} />
              <Input id="bp-departments" label="Departments" value={draft.departments} onChange={event => update('departments', event.target.value)} placeholder="Sales, operations, finance…" />
              <Input id="bp-roles" label="Key roles" value={draft.roles} onChange={event => update('roles', event.target.value)} />
              <Input id="bp-branches" label="Branches / locations" value={draft.branches} onChange={event => update('branches', event.target.value)} />
              <TextAreaField id="bp-business-hours" label="Business hours" value={draft.businessHours} onChange={value => update('businessHours', value)} placeholder="e.g. Mon–Sat 09:00–18:00" />
              <TextAreaField id="bp-holidays" label="Holiday schedule" value={draft.holidaySchedule} onChange={value => update('holidaySchedule', value)} />
              <Select id="bp-timezone" label="Operating timezone" value={draft.timezone} onChange={event => update('timezone', event.target.value)} options={[{ value: '', label: 'Select timezone' }, ...timezoneOptions]} />
              <Input id="bp-languages" label="Languages supported" value={draft.languages} onChange={event => update('languages', event.target.value)} placeholder="English, Hindi…" />
              <Input id="bp-service-area" label="Service area" value={draft.serviceArea} onChange={event => update('serviceArea', event.target.value)} />
              <Input id="bp-capacity" label="Operational capacity" value={draft.capacity} onChange={event => update('capacity', event.target.value)} placeholder="Bookings/day, units/day, seats…" />
            </div>
          </Section>

          {(draft.businessModels.includes('Service business') || draft.businessModels.includes('Appointment')) && (
            <Section title="Appointments & Service Delivery" description="Shown when the business model indicates a service or appointment workflow.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input id="bp-duration" label="Typical appointment duration" value={draft.appointmentDuration} onChange={event => update('appointmentDuration', event.target.value)} />
                <Input id="bp-booking-rules" label="Booking rules" value={draft.bookingRules} onChange={event => update('bookingRules', event.target.value)} />
                <Input id="bp-service-fulfillment" label="Fulfillment / delivery" value={draft.fulfillment} onChange={event => update('fulfillment', event.target.value)} />
              </div>
            </Section>
          )}

          {(draft.businessModels.includes('Product sales') || draft.businessModels.includes('Marketplace')) && (
            <Section title="Product Fulfillment" description="Shown for physical-product or marketplace models where inventory and delivery context matters.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input id="bp-inventory" label="Inventory model" value={draft.inventory} onChange={event => update('inventory', event.target.value)} />
                <Input id="bp-shipping" label="Shipping / delivery areas" value={draft.shipping} onChange={event => update('shipping', event.target.value)} />
                <Input id="bp-fulfillment" label="Fulfillment method" value={draft.fulfillment} onChange={event => update('fulfillment', event.target.value)} />
              </div>
            </Section>
          )}

          <Section title="Payments & Commercial" description="Keep sensitive financial detail minimal. Prefer connected payment/accounting data for authoritative metrics.">
            <div className="space-y-4">
              <div><div className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Accepted payment methods</div><ToggleChips values={paymentOptions} selected={draft.acceptedPayments} onChange={values => update('acceptedPayments', values)} ariaLabel="Payment methods" /></div>
              <div><div className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Accepted currencies</div><ToggleChips values={currencyOptions.map(option => option.value)} selected={draft.acceptedCurrencies} onChange={values => update('acceptedCurrencies', values)} ariaLabel="Accepted currencies" /></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input id="bp-payment-terms" label="Payment terms" value={draft.paymentTerms} onChange={event => update('paymentTerms', event.target.value)} placeholder="Due on receipt, Net 30…" />
                <Input id="bp-credit-terms" label="Credit terms" value={draft.creditTerms} onChange={event => update('creditTerms', event.target.value)} />
                <Input id="bp-deposit" label="Deposit requirements" value={draft.depositRequirements} onChange={event => update('depositRequirements', event.target.value)} />
                <Input id="bp-atv" label="Average transaction / order value" value={draft.averageTransactionValue} onChange={event => update('averageTransactionValue', event.target.value)} placeholder="Amount or range" />
                <Input id="bp-commercial-cycle" label="Typical commercial sales cycle" value={draft.typicalSalesCycle} onChange={event => update('typicalSalesCycle', event.target.value)} />
                <Input id="bp-recurring-revenue" label="Recurring revenue model" value={draft.recurringRevenue} onChange={event => update('recurringRevenue', event.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Policies & Constraints" description="Operational rules are execution guardrails. They should inform actions only after the relevant permission/autonomy layer authorizes them.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextAreaField id="bp-refund" label="Refund policy" value={draft.refundPolicy} onChange={value => update('refundPolicy', value)} />
              <TextAreaField id="bp-cancellation" label="Cancellation policy" value={draft.cancellationPolicy} onChange={value => update('cancellationPolicy', value)} />
              <TextAreaField id="bp-discount" label="Discount rules" value={draft.discountRules} onChange={value => update('discountRules', value)} />
              <TextAreaField id="bp-approval" label="Approval requirements" value={draft.approvalRequirements} onChange={value => update('approvalRequirements', value)} />
              <TextAreaField id="bp-communication-rules" label="Customer communication rules" value={draft.communicationRules} onChange={value => update('communicationRules', value)} />
              <TextAreaField id="bp-constraints" label="Operational constraints" value={draft.operationalConstraints} onChange={value => update('operationalConstraints', value)} />
            </div>
          </Section>

          <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="text-xs font-semibold text-[var(--text-primary)]">Stage 3 score: {stage3Complete}%</div><p className="mt-1 text-[10px] text-[var(--text-muted)]">Conditional sections appear only when their business model makes them relevant.</p></div>
            <Button variant="primary" size="md" isLoading={savingStage === 3} onClick={() => saveStage(3)} leftIcon={<Save className="h-4 w-4" />}>Save Operations</Button>
          </div>
        </Card>
      )}

      <Card padding="md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex gap-3"><Gauge className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-secondary)]" /><div><div className="text-xs font-semibold text-[var(--text-primary)]">Score = context coverage</div><p className="mt-1 text-[10px] leading-relaxed text-[var(--text-muted)]">It measures how much APEX knows, not how successful the business is.</p></div></div>
          <div className="flex gap-3"><FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-secondary)]" /><div><div className="text-xs font-semibold text-[var(--text-primary)]">Declared facts stay attributable</div><p className="mt-1 text-[10px] leading-relaxed text-[var(--text-muted)]">User-provided facts remain distinct from connected, observed, calculated and inferred context.</p></div></div>
          <div className="flex gap-3"><Target className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-secondary)]" /><div><div className="text-xs font-semibold text-[var(--text-primary)]">Goals do not equal permission</div><p className="mt-1 text-[10px] leading-relaxed text-[var(--text-muted)]">Goals can guide recommendations; execution still belongs to the separate autonomy/permission layer.</p></div></div>
        </div>
      </Card>
    </div>
  );
};
