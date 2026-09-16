import React, { createContext, useContext, useEffect, useState } from 'react';
import { NavItemKey, User, Workspace } from '../types';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
}

interface AppContextType {
  currentWorkspace: Workspace | null;
  availableWorkspaces: Workspace[];
  currentUser: User | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  activeNav: NavItemKey;
  setActiveNav: (nav: NavItemKey) => void;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  connectDrawerOpen: boolean;
  setConnectDrawerOpen: (open: boolean) => void;
  notificationDrawerOpen: boolean;
  setNotificationDrawerOpen: (open: boolean) => void;
  onboardingOpen: boolean;
  setOnboardingOpen: (open: boolean) => void;
  subWorkspaceOpen: boolean;
  setSubWorkspaceOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  refreshKey: number;
  triggerRefresh: () => void;
  isLoadingSession: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'apex3x-theme-mode';
const PREVIEW_WORKSPACE_ID = 'ui-preview-workspace';

const PREVIEW_WORKSPACE: Workspace = {
  id: PREVIEW_WORKSPACE_ID,
  name: 'APEX3X UI Preview',
  slug: 'apex3x-ui-preview',
  industry: 'UI preview',
  website: '',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  verificationStatus: 'unverified',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const PREVIEW_USER: User = {
  id: 'ui-preview-user',
  email: 'ui-preview@apex3x.local',
  name: 'APEX3X UI Preview',
  role: 'owner',
  workspaceId: PREVIEW_WORKSPACE_ID,
};

const getStoredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'system' ? stored : 'dark';
};

const applyTheme = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : mode;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(PREVIEW_WORKSPACE);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<Workspace[]>([PREVIEW_WORKSPACE]);
  const [currentUser, setCurrentUser] = useState<User | null>(PREVIEW_USER);
  const [activeNav, setActiveNav] = useState<NavItemKey>('dashboard');
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredTheme);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [connectDrawerOpen, setConnectDrawerOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [subWorkspaceOpen, setSubWorkspaceOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    applyTheme(mode);
  };

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    window.setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const switchWorkspace = async (workspaceId: string) => {
    const target = availableWorkspaces.find(workspace => workspace.id === workspaceId);
    if (!target) return;
    setCurrentWorkspace(target);
    setCurrentUser({ ...PREVIEW_USER, workspaceId: target.id });
    triggerRefresh();
    addToast({ type: 'info', title: 'Workspace switched', description: `Now previewing ${target.name}.` });
  };

  const refreshWorkspaces = async () => {
    setAvailableWorkspaces(previous => previous.length ? previous : [PREVIEW_WORKSPACE]);
  };

  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (themeMode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = () => applyTheme('system');
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [themeMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(previous => !previous);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider value={{
      currentWorkspace,
      availableWorkspaces,
      currentUser,
      setCurrentWorkspace,
      activeNav,
      setActiveNav,
      switchWorkspace,
      refreshWorkspaces,
      themeMode,
      setThemeMode,
      commandPaletteOpen,
      setCommandPaletteOpen,
      connectDrawerOpen,
      setConnectDrawerOpen,
      notificationDrawerOpen,
      setNotificationDrawerOpen,
      onboardingOpen,
      setOnboardingOpen,
      subWorkspaceOpen,
      setSubWorkspaceOpen,
      toasts,
      addToast,
      removeToast,
      refreshKey,
      triggerRefresh,
      isLoadingSession: false,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
