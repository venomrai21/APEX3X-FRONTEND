import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';

// Views
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
import { IntegrationsView } from './views/IntegrationsView';
import { AiProviderHubView } from './views/AiProviderHubView';
import { TeamSecurityView } from './views/TeamSecurityView';
import { BillingView } from './views/BillingView';
import { SettingsView } from './views/SettingsView';

const MainViewRouter: React.FC = () => {
  const { activeNav } = useApp();

  switch (activeNav) {
    case 'dashboard':
      return <DashboardView />;
    case 'brain':
      return <BrainView />;
    case 'insights':
      return <BusinessInsightsView />;
    case 'leads':
      return <LeadsView />;
    case 'customers':
      return <CustomersView />;
    case 'conversations':
      return <ConversationsView />;
    case 'bookings':
      return <BookingsView />;
    case 'pipeline':
      return <PipelineView />;
    case 'invoices':
      return <InvoicesView />;
    case 'forms':
      return <FormsView />;
    case 'marketing':
      return <MarketingView />;
    case 'workflows':
      return <WorkflowsView />;
    case 'integrations':
      return <IntegrationsView />;
    case 'ai_hub':
      return <AiProviderHubView />;
    case 'team_security':
      return <TeamSecurityView />;
    case 'billing':
      return <BillingView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <DashboardView />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <AppShell>
        <MainViewRouter />
      </AppShell>
    </AppProvider>
  );
}
