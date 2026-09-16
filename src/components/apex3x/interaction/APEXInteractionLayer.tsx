import React from 'react';
import { Search, PanelLeft } from 'lucide-react';
import type { APEXPersistentStateOptions, APEXSidebarState } from './contracts';

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

export interface APEXSidebarStateController {
  state: APEXSidebarState;
  collapsed: boolean;
  mobileOpen: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggle: () => void;
}

export function useAPEXSidebarState(): APEXSidebarStateController {
  const [collapsed, setCollapsed] = useAPEXPersistentState({ key: 'sidebar-collapsed', initial: false });
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mobile, setMobile] = React.useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches);

  React.useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const onChange = () => { setMobile(media.matches); if (!media.matches) setMobileOpen(false); };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = mobile && mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobile, mobileOpen]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey && event.key.toLowerCase() === 'b') || (event.metaKey && event.key === '\\')) {
        event.preventDefault();
        if (mobile) setMobileOpen((value) => !value); else setCollapsed((value) => !value);
      }
      if (event.key === 'Escape' && mobileOpen) setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobile, mobileOpen, setCollapsed]);

  return { state: mobile ? (mobileOpen ? 'mobile-open' : 'hidden') : (collapsed ? 'collapsed' : 'expanded'), collapsed, mobileOpen, setCollapsed, setMobileOpen, toggle: () => mobile ? setMobileOpen((value) => !value) : setCollapsed((value) => !value) };
}
