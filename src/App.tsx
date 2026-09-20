import React, { useEffect } from 'react';
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

const MainViewRouter: React.FC = () => {
  const { activeNav } = useApp();
  switch (activeNav) {
    case 'dashboard': return <DashboardView />;
    case 'brain': return <BrainView />;
    case 'insights': return <BusinessInsightsView />;
    case 'conversations': return <ConversationsView />;
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

const VIEW_TITLES: Record<string, string> = { dashboard: "Command Center", conversations: "Unified Inbox", campaigns: "Campaigns", advertising: "Advertising", creative_library: "Creative Library", social_publishing: "Social Publishing", forms: "Forms & Web Capture", growth_intelligence: "Growth Intelligence", leads: "Leads", customers: "Customers", bookings: "Bookings & Calendar", pipeline: "Sales Pipeline", invoices: "Invoices & Payments", workflows: "Automate", integrations: "Integrations Hub", ai_hub: "AI Provider Hub", team: "Team & Security", billing: "Billing & Entitlements", settings: "Workspace Settings" };
const DocumentTitle: React.FC = () => { const { activeNav } = useApp(); useEffect(() => { document.title = VIEW_TITLES[activeNav] ? VIEW_TITLES[activeNav] + " · APEX3X" : "APEX3X"; }, [activeNav]); return null; };

export default function App() {
  return <AppProvider><DocumentTitle /><AppShell><MainViewRouter /></AppShell></AppProvider>;
}
