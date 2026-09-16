import React from 'react';
import { Search, PanelLeft } from 'lucide-react';
import type { APEXPersistentStateOptions } from './contracts';

const STORAGE_PREFIX = 'apex3x:interaction:';

export function useAPEXPersistentState<T>({ key, initial, serialize = JSON.stringify, deserialize = JSON.parse }: APEXPersistentStateOptions<T>) {
  const storageKey = `${STORAGE_PREFIX}${key}`;
  const [value, setValue] = React.useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw == null ? initial : deserialize(raw);
    } catch {
      return initial;
    }
  });

  React.useEffect(() => {
    try { window.localStorage.setItem(storageKey, serialize(value)); } catch { /* persistence is best-effort */ }
  }, [serialize, storageKey, value]);
  return [value, setValue] as const;
}

export function APEXIconButton({ label, tooltip = label, pressed, disabled, onClick, children }: { label: string; tooltip?: string; pressed?: boolean; disabled?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={tooltip}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-transparent text-[var(--text-secondary)] outline-none transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] disabled:pointer-events-none disabled:opacity-40 aria-pressed:bg-[var(--surface-2)] aria-pressed:text-[var(--text-primary)]"
    >
      {children}
    </button>
  );
}

export function APEXCollapseControl({ collapsed, onToggle, mobile = false }: { collapsed: boolean; onToggle: () => void; mobile?: boolean }) {
  return <APEXIconButton label={mobile ? 'Close navigation' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'} pressed={!collapsed} onClick={onToggle}><PanelLeft className="size-4" aria-hidden="true" /></APEXIconButton>;
}

export function APEXToolbarAction({ label, onClick, children }: { label: string; onClick?: () => void; children: React.ReactNode }) {
  return <APEXIconButton label={label} onClick={onClick}>{children}</APEXIconButton>;
}

export function APEXSearchCommand({ onClick }: { onClick?: () => void }) {
  return <APEXToolbarAction label="Search" onClick={onClick}><Search className="size-4" aria-hidden="true" /></APEXToolbarAction>;
}
