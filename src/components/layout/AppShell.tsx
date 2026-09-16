import React, { useMemo, useState } from 'react';
import { Activity, Bell, Building2, Calendar, ChevronDown, CircleDollarSign, Command, FileText, GitPullRequest, LayoutDashboard, Menu, MessageSquare, PanelLeft, Plug, Search, Settings2, Shield, Sparkles, Users, Workflow, X, Megaphone, Image, Share2, ListFilter, ListTodo, History, BarChart3, ShoppingBag, UserRoundCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavItemKey } from '../../types';
import { can, PermissionResource } from '../../security/permissions';
import { APEXReveal, NavigationMenu, Sidebar } from '../apex3x';
import { WorkspaceBrand } from '../workspace/WorkspaceBrand';
import { CommandPalette } from './CommandPalette';
import { ConnectDrawer } from './ConnectDrawer';
import { NotificationDrawer } from './NotificationDrawer';
import { OnboardingModal } from './OnboardingModal';
import { SubWorkspaceModal } from './SubWorkspaceModal';
import { GlobalCreate } from './GlobalCreate';
import { useSidebarInteraction } from './useSidebarInteraction';

interface NavItem { key: NavItemKey; label: string; icon: React.ReactNode; resource: PermissionResource; }
interface NavSection { title: string; items: NavItem[]; }

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentWorkspace, availableWorkspaces, currentUser, activeNav, setActiveNav, switchWorkspace, setCommandPaletteOpen, setNotificationDrawerOpen, setOnboardingOpen, setSubWorkspaceOpen, toasts, removeToast } = useApp();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const { collapsed, mobileOpen, dragX, drawerRef, mobileTriggerRef, toggleCollapsed, openMobile, closeMobile, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel, edgeWidth } = useSidebarInteraction();

  const navSections = useMemo<NavSection[]>(() => [
    { title: 'Command center', items: [{ key: 'dashboard', label: 'Command Center', icon: <LayoutDashboard className="size-4" />, resource: 'command_center' }] },
    { title: 'Unified inbox', items: [{ key: 'unified_inbox', label: 'Unified Inbox', icon: <MessageSquare className="size-4" />, resource: 'inbox' }] },
    { title: 'Attract & capture', items: [
      { key: 'campaigns', label: 'Campaigns', icon: <Megaphone className="size-4" />, resource: 'campaigns' },
      { key: 'advertising', label: 'Advertising', icon: <BarChart3 className="size-4" />, resource: 'campaigns' },
      { key: 'creatives', label: 'Creative Library', icon: <Image className="size-4" />, resource: 'creatives' },
      { key: 'social', label: 'Social Publishing', icon: <Share2 className="size-4" />, resource: 'social' },
      { key: 'forms', label: 'Forms & Web Capture', icon: <FileText className="size-4" />, resource: 'forms' },
      { key: 'growth', label: 'Growth Intelligence', icon: <Activity className="size-4" />, resource: 'campaigns' },
    ] },
    { title: 'Qualify & convert', items: [
      { key: 'leads', label: 'Leads', icon: <Users className="size-4" />, resource: 'leads' },
      { key: 'qualified_leads', label: 'Qualified Leads', icon: <UserRoundCheck className="size-4" />, resource: 'leads' },
      { key: 'customers', label: 'Customers', icon: <Building2 className="size-4" />, resource: 'customers' },
    ] },
    { title: 'Book & schedule', items: [
      { key: 'bookings', label: 'Bookings', icon: <Calendar className="size-4" />, resource: 'bookings' },
      { key: 'calendar', label: 'Calendar', icon: <Calendar className="size-4" />, resource: 'bookings' },
    ] },
    { title: 'Sell & revenue', items: [
      { key: 'pipeline', label: 'Sales Pipeline', icon: <GitPullRequest className="size-4" />, resource: 'sales' },
      { key: 'orders', label: 'Sales / Orders', icon: <ShoppingBag className="size-4" />, resource: 'sales' },
      { key: 'invoices', label: 'Invoices & Payments', icon: <CircleDollarSign className="size-4" />, resource: 'invoices' },
      { key: 'revenue', label: 'Revenue Intelligence', icon: <BarChart3 className="size-4" />, resource: 'sales' },
    ] },
    { title: 'Automate', items: [
      { key: 'workflows', label: 'Workflows', icon: <Workflow className="size-4" />, resource: 'workflows' },
      { key: 'rules', label: 'Rules', icon: <ListFilter className="size-4" />, resource: 'workflows' },
      { key: 'tasks', label: 'Tasks', icon: <ListTodo className="size-4" />, resource: 'tasks' },
      { key: 'automation_runs', label: 'Automation Runs', icon: <History className="size-4" />, resource: 'workflows' },
    ] },
    { title: 'Connected ecosystem', items: [
      { key: 'integrations', label: 'Integrations Hub', icon: <Plug className="size-4" />, resource: 'integrations' },
      { key: 'ai_hub', label: 'AI Provider Hub', icon: <Sparkles className="size-4" />, resource: 'ai' },
    ] },
    { title: 'Governance', items: [
      { key: 'team', label: 'Team & Permissions', icon: <Users className="size-4" />, resource: 'team' },
      { key: 'security', label: 'Security & Audit', icon: <Shield className="size-4" />, resource: 'audit' },
      { key: 'billing', label: 'Billing & Entitlements', icon: <CircleDollarSign className="size-4" />, resource: 'billing' },
      { key: 'workspace_settings', label: 'Workspace Settings', icon: <Settings2 className="size-4" />, resource: 'workspace' },
    ] },
  ].map(section => ({ ...section, items: section.items.filter(item => can(currentUser, item.resource, 'view')) })).filter(section => section.items.length > 0), [currentUser]);

  const userName = currentUser?.name || 'Account unavailable';
  const selectNav = (key: string) => setActiveNav(key as NavItemKey);
  const drawerTransform = dragX !== null ? `translateX(${dragX}px)` : mobileOpen ? 'translateX(0)' : 'translateX(-100%)';
  const drawerTransition = dragX === null ? 'transform 280ms cubic-bezier(0.4,0,0.2,1)' : 'none';

  return <div className="h-screen min-h-0 overflow-hidden bg-[var(--background)] text-[var(--text-primary)] flex flex-col antialiased">
    <header className="h-14 shrink-0 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between px-3 sm:px-5 lg:px-6 z-40">
      <div className="flex min-w-0 items-center gap-3">
        <button ref={mobileTriggerRef} onClick={() => mobileOpen ? closeMobile() : openMobile()} className="lg:hidden inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
        <div className="flex items-center gap-2 shrink-0"><div className="size-7 rounded-[var(--radius-sm)] bg-[var(--text-primary)] flex items-center justify-center text-[var(--background)] font-semibold text-sm">A</div><span className="font-brand font-semibold text-xs tracking-wider">APEX3X</span><span className="text-[9px] px-1 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] font-mono font-semibold">OS</span></div>
        <div className="hidden sm:block h-5 w-px bg-[var(--border)]" />
        <div className="relative min-w-0">
          <button onClick={() => setWorkspaceMenuOpen(v => !v)} className="flex max-w-[240px] items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 hover:bg-[var(--surface)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]" aria-label="Select workspace" aria-expanded={workspaceMenuOpen}><WorkspaceBrand workspace={currentWorkspace} compact /><ChevronDown className="size-3.5 shrink-0 text-[var(--text-muted)]" /></button>
          {workspaceMenuOpen && <div className="absolute left-0 top-full mt-1.5 w-64 p-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-[var(--radius-sm)] shadow-[0_16px_32px_-20px_rgba(0,0,0,0.95)] z-50"><div className="px-2 py-1 text-[10px] font-medium text-[var(--text-muted)]">Workspaces</div>{availableWorkspaces.length === 0 ? <div className="px-2 py-2 text-[11px] text-[var(--text-muted)]">No workspaces available.</div> : availableWorkspaces.map(ws => <button key={ws.id} onClick={() => { switchWorkspace(ws.id); setWorkspaceMenuOpen(false); }} className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] ${ws.id === currentWorkspace?.id ? 'bg-[var(--surface-2)] text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'}`}><WorkspaceBrand workspace={ws} compact />{ws.id === currentWorkspace?.id && <span aria-hidden="true">✓</span>}</button>)}<div className="pt-1 mt-1 border-t border-[var(--border)]"><button onClick={() => { setWorkspaceMenuOpen(false); setSubWorkspaceOpen(true); }} className="w-full px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] text-left">Sub workspace</button></div></div>}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden lg:block"><NavigationMenu sections={navSections} activeKey={activeNav} onSelect={selectNav} /></div>
        <button onClick={() => setCommandPaletteOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]" aria-label="Global search"><Search className="size-3.5 text-[var(--text-muted)]" /><span className="hidden sm:inline">Search anything...</span><kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-[var(--surface-elevated)] border border-[var(--border)] rounded"><Command className="size-2.5" /> K</kbd></button>
        <GlobalCreate />
        <button onClick={() => setNotificationDrawerOpen(true)} className="relative p-2 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]" title="APEX intelligence and activity" aria-label="Open APEX intelligence and activity"><Bell className="size-4" /></button>
        <button onClick={() => setActiveNav('brain')} className="hidden sm:inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]" title="APEX intelligence" aria-label="Open APEX intelligence"><Sparkles className="size-4" /></button>
        <button onClick={() => setOnboardingOpen(true)} className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[11px] font-medium border bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]"><Building2 className="size-3" /> Business setup</button>
      </div>
    </header>

    <div className="min-h-0 flex-1 flex overflow-hidden">
      <aside className={`${collapsed ? 'w-16' : 'w-[280px]'} hidden lg:flex min-h-0 flex-col bg-[var(--sidebar)] border-r border-[var(--border)] shrink-0 select-none overflow-hidden transition-[width] duration-200 ease-out`} aria-label="Primary navigation">
        <div className={`h-12 shrink-0 border-b border-[var(--border)] flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-3'}`}>{!collapsed && <p className="text-[10px] font-medium text-[var(--text-muted)]">Business operating system</p>}<button type="button" onClick={toggleCollapsed} className="inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed}><PanelLeft className="size-4" /></button></div>
        <Sidebar sections={navSections} activeKey={activeNav} onSelect={selectNav} collapsed={collapsed} />
        <div className={`shrink-0 border-t border-[var(--border)] bg-[var(--sidebar)] ${collapsed ? 'p-2 flex justify-center' : 'p-3'}`}><button type="button" className={`flex items-center ${collapsed ? 'justify-center size-9' : 'w-full'} gap-2 rounded-[var(--radius-sm)] text-left hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]`} aria-label="Open account menu" title={collapsed ? userName : undefined}><div className="size-7 rounded-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] flex items-center justify-center text-[10px] font-semibold shrink-0">{currentUser?.name ? currentUser.name.charAt(0) : '—'}</div>{!collapsed && <div className="truncate"><p className="text-[11px] font-medium text-[var(--text-secondary)] truncate">{userName}</p>{currentUser?.role && <p className="text-[9px] text-[var(--text-muted)] capitalize">{currentUser.role.replace('_', ' ')}</p>}</div>}</button></div>
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-[var(--background)] p-4 sm:p-6 lg:p-8"><div className="max-w-7xl mx-auto w-full"><div className="mb-5 hidden sm:flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]"><span>APEX OS</span><span>/</span><span>{navSections.find(section => section.items.some(item => item.key === activeNav))?.title || 'Workspace'}</span><span>/</span><span className="text-[var(--text-secondary)]">{navSections.flatMap(section => section.items).find(item => item.key === activeNav)?.label || 'Command Center'}</span></div><APEXReveal>{children}</APEXReveal></div></main>
    </div>

    <div className={`fixed inset-0 z-[60] lg:hidden ${mobileOpen || dragX !== null ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!mobileOpen && dragX === null}>
      <div className={`absolute inset-0 bg-black/80 transition-opacity duration-280 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => closeMobile()} />
      <aside ref={drawerRef} className="absolute left-0 top-0 bottom-0 w-[min(19rem,88vw)] bg-[var(--sidebar)] border-r border-[var(--border)] flex flex-col overflow-hidden shadow-[16px_0_48px_-32px_rgba(0,0,0,0.95)] touch-pan-y" style={{ transform: drawerTransform, transition: drawerTransition }} onPointerDown={event => handlePointerDown(event, 'close-drawer')} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel}>
        <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-[var(--border)]"><WorkspaceBrand workspace={currentWorkspace} compact /><button type="button" onClick={() => closeMobile()} className="inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]" aria-label="Close navigation"><X className="size-5" /></button></div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain"><Sidebar sections={navSections} activeKey={activeNav} onSelect={selectNav} onMobileSelect={() => closeMobile()} mobile /></div>
        <div className="shrink-0 border-t border-[var(--border)] p-3"><div className="flex items-center gap-2"><div className="size-7 rounded-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] flex items-center justify-center text-[10px] font-semibold">{currentUser?.name ? currentUser.name.charAt(0) : '—'}</div><div className="truncate"><p className="text-[11px] font-medium text-[var(--text-secondary)] truncate">{userName}</p>{currentUser?.role && <p className="text-[9px] text-[var(--text-muted)] capitalize">{currentUser.role.replace('_', ' ')}</p>}</div></div></div>
      </aside>
    </div>
    {!mobileOpen && <div className="fixed left-0 top-14 bottom-0 z-[55] lg:hidden touch-pan-y" style={{ width: edgeWidth }} onPointerDown={event => handlePointerDown(event, 'open-edge')} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel} aria-hidden="true" />}

    <CommandPalette /><ConnectDrawer /><NotificationDrawer /><OnboardingModal /><SubWorkspaceModal />
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">{toasts.map(toast => <div key={toast.id} role="status" className="pointer-events-auto min-w-[280px] max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3 shadow-[0_16px_32px_-20px_rgba(0,0,0,0.95)]"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold">{toast.title}</p>{toast.description && <p className="mt-0.5 text-[11px] leading-5 text-[var(--text-secondary)]">{toast.description}</p>}</div><button onClick={() => removeToast(toast.id)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label="Dismiss notification">×</button></div></div>)}</div>
  </div>;
};
