import React, { useEffect, useState } from 'react';
import { ShieldCheck, Save, Upload, Sun, Moon, Monitor, Info } from 'lucide-react';
import { useApp, ThemeMode } from '../context/AppContext';
import { api } from '../api/client';
import { Workspace } from '../types';
import { Card, Button, Badge, APEXReveal } from '../components/apex3x';
import { BusinessProfile } from '../components/settings/BusinessProfile';

type WorkspaceWithBrand = Workspace & { logoUrl?: string };

const themeOptions: Array<{ value: ThemeMode; label: string; icon: React.ReactNode }> = [
  { value: 'dark', label: 'Dark', icon: <Moon className="h-3.5 w-3.5" /> },
  { value: 'light', label: 'Light', icon: <Sun className="h-3.5 w-3.5" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-3.5 w-3.5" /> },
];

type InfoLabelProps = { htmlFor: string; label: string; details: string };

const InfoLabel: React.FC<InfoLabelProps> = ({ htmlFor, label, details }) => (
  <label htmlFor={htmlFor} className="relative inline-flex w-fit items-center gap-1.5 text-xs font-medium tracking-wide text-[var(--text-secondary)] group">
    <span>{label}</span>
    <span aria-hidden="true" className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[var(--border-strong)] text-[9px] font-semibold text-[var(--text-muted)] transition-colors group-hover:border-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
      <Info className="h-2.5 w-2.5" />
    </span>
    <span role="tooltip" className="pointer-events-none invisible absolute left-0 top-full z-30 mt-2 w-72 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[11px] font-normal leading-relaxed tracking-normal text-[var(--text-secondary)] opacity-0 shadow-xl transition-[opacity,visibility] duration-100 group-hover:visible group-hover:opacity-100">
      {details}
    </span>
  </label>
);

export const SettingsView: React.FC = () => {
  const { addToast, triggerRefresh, refreshKey, currentWorkspace, currentUser, setCurrentWorkspace, themeMode, setThemeMode } = useApp();
  const [workspace, setWorkspace] = useState<Workspace | null>(currentWorkspace);
  const [verifying, setVerifying] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    setWorkspace(currentWorkspace);
  }, [currentWorkspace, refreshKey]);

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
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Business Profile</h2>
              <Badge variant="neutral" size="sm"><ShieldCheck className="h-3 w-3" /> {statusLabel}</Badge>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Teach APEX what the business is, how it grows, and the operational context that governs it.</p>
          </div>
          <div className="flex items-center gap-3">
            {workspace && workspace.verificationStatus !== 'verified' && <Button variant="secondary" size="md" isLoading={verifying} onClick={handleVerify}>Submit Verification</Button>}
          </div>
        </div>

        <Card padding="md">
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-xs font-semibold text-[var(--text-primary)]">Appearance</div>
              <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">Choose how APEX renders across navigation and subsequent sessions.</p>
            </div>
            <div className="inline-flex w-fit items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1" role="group" aria-label="Theme mode">
              {themeOptions.map(option => (
                <button key={option.value} type="button" aria-pressed={themeMode === option.value} onClick={() => setThemeMode(option.value)} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] ${themeMode === option.value ? 'bg-[var(--bg-brand)] text-[var(--text-on-brand)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'}`}>{option.icon}{option.label}</button>
              ))}
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                {logoUrl ? <img src={logoUrl} alt="Workspace logo" className="h-full w-full object-cover" /> : <span className="text-sm font-semibold text-[var(--text-primary)]">{workspace?.name?.charAt(0) || 'W'}</span>}
              </span>
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">Workspace Brand</div>
                <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">Shared business identity for the current workspace.</p>
              </div>
            </div>
            <label className={`inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] ${currentUser?.role === 'admin' ? 'cursor-pointer hover:bg-[var(--surface-2)]' : 'cursor-not-allowed opacity-50'}`}>
              <Upload className="h-3.5 w-3.5" />{uploadingLogo ? 'Uploading…' : 'Upload Logo'}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={currentUser?.role !== 'admin' || uploadingLogo} onChange={handleLogoUpload} />
            </label>
          </div>
        </Card>

        <BusinessProfile
          workspace={workspace}
          addToast={addToast}
          onWorkspaceUpdated={updated => {
            setWorkspace(updated);
            setCurrentWorkspace(updated);
            triggerRefresh();
          }}
        />

        <Card padding="md">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
            <div>
              <div className="text-xs font-semibold text-[var(--text-primary)]">Business verification: {workspace?.verificationStatus || 'Not connected'}</div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">Verification remains a separate business-status concern. It does not determine whether Stages 2 or 3 are available.</p>
            </div>
          </div>
        </Card>
      </APEXReveal>
    </div>
  );
};
