import React from 'react';
import { Workspace } from '../../types';

export interface WorkspaceBrandIdentity {
  workspaceId: string;
  name: string;
  logoUrl?: string;
}

export function getWorkspaceBrand(workspace: Workspace | null): WorkspaceBrandIdentity | null {
  if (!workspace) return null;
  return { workspaceId: workspace.id, name: workspace.name, logoUrl: workspace.logoUrl };
}

interface WorkspaceBrandProps {
  workspace: Workspace | null;
  compact?: boolean;
  className?: string;
}

export const WorkspaceBrand: React.FC<WorkspaceBrandProps> = ({ workspace, compact = false, className = '' }) => {
  const brand = getWorkspaceBrand(workspace);
  if (!brand) return null;
  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      {brand.logoUrl ? <img src={brand.logoUrl} alt={`${brand.name} logo`} className={`${compact ? 'h-7 w-7 rounded-lg' : 'h-8 w-8 rounded-lg'} shrink-0 border border-[var(--border)] bg-[var(--surface)] object-cover`} /> : <div className={`${compact ? 'h-7 w-7 rounded-lg text-[10px]' : 'h-8 w-8 rounded-lg text-xs'} flex shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--surface)] font-bold text-[var(--accent)]`}>{brand.name.charAt(0).toUpperCase()}</div>}
      <span className="min-w-0 truncate text-xs font-semibold text-[var(--text-primary)]">{brand.name}</span>
    </div>
  );
};
