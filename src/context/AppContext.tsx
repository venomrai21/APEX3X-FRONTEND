import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workspace, User, NavItemKey } from '../types';
import { api, setActiveWorkspaceId } from '../api/client';

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<Workspace[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState<NavItemKey>('dashboard');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [connectDrawerOpen, setConnectDrawerOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [subWorkspaceOpen, setSubWorkspaceOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const loadSession = async () => {
    setIsLoadingSession(true);
    try {
      const [meRes, wsList] = await Promise.all([api.getMe(), api.getWorkspaces()]);
      setCurrentUser(meRes.user);
      setCurrentWorkspace(meRes.workspace);
      setAvailableWorkspaces(wsList);
      setActiveWorkspaceId(meRes.workspace.id);
    } catch (err) {
      console.error('Failed to load session:', err);
      setCurrentUser(null);
      setCurrentWorkspace(null);
      setAvailableWorkspaces([]);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const switchWorkspace = async (workspaceId: string) => {
    try {
      setActiveWorkspaceId(workspaceId);
      const target = availableWorkspaces.find(w => w.id === workspaceId);
      if (target) {
        setCurrentWorkspace(target);
      } else {
        const wsList = await api.getWorkspaces();
        setAvailableWorkspaces(wsList);
        const match = wsList.find(w => w.id === workspaceId);
        if (match) setCurrentWorkspace(match);
      }
      triggerRefresh();
      if (target) addToast({ type: 'info', title: 'Workspace Switched', description: `Now operating in ${target.name}.` });
    } catch (err) {
      console.error('Failed switching workspace:', err);
    }
  };

  const refreshWorkspaces = async () => {
    try {
      const wsList = await api.getWorkspaces();
      setAvailableWorkspaces(wsList);
    } catch (err) {
      console.error('Failed refreshing workspaces:', err);
    }
  };

  useEffect(() => { loadSession(); }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
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
      isLoadingSession,
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
