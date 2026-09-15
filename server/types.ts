export interface Workspace {
  id: string;
  name: string;
  slug: string;
  industry: string;
  website: string;
  currency: string;
  timezone: string;
  verificationStatus: 'verified' | 'in_review' | 'unverified';
  taxId?: string;
  registeredAddress?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  workspaceId: string;
  avatarUrl?: string;
}

export interface Lead {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: 'google_ads' | 'meta_ads' | 'website_form' | 'whatsapp' | 'referral' | 'outbound';
  status: 'new' | 'contacted' | 'qualifying' | 'qualified' | 'converted' | 'lost';
  estimatedValue: number;
  score: number; // 0-100
  leakRisk: 'high' | 'medium' | 'low';
  leakReason?: string;
  lastContactAt: string;
  createdAt: string;
  assignedTo: string;
  notes: string;
}

export interface Customer {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  tier: 'starter' | 'growth' | 'enterprise';
  lifetimeValue: number;
  healthScore: number; // 0-100
  status: 'active' | 'at_risk' | 'churned';
  joinedAt: string;
  lastActiveAt: string;
  industry: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  sender: 'customer' | 'agent' | 'system' | 'ai';
  senderName: string;
  content: string;
  channel: 'whatsapp' | 'email' | 'web_chat' | 'internal' | 'sms';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface ConversationThread {
  id: string;
  workspaceId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  company?: string;
  customerId?: string;
  channel: 'whatsapp' | 'email' | 'web_chat' | 'omnichannel' | 'sms';
  unreadCount: number;
  lastMessageSnippet: string;
  lastMessageAt: string;
  status: 'open' | 'pending' | 'resolved';
  priority?: 'high' | 'normal' | 'low';
  tags?: string[];
  messages: ConversationMessage[];
}

export interface Appointment {
  id: string;
  workspaceId: string;
  title: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  scheduledAt: string; // ISO date string
  durationMinutes: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  serviceType: string;
  assignedStaff: string;
  notes?: string;
}

export interface PipelineDeal {
  id: string;
  workspaceId: string;
  title: string;
  customerName: string;
  company: string;
  value: number;
  stage: 'discovery' | 'qualified' | 'proposal_sent' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number; // percentage 0-100
  expectedCloseDate: string;
  assignedTo: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'in_collection';
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  collectionAttempts: number;
  lastReminderSentAt?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface FormSubmission {
  id: string;
  formId: string;
  workspaceId: string;
  submittedAt: string;
  data: Record<string, string>;
  convertedToLeadId?: string;
}

export interface WebsiteForm {
  id: string;
  workspaceId: string;
  title: string;
  slug: string;
  fields: {
    id: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'textarea' | 'select';
    required: boolean;
    options?: string[];
  }[];
  submitButtonText: string;
  successMessage: string;
  submissionsCount: number;
  conversionRate: number;
  isActive: boolean;
}

export interface WorkflowRule {
  id: string;
  workspaceId: string;
  title: string;
  triggerEvent: 'lead_captured' | 'payment_overdue' | 'booking_confirmed' | 'revenue_leak_detected' | 'deal_stalled';
  conditionSummary: string;
  actionSummary: string;
  actionType: 'send_whatsapp' | 'send_email' | 'create_task' | 'escalate_alert' | 'update_pipeline';
  isActive: boolean;
  totalExecutions: number;
  lastExecutedAt?: string;
  successRate: number;
}

export interface WorkflowExecutionLog {
  id: string;
  workflowId: string;
  workspaceId: string;
  triggerEvent: string;
  status: 'success' | 'failed' | 'running';
  details: string;
  executedAt: string;
  recoveredValue?: number;
}

export interface IntegrationConnection {
  id: string;
  workspaceId: string;
  provider: 'google_ads' | 'google_business_profile' | 'meta_ads' | 'whatsapp_cloud' | 'resend_email' | 'stripe' | 'razorpay';
  name: string;
  category: 'advertising' | 'communication' | 'payment' | 'reputation';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  connectedAccountName?: string;
  connectedAccountId?: string;
  lastSyncedAt?: string;
  capabilities: string[];
  errorDetails?: string;
}

export interface AIProviderConfig {
  id: string;
  workspaceId: string;
  provider: 'gemini' | 'openai' | 'anthropic' | 'custom_openai';
  name: string;
  status: 'connected' | 'not_configured' | 'error';
  modelSelected: string;
  hasCustomKey: boolean;
  maskedKey?: string;
  endpointUrl?: string; // For custom_openai
  lastTestedAt?: string;
  latencyMs?: number;
}

export interface AutonomousAlert {
  id: string;
  workspaceId: string;
  stage: 'detect' | 'understand' | 'decide' | 'act' | 'learn';
  severity: 'critical' | 'warning' | 'info';
  category: 'unresponsive_lead' | 'overdue_receivable' | 'ad_spend_leak' | 'calendar_noshow' | 'pipeline_stall';
  headline: string;
  detectedIssue: string;
  revenueAtRisk: number;
  recommendedAction: string;
  executionStatus: 'pending_approval' | 'executed' | 'dismissed';
  suggestedAt: string;
  executedAt?: string;
}

export interface SecurityAuditRecord {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  action: string;
  category: 'auth' | 'data_export' | 'integration' | 'ai_config' | 'financial';
  ipAddress: string;
  timestamp: string;
}

export interface BillingEntitlement {
  planTier: 'starter' | 'growth' | 'enterprise';
  status: 'active' | 'past_due' | 'trialing';
  renewalDate: string;
  amount: number;
  currency: string;
  limits: {
    leadsMonthly: { used: number; total: number };
    automations: { used: number; total: number };
    connectedIntegrations: { used: number; total: number };
    aiRuns: { used: number; total: number };
  };
  paymentMethod: {
    brand: string;
    last4: string;
    expiry: string;
  };
}
