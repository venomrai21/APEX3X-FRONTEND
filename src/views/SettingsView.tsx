import React, { useState, useEffect } from 'react';
import { ShieldCheck, Save, Upload, Sun, Moon, Monitor, Info } from 'lucide-react';
import { useApp, ThemeMode } from '../context/AppContext';
import { api } from '../api/client';
import { Workspace } from '../types';
import { Card, Button, Badge, Input, Select, APEXReveal } from '../components/apex3x';

type WorkspaceWithBrand = Workspace & { logoUrl?: string };

const themeOptions: Array<{ value: ThemeMode; label: string; icon: React.ReactNode }> = [
  { value: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
  { value: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
  { value: 'system', label: 'System', icon: <Monitor className="w-3.5 h-3.5" /> },
];

type InfoLabelProps = {
  htmlFor: string;
  label: string;
  details: string;
};

const InfoLabel: React.FC<InfoLabelProps> = ({ htmlFor, label, details }) => (
  <label htmlFor={htmlFor} className="relative inline-flex w-fit items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] tracking-wide group">
    <span>{label}</span>
    <span
      aria-hidden="true"
      className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[var(--border-strong)] text-[9px] font-semibold text-[var(--text-muted)] transition-colors group-hover:border-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
    >
      <Info className="h-2.5 w-2.5" />
    </span>
    <span
      role="tooltip"
      className="pointer-events-none invisible absolute left-0 top-full z-30 mt-2 w-72 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[11px] font-normal leading-relaxed tracking-normal text-[var(--text-secondary)] opacity-0 shadow-xl transition-[opacity,visibility] duration-100 group-hover:visible group-hover:opacity-100"
    >
      {details}
    </span>
  </label>
);

type IntlConstructor = typeof Intl & {
  supportedValuesOf?: (key: 'currency' | 'timeZone') => string[];
};

const intlWithSupportedValues = Intl as IntlConstructor;

const currencyCodes = intlWithSupportedValues.supportedValuesOf?.('currency') ?? [
  'AED', 'AUD', 'BRL', 'CAD', 'CHF', 'CNY', 'DKK', 'EUR', 'GBP', 'HKD', 'INR', 'JPY', 'KRW', 'MXN', 'NOK', 'NZD', 'PLN', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR',
];

const timezoneNames = intlWithSupportedValues.supportedValuesOf?.('timeZone') ?? [
  'UTC', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'Europe/Berlin', 'Europe/London', 'Africa/Cairo', 'America/Chicago', 'America/Los_Angeles', 'America/New_York',
];

const currencyOptions = [
  { value: '', label: 'Select currency' },
  ...currencyCodes
    .filter((code, index, values) => values.indexOf(code) === index)
    .sort()
    .map(code => {
      let name = code;
      let symbol = code;
      try {
        name = new Intl.NumberFormat('en', { style: 'currency', currency: code, currencyDisplay: 'name' })
          .formatToParts(1)
          .find(part => part.type === 'currency')?.value ?? code;
        symbol = new Intl.NumberFormat('en', { style: 'currency', currency: code, currencyDisplay: 'symbol' })
          .formatToParts(1)
          .find(part => part.type === 'currency')?.value ?? code;
      } catch {
        // Keep the ISO 4217 code when a runtime cannot format a currency.
      }
      return { value: code, label: `${code} - ${name} (${symbol})` };
    }),
];

const timezoneOptions = [
  { value: '', label: 'Select timezone' },
  ...timezoneNames
    .filter((zone, index, values) => values.indexOf(zone) === index)
    .sort()
    .map(zone => {
      let displayName = zone;
      try {
        displayName = new Intl.DateTimeFormat('en', { timeZone: zone, timeZoneName: 'long' })
          .formatToParts(new Date())
          .find(part => part.type === 'timeZoneName')?.value ?? zone;
      } catch {
        // Keep the IANA timezone identifier when a runtime cannot format a zone.
      }
      return { value: zone, label: `${displayName} (${zone})` };
    }),
];

export const SettingsView: React.FC = () => {
  const { addToast, triggerRefresh, refreshKey, currentWorkspace, currentUser, setCurrentWorkspace, themeMode, setThemeMode } = useApp();
  const [workspace, setWorkspace] = useState<Workspace | null>(currentWorkspace);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('');
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    setWorkspace(currentWorkspace);
    setCompanyName(currentWorkspace?.name || '');
    setTaxId(currentWorkspace?.taxId || '');
    setIndustry(currentWorkspace?.industry || '');
    setWebsite(currentWorkspace?.website || '');
    setAddress(currentWorkspace?.registeredAddress || '');
    setCurrency(currentWorkspace?.currency || '');
    setTimezone(currentWorkspace?.timezone || '');
  }, [currentWorkspace, refreshKey]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await api.updateWorkspace({ name: companyName, taxId, industry, website, registeredAddress: address, currency, timezone });
      setWorkspace(updated);
      setCurrentWorkspace(updated);
      addToast({ type: 'success', title: 'Business Profile Updated', description: 'Business profile changes saved.' });
      triggerRefresh();
    } catch (err) {
      addToast({ type: 'error', title: 'Save failed', description: (err as Error).message });
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
      addToast({ type: 'success', title: 'Verification Updated', description: 'Business verification status updated by the connected service.' });
      triggerRefresh();
    } catch (err) {
      addToast({ type: 'error', title: 'Verification failed', description: (err as Error).message });
    } finally {
      setVerifying(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !workspace) return;
    if (currentUser?.role !== 'admin') {
      addToast({ type: 'error', title: 'Permission denied', description: 'Only workspace administrators can change the workspace logo.' });
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      addToast({ type: 'error', title: 'Unsupported logo', description: 'Use PNG, JPEG, or WebP.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast({ type: 'error', title: 'Logo too large', description: 'Maximum logo size is 2 MB.' });
      return;
    }
    try {
      setUploadingLogo(true);
      const result = await api.uploadWorkspaceLogo(workspace.id, file);
      const updated = { ...workspace, logoUrl: result.logoUrl } as Workspace;
      setWorkspace(updated);
      setCurrentWorkspace(updated);
      addToast({ type: 'success', title: 'Workspace Logo Updated', description: 'The workspace logo is now the shared business brand asset.' });
      triggerRefresh();
    } catch (err) {
      addToast({ type: 'error', title: 'Logo upload failed', description: (err as Error).message });
    } finally {
      setUploadingLogo(false);
    }
  };

  const logoUrl = (workspace as WorkspaceWithBrand | null)?.logoUrl;
  const statusLabel = !workspace ? 'NOT CONNECTED' : workspace.verificationStatus === 'verified' ? 'VERIFIED ENTITY' : workspace.verificationStatus === 'in_review' ? 'IN REVIEW' : 'UNVERIFIED';

  return (
    <div className="space-y-6 pb-12">
      <APEXReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Business Profile & Verification</h2>
              <Badge variant="neutral" size="sm"><ShieldCheck className="w-3 h-3" /> {statusLabel}</Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Business identity, verification state, and localized operating parameters.</p>
          </div>
          <div className="flex items-center gap-3">
            {workspace && workspace.verificationStatus !== 'verified' && <Button variant="secondary" size="md" isLoading={verifying} onClick={handleVerify}>Submit Verification</Button>}
            <Button variant="primary" size="md" isLoading={saving} onClick={handleSave} disabled={!workspace} leftIcon={<Save className="w-4 h-4" />}>Save Changes</Button>
          </div>
        </div>

        <Card padding="md">
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-xs font-semibold text-[var(--text-primary)]">Appearance</div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Choose how APEX3X renders across navigation and subsequent sessions.</p>
            </div>
            <div className="inline-flex w-fit items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1" role="group" aria-label="Theme mode">
              {themeOptions.map(option => <button key={option.value} type="button" aria-pressed={themeMode === option.value} onClick={() => setThemeMode(option.value)} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] ${themeMode === option.value ? 'bg-[var(--bg-brand)] text-[var(--text-on-brand)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'}`}>{option.icon}{option.label}</button>)}
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                {logoUrl ? <img src={logoUrl} alt="Workspace logo" className="h-full w-full object-cover" /> : <span className="text-sm font-semibold text-[var(--text-primary)]">{workspace?.name?.charAt(0) || 'W'}</span>}
              </span>
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">Workspace Brand</div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Shared business identity for the current workspace.</p>
              </div>
            </div>
            <label className={`inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] ${currentUser?.role === 'admin' ? 'cursor-pointer hover:bg-[var(--surface-2)]' : 'cursor-not-allowed opacity-50'}`}>
              <Upload className="w-3.5 h-3.5" />{uploadingLogo ? 'Uploading…' : 'Upload Logo'}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={currentUser?.role !== 'admin' || uploadingLogo} onChange={handleLogoUpload} />
            </label>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]"><ShieldCheck className="w-5 h-5" /></span>
            <div>
              <div className="text-xs font-semibold text-[var(--text-primary)]">Business Verification: {workspace?.verificationStatus || 'Not connected'}</div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Business verification status.</p>
            </div>
          </div>
        </Card>

        <Card padding="lg" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)]">Business Entity Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="operating-company-name" label={<InfoLabel htmlFor="operating-company-name" label="Operating Company Name" details="Enter the legal or operating name your business uses across APEX." />} value={companyName} onChange={e => setCompanyName(e.target.value)} required />
              <Input id="business-id" label={<InfoLabel htmlFor="business-id" label="Business ID" details="Enter the official identifier issued to your business by the relevant government or registration authority." />} value={taxId} onChange={e => setTaxId(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="industry-classification" label={<InfoLabel htmlFor="industry-classification" label="Industry Classification" details="Enter the industry or business category that best describes your organisation." />} value={industry} onChange={e => setIndustry(e.target.value)} />
              <Input id="corporate-website-url" label={<InfoLabel htmlFor="corporate-website-url" label="Corporate Website URL" details="Enter your public business website, including the full address such as https://example.com." />} value={website} onChange={e => setWebsite(e.target.value)} />
            </div>
            <Input id="registered-headquarters-address" label={<InfoLabel htmlFor="registered-headquarters-address" label="Registered Headquarters Address" details="Enter the official registered headquarters address for the business. Include the address details required for formal business records." />} value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)]">Financial & Operational Localization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                id="operating-currency"
                label={<InfoLabel htmlFor="operating-currency" label="Operating Currency" details="Choose the currency your business primarily uses for operating and financial amounts in APEX." />}
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                options={currencyOptions}
              />
              <Select
                id="operating-timezone"
                label={<InfoLabel htmlFor="operating-timezone" label="Operating Timezone" details="Choose the business timezone used for schedules, dates, working hours, and time-based activity in APEX." />}
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                options={timezoneOptions}
              />
            </div>
          </div>
        </Card>
      </APEXReveal>
    </div>
  );
};
