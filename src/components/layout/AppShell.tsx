import React, { useState } from 'react';
import {
  LayoutDashboard, Bot, FileText, TrendingUp, Users, Building, MessageSquare, Calendar,
  GitPullRequest, CreditCard, Zap, Plug, Sparkles, Shield, Search, Bell,
  ChevronDown, Menu, X, CheckCircle2, AlertCircle, Command,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavItemKey } from '../../types';
import { APEXReveal, NavigationMenu, Sidebar } from '../apex3x';
import { CommandPalette } from './CommandPalette';
import { ConnectDrawer } from './ConnectDrawer';
import { NotificationDrawer } from './NotificationDrawer';
import { OnboardingModal } from './OnboardingModal';
import { SubWorkspaceModal } from './SubWorkspaceModal';

interface NavSection {
  title: string;
  items: { key: NavItemKey; label: string; icon: React.ReactNode; badge?: string }[];
}

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentWorkspace, availableWorkspaces, currentUser, activeNav, setActiveNav, switchWorkspace, setCommandPaletteOpen, setNotificationDrawerOpen, setOnboardingOpen, setSubWorkspaceOpen, toasts, removeToast } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const navSections: NavSection[] = [
    { title: 'Operational Command', items: [
      { key: 'dashboard', label: 'Command Center', icon: <LayoutDashboard className="w-4 h-4" /> },
      { key: 'brain', label: 'Autonomous Brain', icon: <Bot className="w-4 h-4" /> },
      { key: 'insights', label: 'Business Insights', icon: <Sparkles className="w-4 h-4" /> },
    ]},
    { title: 'Attract & Capture', items: [
      { key: 'forms', label: 'Forms & Web Capture', icon: <FileText className="w-4 h-4" /> },
      { key: 'marketing', label: 'Growth & Ad Intelligence', icon: <TrendingUp className="w-4 h-4" /> },
    ]},
    { title: 'Qualify & Convert', items: [
      { key: 'leads', label: 'CRM & Qualified Leads', icon: <Users className="w-4 h-4" /> },
      { key: 'customers', label: 'Customer Directory', icon: <Building className="w-4 h-4" /> },
    ]},
    { title: 'Communicate', items: [{ key: 'conversations', label: 'Unified Inbox', icon: <MessageSquare className="w-4 h-4" /> }]},
    { title: 'Book & Schedule', items: [{ key: 'bookings', label: 'Bookings & Calendar', icon: <Calendar className="w-4 h-4" /> }]},
    { title: 'Sell & Revenue', items: [
      { key: 'pipeline', label: 'Sales Pipeline', icon: <GitPullRequest className="w-4 h-4" /> },
      { key: 'invoices', label: 'Invoices & Payments', icon: <CreditCard className="w-4 h-4" /> },
    ]},
    { title: 'Automate', items: [{ key: 'workflows', label: 'Workflows & Rules', icon: <Zap className="w-4 h-4" /> }]},
    { title: 'Connected Ecosystem', items: [
      { key: 'integrations', label: 'Integrations Hub', icon: <Plug className="w-4 h-4" /> },
      { key: 'ai_hub', label: 'AI Provider Hub (BYOK)', icon: <Sparkles className="w-4 h-4" /> },
    ]},
    { title: 'Governance', items: [
      { key: 'team', label: 'Team & Security Audit', icon: <Shield className="w-4 h-4" /> },
      { key: 'billing', label: 'Billing & Entitlements', icon: <CreditCard className="w-4 h-4" /> },
    ]},
  ];

  const workspaceName = currentWorkspace?.name || 'Workspace unavailable';
  const userName = currentUser?.name || 'Account unavailable';
  const userRole = currentUser?.role;

  return (
    <div className="min-h-screen bg-[#060609] text-zinc-200 flex flex-col antialiased selection:bg-white/20 selection:text-white">
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:flex w-64 flex-col bg-[#09090e] border-r border-white/[0.07] shrink-0 select-none">
          <div className="p-4 border-b border-white/[0.07] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-serif-display font-bold text-base">A</div>
            <div><div className="flex items-center gap-1.5"><span className="font-serif-display font-bold text-sm tracking-wider text-white">APEX3X</span><span className="text-[9px] px-1 py-0.2 rounded bg-white/[0.08] text-zinc-200 border border-white/[0.12] font-mono font-semibold">OS</span></div><p className="text-[10px] text-zinc-400 tracking-tight">Autonomous Business OS</p></div>
          </div>
          <div className="p-3 border-b border-white/[0.06] bg-[#07070b]">
            <div className="relative">
              <div className="px-1 pb-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Workspace</div>
              <button onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)} className="w-full flex items-center justify-between p-2 rounded-lg bg-[#0e0e16] border border-white/[0.08] hover:border-white/[0.14] transition-all cursor-pointer text-left group">
                <div className="truncate pr-2"><p className="text-xs font-semibold text-zinc-100 truncate group-hover:text-white">{workspaceName}</p><div className="flex items-center gap-1.5 mt-0.5">{currentWorkspace ? (currentWorkspace.verificationStatus === 'verified' ? <span className="inline-flex items-center gap-1 text-[10px] text-zinc-300"><CheckCircle2 className="w-2.5 h-2.5" /> Verified Entity</span> : <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400"><AlertCircle className="w-2.5 h-2.5" /> Verification Pending</span>) : <span className="text-[10px] text-zinc-500">Not connected</span>}</div></div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
              </button>
              {workspaceMenuOpen && <div className="absolute top-full left-0 w-full mt-1.5 p-1.5 bg-[#0e0e16] border border-white/[0.12] rounded-lg shadow-2xl z-30 space-y-1"><div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Sub Workspaces</div>{availableWorkspaces.length === 0 ? <div className="px-2 py-2 text-[11px] text-zinc-500">No sub workspaces available.</div> : availableWorkspaces.map(ws => <button key={ws.id} onClick={() => { switchWorkspace(ws.id); setWorkspaceMenuOpen(false); }} className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${ws.id === currentWorkspace?.id ? 'bg-white/[0.08] text-white font-semibold' : 'text-zinc-300 hover:bg-white/[0.06]'}`}><span className="truncate">{ws.name}</span>{ws.id === currentWorkspace?.id && <CheckCircle2 className="w-3 h-3 text-white shrink-0 ml-1" />}</button>)}<div className="pt-1 mt-1 border-t border-white/[0.06]"><button onClick={() => { setWorkspaceMenuOpen(false); setSubWorkspaceOpen(true); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-zinc-200 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer text-left">Sub Workspace</button></div></div>}
            </div>
          </div>
          <Sidebar sections={navSections} activeKey={activeNav} onSelect={(key) => setActiveNav(key as NavItemKey)} />
          <div className="p-3 border-t border-white/[0.07] bg-[#07070a] flex items-center text-xs"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-white/[0.08] text-white border border-white/[0.12] flex items-center justify-center text-[10px] font-semibold">{currentUser?.name ? currentUser.name.charAt(0) : '—'}</div><div className="truncate"><p className="text-[11px] font-medium text-zinc-200 truncate">{userName}</p>{userRole && <p className="text-[9px] text-zinc-500 capitalize">{userRole}</p>}</div></div></div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-14 border-b border-white/[0.08] bg-[#08080d]/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
            <div className="flex items-center gap-3"><button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05]">{mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button><div className="flex items-center gap-2"><span className="text-xs font-mono text-zinc-500 hidden sm:inline">APEX3X</span><span className="text-zinc-600 hidden sm:inline">/</span><NavigationMenu sections={navSections} activeKey={activeNav} onSelect={(key) => setActiveNav(key as NavItemKey)} /></div></div>
            <div className="flex items-center gap-2 sm:gap-3"><button onClick={() => setCommandPaletteOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e0e16] border border-white/[0.08] hover:border-white/[0.16] text-zinc-400 hover:text-zinc-200 text-xs transition-all cursor-pointer"><Search className="w-3.5 h-3.5 text-zinc-500" /><span className="hidden sm:inline">Search commands...</span><kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-mono text-zinc-400 bg-white/[0.06] border border-white/[0.08] rounded"><Command className="w-2.5 h-2.5" /> K</kbd></button><button onClick={() => setNotificationDrawerOpen(true)} className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05] transition-colors" title="Decision Feed"><Bell className="w-4 h-4" /></button><button onClick={() => setOnboardingOpen(true)} className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border cursor-pointer bg-[#0e0e16] text-zinc-200 border-white/[0.12] hover:border-white/[0.2] hover:text-white"><Building className="w-3 h-3" /><span>Business Profile</span></button></div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#060609]"><div className="max-w-7xl mx-auto w-full"><APEXReveal>{children}</APEXReveal></div></main>
        </div>
      </div>

      {mobileMenuOpen && <div className="fixed inset-0 z-50 lg:hidden flex"><div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} /><div className="relative w-72 bg-[#09090e] border-r border-white/[0.1] flex flex-col p-4 z-10 overflow-y-auto"><div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold">A</div><span className="font-serif-display font-bold text-white text-sm">APEX3X</span></div><button onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button></div><Sidebar sections={navSections} activeKey={activeNav} onSelect={(key) => setActiveNav(key as NavItemKey)} onMobileSelect={() => setMobileMenuOpen(false)} mobile /></div></div>}

      <CommandPalette /><ConnectDrawer /><NotificationDrawer /><OnboardingModal /><SubWorkspaceModal />
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">{toasts.map(toast => <div key={toast.id} className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl transition-all duration-200 flex items-start gap-3 ${toast.type === 'success' ? 'bg-[#111111] border-white/[0.16] text-zinc-200' : toast.type === 'warning' ? 'bg-[#111111] border-white/[0.16] text-zinc-200' : toast.type === 'error' ? 'bg-[#111111] border-white/[0.16] text-zinc-200' : 'bg-[#0d0d16] border-white/[0.12] text-zinc-200'}`}><div className="shrink-0 mt-0.5">{toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-zinc-300" />}{toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-zinc-300" />}{toast.type === 'error' && <AlertCircle className="w-4 h-4 text-zinc-300" />}{toast.type === 'info' && <Bot className="w-4 h-4 text-zinc-300" />}</div><div className="flex-1 min-w-0"><p className="text-xs font-semibold">{toast.title}</p>{toast.description && <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{toast.description}</p>}</div><button onClick={() => removeToast(toast.id)} className="text-zinc-500 hover:text-zinc-300 p-0.5 shrink-0"><X className="w-3 h-3" /></button></div>)}</div>
    </div>
  );
};
