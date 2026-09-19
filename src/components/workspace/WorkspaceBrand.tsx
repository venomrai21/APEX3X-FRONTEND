import React from 'react';
import { Organisation, Workspace } from '../../types';

type WorkspaceWithBrand = Workspace & { logoUrl?: string };
export interface WorkspaceBrandIdentity { workspaceId: string; name: string; logoUrl?: string; }

export function getWorkspaceBrand(workspace: Workspace | null, organisation?: Organisation): WorkspaceBrandIdentity | null {
  if (!workspace) return null;
  const branded = workspace as WorkspaceWithBrand;
  return {
    workspaceId: branded.id,
    name: branded.name,
    logoUrl: branded.iconUrl || branded.logoUrl || organisation?.logoUrl,
  };
}

interface WorkspaceBrandProps {
  workspace: Workspace | null;
  organisation?: Organisation;
  compact?: boolean;
  className?: string;
}

export const WorkspaceBrand: React.FC<WorkspaceBrandProps> = ({ workspace, organisation, compact = false, className = '' }) => {
  const brand = getWorkspaceBrand(workspace, organisation);
  if (!brand) return null;

  const fallbackLabel = brand.name.trim().charAt(0).toUpperCase() || '—';

  return <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
    {brand.logoUrl
      ? <img src={brand.logoUrl} alt={`${brand.name} logo`} className={`${compact ? 'h-7 w-7 rounded-lg' : 'h-8 w-8 rounded-lg'} shrink-0 border border-[var(--border)] bg-[var(--surface)] object-cover`} />
      : <div className={`${compact ? 'h-7 w-7 rounded-lg text-[10px]' : 'h-8 w-8 rounded-lg text-xs'} flex shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--surface)] font-bold text-[var(--accent)]`}>{fallbackLabel}</div>}
    <span className="min-w-0 truncate text-xs font-semibold text-[var(--text-primary)]">{brand.name}</span>
  </div>;
};
