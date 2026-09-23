import React, { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Image } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api, UI_PREVIEW_MODE } from '../../api/client';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organisationName, setOrganisationName] = useState('');
  const [organisationShortName, setOrganisationShortName] = useState('');
  const [organisationLogoUrl, setOrganisationLogoUrl] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceIconUrl, setWorkspaceIconUrl] = useState('');

  useEffect(() => {
    if (!onboardingOpen) return;
    setOrganisationName(organisation.name || '');
    setOrganisationShortName(organisation.shortName || '');
    setOrganisationLogoUrl(organisation.logoUrl || '');
    setWorkspaceName(currentWorkspace?.name || '');
    setWorkspaceIconUrl(currentWorkspace?.iconUrl || '');
  }, [onboardingOpen, organisation, currentWorkspace]);

  if (!onboardingOpen) return null;

  const handleComplete = async () => {
    const trimmedOrganisationName = organisationName.trim();
    const trimmedShortName = organisationShortName.trim();
    const trimmedWorkspaceName = workspaceName.trim();

    if (!trimmedOrganisationName || !trimmedWorkspaceName) {
      addToast({ type: 'warning', title: 'Organisation and Workspace Required', description: 'Enter both an organisation name and a workspace name.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const workspacePatch = {
        name: trimmedWorkspaceName,
        slug: trimmedWorkspaceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        iconUrl: workspaceIconUrl.trim() || undefined,
      };

      updateOrganisation({
        name: trimmedOrganisationName,
        shortName: trimmedShortName || trimmedOrganisationName,
        logoUrl: organisationLogoUrl.trim() || undefined,
      });
      updateWorkspaceIdentity(workspacePatch);

      if (!UI_PREVIEW_MODE) {
        await api.updateWorkspace({
          name: trimmedWorkspaceName,
          logoUrl: workspaceIconUrl.trim() || undefined,
        });
      }

      addToast({
        type: 'success',
        title: 'Workspace identity updated',
        description: 'Continue in Settings → Business Profile to add business context.',
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
      title="Workspace Setup"
      subtitle="Manage your organisation identity and the workspace it operates."
      maxWidth="xl"
    >
      <div className="space-y-6">
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Organisation Identity</p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">The organisation is the top-level business identity shown in APEX.</p>
          </div>
          <Input label="Organisation Name" value={organisationName} onChange={e => setOrganisationName(e.target.value)} placeholder="Organisation name" leftIcon={<Building2 className="w-4 h-4 text-zinc-500" />} />
          <Input label="Organisation Short Name" value={organisationShortName} onChange={e => setOrganisationShortName(e.target.value)} placeholder="Short display name" />
          <Input label="Organisation Logo URL" value={organisationLogoUrl} onChange={e => setOrganisationLogoUrl(e.target.value)} placeholder="Optional logo URL" leftIcon={<Image className="w-4 h-4 text-zinc-500" />} />
        </section>

        <section className="space-y-4 border-t border-white/[0.08] pt-5">
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Workspace Identity</p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">Use the workspace for the operating identity. Business facts belong in Settings → Business Profile.</p>
          </div>
          <Input label="Workspace Name" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} placeholder="Workspace name" leftIcon={<Building2 className="w-4 h-4 text-zinc-500" />} />
          <Input label="Workspace Icon URL" value={workspaceIconUrl} onChange={e => setWorkspaceIconUrl(e.target.value)} placeholder="Optional workspace icon URL" leftIcon={<Image className="w-4 h-4 text-zinc-500" />} />
        </section>

        <div className="flex justify-end border-t border-white/[0.08] pt-5">
          <Button variant="primary" size="md" isLoading={isSubmitting} onClick={handleComplete} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
            Save & Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};
