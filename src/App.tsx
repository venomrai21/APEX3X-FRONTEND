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
import { BusinessProfileView } from './views/BusinessProfileView';
import { ModuleSurfaceView } from './views/ModuleSurfaceView';

const MainViewRouter: React.FC = () => {
  const { activeNav } = useApp();
  switch (activeNav) {
    case 'dashboard': return <DashboardView />;
    case 'brain': return <BrainView />;
    case 'insights': return <BusinessInsightsView />;
    case 'conversations': return <ConversationsView />;
    case 'business_profile': return <BusinessProfileView />;
    case 'campaigns': return <ModuleSurfaceView module="campaigns" />;
    case 'advertising': return <ModuleSurfaceView module="advertising" />;
    case 'creative_library': return <ModuleSurfaceView module="creative_library" />;
    case 'social_publishing': return <ModuleSurfaceView module="social_publishing" />;
    case 'forms': return <FormsView />;
    case 'growth_intelligence': return <ModuleSurfaceView module="growth_intelligence" />;
    case 'leads': return <LeadsView />;
    case 'customers': return <CustomersView />;
    case 'bookings': return <BookingsView />;
    case 'pipeline': return <PipelineView />;
    case 'invoices': return <InvoicesView />;
    case 'workflows': return <WorkflowsView />;
    case 'integrations': return <ConnectorKernelView />;
    case 'ai_hub': return <AiProviderHubView />;
    case 'team': return <TeamSecurityView />;
    case 'billing': return <BillingView />;
    case 'settings': return <SettingsView />;
    case 'marketing': return <MarketingView />;
    default: return <DashboardView />;
  }
};

export default function App() {
  return <AppProvider><AppShell><MainViewRouter /></AppShell></AppProvider>;
}
