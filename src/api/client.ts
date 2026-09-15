import {
  Workspace,
  User,
  Lead,
  Customer,
  ConversationThread,
  ConversationMessage,
  Appointment,
  PipelineDeal,
  Invoice,
  WebsiteForm,
  WorkflowRule,
  WorkflowExecutionLog,
  IntegrationConnection,
  AIProviderConfig,
  AutonomousAlert,
  SecurityAuditRecord,
  BillingEntitlement,
  DashboardSummary,
  BrainAuditResponse,
  MarketingOverview,
  BusinessInsightsData
} from '../types';

let currentActiveWorkspaceId = 'ws_apex_core';

export function setActiveWorkspaceId(id: string) {
  currentActiveWorkspaceId = id;
}

export function getActiveWorkspaceId(): string {
  return currentActiveWorkspaceId;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'x-workspace-id': currentActiveWorkspaceId,
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMsg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const json = await response.json();
      if (json.error) errMsg = json.error;
    } catch {}
    throw new Error(errMsg);
  }

  return response.json();
}

export const api = {
  // Auth & Workspace
  getMe: () => request<{ user: User; workspace: Workspace }>('/api/auth/me'),
  getWorkspaces: () => request<Workspace[]>('/api/workspaces'),
  createWorkspace: (data: Partial<Workspace>) =>
    request<Workspace>('/api/workspaces', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkspace: (data: Partial<Workspace>) =>
    request<Workspace>('/api/workspace', { method: 'PUT', body: JSON.stringify(data) }),
  verifyWorkspace: () =>
    request<{ success: boolean; workspace: Workspace }>('/api/workspace/verify', { method: 'POST' }),

  // Dashboard & Command Center
  getDashboardSummary: () => request<DashboardSummary>('/api/dashboard/summary'),

  // Brain & Autonomous Operations
  getBrainAudit: () => request<BrainAuditResponse>('/api/brain/audit'),
  getBrainAlerts: () => request<AutonomousAlert[]>('/api/brain/alerts'),
  executeBrainAction: (alertId: string) =>
    request<{ success: boolean; alert: AutonomousAlert; message: string }>('/api/brain/execute-action', {
      method: 'POST',
      body: JSON.stringify({ alertId }),
    }),

  // AI-Powered Business Insights
  getBusinessInsights: (refresh = false) =>
    request<BusinessInsightsData>(`/api/insights/overview${refresh ? '?refresh=true' : ''}`),
  triggerInsightsAnalysis: () =>
    request<BusinessInsightsData>('/api/insights/analyze', { method: 'POST' }),
  executeInsightAction: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/insights/actions/${id}/execute`, { method: 'POST' }),

  // CRM: Leads & Customers
  getLeads: () => request<Lead[]>('/api/crm/leads'),
  createLead: (data: Partial<Lead>) =>
    request<Lead>('/api/crm/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id: string, data: Partial<Lead>) =>
    request<Lead>(`/api/crm/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  qualifyLead: (id: string) =>
    request<Lead>(`/api/crm/leads/${id}/qualify`, { method: 'POST' }),
  convertLead: (id: string) =>
    request<{ success: boolean; customer: Customer; lead: Lead }>(`/api/crm/leads/${id}/convert`, { method: 'POST' }),
  getCustomers: () => request<Customer[]>('/api/crm/customers'),

  // Conversations & Unified Inbox
  getConversations: (params?: { channel?: string; status?: string; search?: string; unreadOnly?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.channel) query.append('channel', params.channel);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.unreadOnly) query.append('unreadOnly', 'true');
    const qs = query.toString();
    return request<ConversationThread[]>(`/api/conversations${qs ? `?${qs}` : ''}`);
  },
  createConversation: (data: {
    contactName: string;
    contactEmail?: string;
    contactPhone?: string;
    company?: string;
    channel?: 'whatsapp' | 'email' | 'web_chat';
    initialMessage?: string;
  }) => request<ConversationThread>('/api/conversations', { method: 'POST', body: JSON.stringify(data) }),
  getConversation: (id: string) => request<ConversationThread>(`/api/conversations/${id}`),
  getConversationCustomerContext: (id: string) =>
    request<{
      conversation: ConversationThread;
      customer: Customer | null;
      lead: Lead | null;
      deals: PipelineDeal[];
      invoices: Invoice[];
    }>(`/api/conversations/${id}/customer-context`),
  sendMessage: (id: string, content: string, channel: 'whatsapp' | 'email' | 'web_chat' | 'internal' | 'sms') =>
    request<ConversationMessage>(`/api/conversations/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, channel }),
    }),
  updateConversationStatus: (id: string, status: 'open' | 'pending' | 'resolved') =>
    request<ConversationThread>(`/api/conversations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  markConversationRead: (id: string) =>
    request<{ success: boolean }>(`/api/conversations/${id}/read`, { method: 'POST' }),
  getConversationSmartReply: (id: string, instruction?: string) =>
    request<{ replyText: string; tone: string; channel: string }>(`/api/conversations/${id}/suggest-reply`, {
      method: 'POST',
      body: JSON.stringify({ instruction }),
    }),

  // Bookings & Calendar
  getBookings: () => request<Appointment[]>('/api/bookings'),
  createBooking: (data: Partial<Appointment>) =>
    request<Appointment>('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBookingStatus: (id: string, status: string) =>
    request<Appointment>(`/api/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Sales Pipeline
  getDeals: () => request<PipelineDeal[]>('/api/pipeline/deals'),
  createDeal: (data: Partial<PipelineDeal>) =>
    request<PipelineDeal>('/api/pipeline/deals', { method: 'POST', body: JSON.stringify(data) }),
  moveDealStage: (id: string, stage: string) =>
    request<PipelineDeal>(`/api/pipeline/deals/${id}/stage`, { method: 'PUT', body: JSON.stringify({ stage }) }),

  // Invoices & Collections
  getInvoices: () => request<Invoice[]>('/api/invoices'),
  createInvoice: (data: { customerName: string; customerEmail: string; amount: number; dueDate?: string; description?: string }) =>
    request<Invoice>('/api/invoices', { method: 'POST', body: JSON.stringify(data) }),
  recordPayment: (id: string) =>
    request<{ success: boolean; invoice: Invoice }>(`/api/invoices/${id}/payment`, { method: 'POST' }),
  sendInvoiceReminder: (id: string) =>
    request<{ success: boolean; message: string; invoice: Invoice }>(`/api/invoices/${id}/send-reminder`, { method: 'POST' }),

  // Forms & Lead Capture
  getForms: () => request<WebsiteForm[]>('/api/forms'),
  createForm: (data: Partial<WebsiteForm>) =>
    request<WebsiteForm>('/api/forms', { method: 'POST', body: JSON.stringify(data) }),
  submitForm: (id: string, data: Record<string, string>) =>
    request<{ success: boolean; message: string; leadId: string }>(`/api/forms/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Marketing & Growth
  getMarketingOverview: () => request<MarketingOverview>('/api/marketing/overview'),

  // Workflows & Automations
  getWorkflows: () => request<WorkflowRule[]>('/api/workflows'),
  toggleWorkflow: (id: string) =>
    request<WorkflowRule>(`/api/workflows/${id}/toggle`, { method: 'PUT' }),
  testWorkflow: (id: string) =>
    request<{ success: boolean; message: string; log: WorkflowExecutionLog }>(`/api/workflows/${id}/test-run`, { method: 'POST' }),
  getWorkflowLogs: () => request<WorkflowExecutionLog[]>('/api/workflows/logs'),

  // Integrations & + Connect Hub
  getIntegrations: () => request<IntegrationConnection[]>('/api/integrations'),
  connectIntegration: (provider: string, data: { accountName?: string; accountId?: string }) =>
    request<{ success: boolean; integration: IntegrationConnection }>(`/api/integrations/${provider}/connect`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  disconnectIntegration: (provider: string) =>
    request<{ success: boolean; integration: IntegrationConnection }>(`/api/integrations/${provider}/disconnect`, { method: 'POST' }),
  syncIntegration: (provider: string) =>
    request<{ success: boolean; integration: IntegrationConnection; message: string }>(`/api/integrations/${provider}/sync`, { method: 'POST' }),

  // AI Provider Hub (BYOK)
  getAiProviders: () => request<AIProviderConfig[]>('/api/ai/providers'),
  configureAiProvider: (provider: string, data: { apiKey?: string; modelSelected?: string; endpointUrl?: string }) =>
    request<{ success: boolean; provider: AIProviderConfig }>(`/api/ai/providers/${provider}/configure`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  testAiProvider: (provider: string) =>
    request<{ success: boolean; provider: AIProviderConfig; message: string }>(`/api/ai/providers/${provider}/test`, { method: 'POST' }),

  // Team & Security
  getTeam: () => request<User[]>('/api/team'),
  inviteTeamMember: (data: { email: string; name: string; role: string }) =>
    request<User>('/api/team/invite', { method: 'POST', body: JSON.stringify(data) }),
  getSecurityAudit: () => request<SecurityAuditRecord[]>('/api/security/audit'),

  // Billing
  getBilling: () => request<BillingEntitlement>('/api/billing'),
};
