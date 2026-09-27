import React, { useEffect, useState } from 'react';
import { Save, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Workspace } from '../types';
import { Card, Button, APEXReveal, Input } from '../components/apex3x';

type WorkspaceWithBrand = Workspace & { logoUrl?: string };

export const SettingsView: React.FC = () => {
  const {
    addToast,
    triggerRefresh,
    refreshKey,
    currentWorkspace,
    currentUser,
    setCurrentWorkspace,
  } = useApp();

  const [workspace, setWorkspace] = useState<Workspace | null>(currentWorkspace);
  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || '');
  const [workspaceSlug, setWorkspaceSlug] = useState(currentWorkspace?.slug || '');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    setWorkspace(currentWorkspace);
    setWorkspaceName(currentWorkspace?.name || '');
    setWorkspaceSlug(currentWorkspace?.slug || '');
  }, [currentWorkspace, refreshKey]);

  const saveWorkspace = async () => {
    if (!workspace) return;

    const name = workspaceName.trim();
    const slug = workspaceSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');

    if (!name || !slug) {
      addToast({
        type: 'warning',
        title: 'Workspace details required',
        description: 'Enter a workspace name and URL slug.',
      });
      return;
    }

    try {
      setSaving(true);
      const updated = await api.updateWorkspace({ name, slug });
      setWorkspace(updated);
      setCurrentWorkspace(updated);
      triggerRefresh();
      addToast({
        type: 'success',
        title: 'Workspace settings saved',
        description: 'Workspace configuration was updated.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Unable to update workspace settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !workspace) return;

    if (currentUser?.role !== 'admin') {
      addToast({
        type: 'error',
        title: 'Permission denied',
        description: 'Only workspace administrators can change the workspace logo.',
      });
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      addToast({
        type: 'error',
        title: 'Unsupported logo',
        description: 'Use PNG, JPEG, or WebP.',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'Logo too large',
        description: 'Maximum logo size is 2 MB.',
      });
      return;
    }

    try {
      setUploadingLogo(true);
      const result = await api.uploadWorkspaceLogo(workspace.id, file);
      const updated = { ...workspace, logoUrl: result.logoUrl } as Workspace;
      setWorkspace(updated);
      setCurrentWorkspace(updated);
      triggerRefresh();
      addToast({
        type: 'success',
        title: 'Workspace logo updated',
        description: 'The workspace branding was updated.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Logo upload failed',
        description: error instanceof Error ? error.message : 'Unable to upload the workspace logo.',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const logoUrl = (workspace as WorkspaceWithBrand | null)?.logoUrl;

  return (
    <div className="space-y-6 pb-12">
      <APEXReveal>
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Workspace Settings</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Manage the current workspace. Business information lives in Business Profile.
          </p>
        </div>

        <Card padding="lg">
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Workspace Configuration</h3>
              <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                Configure the workspace identity used inside APEX. This does not replace your business information.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Workspace Name"
                value={workspaceName}
                onChange={event => setWorkspaceName(event.target.value)}
                placeholder="Workspace name"
              />
              <Input
                label="Workspace URL Slug"
                value={workspaceSlug}
                onChange={event => setWorkspaceSlug(event.target.value)}
                placeholder="workspace-name"
              />
            </div>

            <div className="flex justify-end border-t border-[var(--border-subtle)] pt-4">
              <Button variant="primary" size="md" isLoading={saving} onClick={saveWorkspace} leftIcon={<Save className="h-4 w-4" />}>
                Save Workspace
              </Button>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                {logoUrl ? (
                  <img src={logoUrl} alt="Workspace logo" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{workspace?.name?.charAt(0) || 'W'}</span>
                )}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Workspace Branding</h3>
                <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                  Set the logo shown for this workspace across APEX.
                </p>
              </div>
            </div>

            <label className={`inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] ${currentUser?.role === 'admin' ? 'cursor-pointer hover:bg-[var(--surface-2)]' : 'cursor-not-allowed opacity-50'}`}>
              <Upload className="h-3.5 w-3.5" />
              {uploadingLogo ? 'Uploading…' : 'Upload Logo'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                disabled={currentUser?.role !== 'admin' || uploadingLogo}
                onChange={handleLogoUpload}
              />
            </label>
          </div>
        </Card>
      </APEXReveal>
    </div>
  );
};
