import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './views/DashboardView';
import { BrainView } from './views/BrainView';
import { BusinessInsightsView } from './views/BusinessInsightsView';
import { LeadsView } from './views/LeadsView';
import { CustomersView } from './views/CustomersView';
import { ConversationsView } from './views/ConversationsView';
import { BookingsView } from './views/BookingsView';
import { PipelineView } from './views/PipelineView';
import { InvoicesView } from './views/InvoicesView';
import { FormsView } from './views/FormsView';
import { MarketingView } from './views/MarketingView';
import { WorkflowsView } from './views/WorkflowsView';
import { ConnectorKernelView } from './views/ConnectorKernelView';
import { AiProviderHubView } from './views/AiProviderHubView';
import { TeamSecurityView } from './views/TeamSecurityView';
import { BillingView } from './views/BillingView';
import { SettingsView } from './views/SettingsView';
import { ModuleSurfaceView } from './views/ModuleSurfaceView';

const GUIDED_SURFACES = new Set([
  'unified_inbox','campaigns','advertising','creatives','social','growth','qualified_leads',
  'calendar','orders','revenue','rules','tasks','automation_runs','security','workspace_settings',
]);

const MainViewRouter: React.FC = () => {
  const { activeNav } = useApp();
  if (GUIDED_SURFACES.has(activeNav)) return <ModuleSurfaceView />;
  switch (activeNav) {
    case 'dashboard': return <DashboardView />;
    case 'brain': return <BrainView />;
    case 'insights': return <BusinessInsightsView />;
    case 'leads': return <LeadsView />;
    case 'customers': return <CustomersView />;
    case 'conversations': return <ConversationsView />;
    case 'unified_inbox': return <ModuleSurfaceView />;
    case 'bookings': return <BookingsView />;
    case 'pipeline': return <PipelineView />;
    case 'invoices': return <InvoicesView />;
    case 'forms': return <FormsView />;
    case 'marketing': return <MarketingView />;
    case 'workflows': return <WorkflowsView />;
    case 'integrations': return <ConnectorKernelView />;
    case 'ai_hub': return <AiProviderHubView />;
    case 'team': return <TeamSecurityView />;
    case 'security': return <TeamSecurityView />;
    case 'billing': return <BillingView />;
    case 'settings': return <SettingsView />;
    case 'workspace_settings': return <ModuleSurfaceView />;
    default: return <DashboardView />;
  }
};

export default function App() {
  return <AppProvider><AppShell><MainViewRouter /></AppShell></AppProvider>;
}
