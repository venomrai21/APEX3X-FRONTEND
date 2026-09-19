import React, { createContext, useContext, useEffect, useState } from 'react';
import { NavItemKey, Organisation, User, Workspace } from '../types';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
}

interface AppContextType {
  organisation: Organisation;
  updateOrganisation: (data: Partial<Organisation>) => void;
  currentWorkspace: Workspace | null;
  availableWorkspaces: Workspace[];
  currentUser: User | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  updateWorkspaceIdentity: (data: Partial<Workspace>) => void;
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

const INITIAL_ORGANISATION: Organisation = {
  id: 'apex-organisation',
  name: 'APEX',
  shortName: 'APEX',
};

const INITIAL_WORKSPACE: Workspace = {
  id: 'apex-workspace',
  name: 'APEX',
  slug: 'apex',
  industry: '',
  website: '',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  verificationStatus: 'unverified',
  organisationId: INITIAL_ORGANISATION.id,
  createdAt: '',
};

const getStoredTheme = (): ThemeMode => 'dark';

const applyTheme = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : mode;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organisation, setOrganisation] = useState<Organisation>(INITIAL_ORGANISATION);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(INITIAL_WORKSPACE);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<Workspace[]>([INITIAL_WORKSPACE]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState<NavItemKey>('dashboard');
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredTheme);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [connectDrawerOpen, setConnectDrawerOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [subWorkspaceOpen, setSubWorkspaceOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const updateOrganisation = (data: Partial<Organisation>) => {
    setOrganisation(previous => ({ ...previous, ...data }));
  };

  const updateWorkspaceIdentity = (data: Partial<Workspace>) => {
    if (!currentWorkspace) return;
    const updated = { ...currentWorkspace, ...data };
    setCurrentWorkspace(updated);
    setAvailableWorkspaces(workspaces => workspaces.map(workspace => workspace.id === updated.id ? updated : workspace));
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
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
    setCurrentUser(previous => previous ? { ...previous, workspaceId: target.id } : previous);
    triggerRefresh();
    addToast({ type: 'info', title: 'Workspace switched', description: `Now operating in ${target.name}.` });
  };

  const refreshWorkspaces = async () => {
    setAvailableWorkspaces(previous => previous);
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
      organisation,
      updateOrganisation,
      currentWorkspace,
      availableWorkspaces,
      currentUser,
      setCurrentWorkspace,
      updateWorkspaceIdentity,
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
