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
  FormSubmission,
  WorkflowRule,
  WorkflowExecutionLog,
  IntegrationConnection,
  AIProviderConfig,
  AutonomousAlert,
  SecurityAuditRecord,
  BillingEntitlement
} from './types.js';

class DataStore {
  public workspaces: Workspace[] = [];
  public users: User[] = [];
  public leads: Lead[] = [];
  public customers: Customer[] = [];
  public conversations: ConversationThread[] = [];
  public appointments: Appointment[] = [];
  public deals: PipelineDeal[] = [];
  public invoices: Invoice[] = [];
  public forms: WebsiteForm[] = [];
  public submissions: FormSubmission[] = [];
  public workflows: WorkflowRule[] = [];
  public executionLogs: WorkflowExecutionLog[] = [];
  public integrations: IntegrationConnection[] = [];
  public aiProviders: AIProviderConfig[] = [];
  public autonomousAlerts: AutonomousAlert[] = [];
  public auditRecords: SecurityAuditRecord[] = [];
  public billing: Record<string, BillingEntitlement> = {};

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const wsId = 'ws_apex_core';

    this.workspaces = [
      {
        id: wsId,
        name: 'APEX Industrial Logistics',
        slug: 'apex-industrial',
        industry: 'B2B Logistics & Freight',
        website: 'https://apexindustrial.com',
        currency: 'USD',
        timezone: 'America/New_York',
        verificationStatus: 'verified',
        taxId: 'US-948172635',
        registeredAddress: '100 Enterprise Way, Suite 400, New York, NY 10001',
        createdAt: '2025-01-10T09:00:00Z',
      },
      {
        id: 'ws_apex_tech',
        name: 'Vanguard Software Group',
        slug: 'vanguard-software',
        industry: 'Enterprise SaaS',
        website: 'https://vanguardsoft.io',
        currency: 'USD',
        timezone: 'America/Los_Angeles',
        verificationStatus: 'in_review',
        taxId: 'US-884729103',
        registeredAddress: '450 Tech Plaza, San Francisco, CA 94105',
        createdAt: '2025-04-15T14:30:00Z',
      }
    ];

    this.users = [
      {
        id: 'usr_owner_01',
        email: 'venomrai21@gmail.com',
        name: 'Alex Vance',
        role: 'admin',
        workspaceId: wsId,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      },
      {
        id: 'usr_ops_02',
        email: 'sarah.k@apexindustrial.com',
        name: 'Sarah Kim',
        role: 'manager',
        workspaceId: wsId,
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
      },
      {
        id: 'usr_rep_03',
        email: 'marcus.t@apexindustrial.com',
        name: 'Marcus Thorne',
        role: 'operator',
        workspaceId: wsId,
      }
    ];

    this.leads = [
      {
        id: 'lead_101',
        workspaceId: wsId,
        name: 'David Reynolds',
        email: 'd.reynolds@summitfreight.com',
        phone: '+1 (555) 234-8901',
        company: 'Summit Freight Corp',
        source: 'google_ads',
        status: 'new',
        estimatedValue: 24500,
        score: 88,
        leakRisk: 'high',
        leakReason: 'Inbound request unanswered for 18 hours (high probability drop)',
        lastContactAt: '2026-09-14T08:15:00Z',
        createdAt: '2026-09-14T08:15:00Z',
        assignedTo: 'Marcus Thorne',
        notes: 'Requested expedited multi-hub supply chain routing proposal for 40,000 pallets.',
      },
      {
        id: 'lead_102',
        workspaceId: wsId,
        name: 'Elena Rostova',
        email: 'elena@novapharma.de',
        phone: '+49 30 928371',
        company: 'Nova Pharma Logistics',
        source: 'website_form',
        status: 'qualifying',
        estimatedValue: 48000,
        score: 94,
        leakRisk: 'medium',
        leakReason: 'Meeting scheduled but no pre-call confirmation dispatched',
        lastContactAt: '2026-09-14T17:30:00Z',
        createdAt: '2026-09-13T11:20:00Z',
        assignedTo: 'Sarah Kim',
        notes: 'Temperature-controlled cross-border pharma freight contract inquiry.',
      },
      {
        id: 'lead_103',
        workspaceId: wsId,
        name: 'Julian Hayes',
        email: 'jhayes@meridianmarine.com',
        phone: '+1 (555) 890-4321',
        company: 'Meridian Marine Services',
        source: 'meta_ads',
        status: 'contacted',
        estimatedValue: 18500,
        score: 62,
        leakRisk: 'low',
        lastContactAt: '2026-09-15T01:00:00Z',
        createdAt: '2026-09-12T16:00:00Z',
        assignedTo: 'Marcus Thorne',
        notes: 'Replied to Meta ad on port drayage efficiency. Sent brochure.',
      },
      {
        id: 'lead_104',
        workspaceId: wsId,
        name: 'Samantha Drake',
        email: 'sdrake@aeroflux.co.uk',
        phone: '+44 20 7946 0912',
        company: 'AeroFlux International',
        source: 'whatsapp',
        status: 'qualified',
        estimatedValue: 36000,
        score: 91,
        leakRisk: 'low',
        lastContactAt: '2026-09-14T20:45:00Z',
        createdAt: '2026-09-11T09:10:00Z',
        assignedTo: 'Sarah Kim',
        notes: 'Budget verified ($35k+ quarterly). Technical demo completed successfully.',
      },
      {
        id: 'lead_105',
        workspaceId: wsId,
        name: 'Carlos Mendez',
        email: 'carlos@intercaltrade.mx',
        phone: '+52 55 4123 7890',
        company: 'InterCal Trading',
        source: 'outbound',
        status: 'lost',
        estimatedValue: 12000,
        score: 35,
        leakRisk: 'low',
        leakReason: 'Competitor selected due to delayed customs clearance module',
        lastContactAt: '2026-09-08T10:00:00Z',
        createdAt: '2026-09-01T14:00:00Z',
        assignedTo: 'Marcus Thorne',
        notes: 'Client opted for regional carrier with native bonded warehouse.',
      }
    ];

    this.customers = [
      {
        id: 'cust_201',
        workspaceId: wsId,
        name: 'Apex Global Distribution',
        email: 'accounts@apexglobal.com',
        phone: '+1 (555) 771-0021',
        company: 'Apex Global Distribution LLC',
        tier: 'enterprise',
        lifetimeValue: 184500,
        healthScore: 96,
        status: 'active',
        joinedAt: '2025-02-14T00:00:00Z',
        lastActiveAt: '2026-09-15T02:30:00Z',
        industry: 'Wholesale Retail Supply',
      },
      {
        id: 'cust_202',
        workspaceId: wsId,
        name: 'Nordic Trans-Logix',
        email: 'fleet@nordiclogix.se',
        phone: '+46 8 123 4567',
        company: 'Nordic Trans-Logix AB',
        tier: 'growth',
        lifetimeValue: 67200,
        healthScore: 68,
        status: 'at_risk',
        joinedAt: '2025-06-01T00:00:00Z',
        lastActiveAt: '2026-09-10T12:00:00Z',
        industry: 'Cold-chain Freight',
      },
      {
        id: 'cust_203',
        workspaceId: wsId,
        name: 'Zephyr Heavy Haul',
        email: 'ops@zephyrhaul.com',
        phone: '+1 (555) 349-8800',
        company: 'Zephyr Haulage Corp',
        tier: 'growth',
        lifetimeValue: 92400,
        healthScore: 89,
        status: 'active',
        joinedAt: '2025-04-18T00:00:00Z',
        lastActiveAt: '2026-09-14T19:20:00Z',
        industry: 'Specialized Industrial Hauling',
      }
    ];

    this.conversations = [];

    this.appointments = [
      {
        id: 'appt_401',
        workspaceId: wsId,
        title: 'Executive Fleet Optimization Strategy',
        customerName: 'Elena Rostova',
        customerEmail: 'elena@novapharma.de',
        customerPhone: '+49 30 928371',
        scheduledAt: '2026-09-16T14:00:00Z',
        durationMinutes: 45,
        status: 'confirmed',
        serviceType: 'Technical Architecture & Compliance',
        assignedStaff: 'Sarah Kim',
        notes: 'Pharma cold-chain tracking audit & integration roadmap.',
      },
      {
        id: 'appt_402',
        workspaceId: wsId,
        title: 'Contract Scope & Rate Finalization',
        customerName: 'Samantha Drake',
        customerEmail: 'sdrake@aeroflux.co.uk',
        customerPhone: '+44 20 7946 0912',
        scheduledAt: '2026-09-17T16:30:00Z',
        durationMinutes: 30,
        status: 'confirmed',
        serviceType: 'Contract Review',
        assignedStaff: 'Alex Vance',
      },
      {
        id: 'appt_403',
        workspaceId: wsId,
        title: 'Inbound Discovery Session',
        customerName: 'David Reynolds',
        customerEmail: 'd.reynolds@summitfreight.com',
        customerPhone: '+1 (555) 234-8901',
        scheduledAt: '2026-09-18T11:00:00Z',
        durationMinutes: 30,
        status: 'pending',
        serviceType: 'Initial Discovery',
        assignedStaff: 'Marcus Thorne',
      }
    ];

    this.deals = [
      {
        id: 'deal_501',
        workspaceId: wsId,
        title: 'Summit Freight - Multi-Hub Freight Contract',
        customerName: 'David Reynolds',
        company: 'Summit Freight Corp',
        value: 24500,
        stage: 'discovery',
        probability: 30,
        expectedCloseDate: '2026-10-15',
        assignedTo: 'Marcus Thorne',
        updatedAt: '2026-09-14T08:15:00Z',
      },
      {
        id: 'deal_502',
        workspaceId: wsId,
        title: 'Nova Pharma - European Cold Chain SLA',
        customerName: 'Elena Rostova',
        company: 'Nova Pharma Logistics',
        value: 48000,
        stage: 'qualified',
        probability: 60,
        expectedCloseDate: '2026-10-01',
        assignedTo: 'Sarah Kim',
        updatedAt: '2026-09-14T17:30:00Z',
      },
      {
        id: 'deal_503',
        workspaceId: wsId,
        title: 'AeroFlux - UK Distribution Retainer',
        customerName: 'Samantha Drake',
        company: 'AeroFlux International',
        value: 36000,
        stage: 'proposal_sent',
        probability: 85,
        expectedCloseDate: '2026-09-25',
        assignedTo: 'Sarah Kim',
        updatedAt: '2026-09-14T20:45:00Z',
      },
      {
        id: 'deal_504',
        workspaceId: wsId,
        title: 'Meridian Marine - Drayage Contract Expansion',
        customerName: 'Julian Hayes',
        company: 'Meridian Marine Services',
        value: 18500,
        stage: 'negotiation',
        probability: 70,
        expectedCloseDate: '2026-09-30',
        assignedTo: 'Marcus Thorne',
        updatedAt: '2026-09-15T01:00:00Z',
      },
      {
        id: 'deal_505',
        workspaceId: wsId,
        title: 'Apex Global - Q3 Dedicated Logistics Renewal',
        customerName: 'Apex Global Distribution',
        company: 'Apex Global Distribution LLC',
        value: 120000,
        stage: 'closed_won',
        probability: 100,
        expectedCloseDate: '2026-09-01',
        assignedTo: 'Alex Vance',
        updatedAt: '2026-09-02T10:00:00Z',
      }
    ];

    this.invoices = [
      {
        id: 'inv_601',
        workspaceId: wsId,
        invoiceNumber: 'INV-2026-089',
        customerName: 'Apex Global Distribution',
        customerEmail: 'accounts@apexglobal.com',
        amount: 32500,
        currency: 'USD',
        status: 'paid',
        issueDate: '2026-08-15',
        dueDate: '2026-09-01',
        paidAt: '2026-08-28T14:22:00Z',
        collectionAttempts: 0,
        items: [
          { description: 'Automated Hub Routing Orchestration (August)', quantity: 1, unitPrice: 32500 }
        ]
      },
      {
        id: 'inv_602',
        workspaceId: wsId,
        invoiceNumber: 'INV-2026-094',
        customerName: 'Nordic Trans-Logix AB',
        customerEmail: 'fleet@nordiclogix.se',
        amount: 14800,
        currency: 'USD',
        status: 'overdue',
        issueDate: '2026-08-20',
        dueDate: '2026-09-05',
        collectionAttempts: 2,
        lastReminderSentAt: '2026-09-11T10:00:00Z',
        items: [
          { description: 'Cold-chain Telematics Integration & Dispatch Module', quantity: 1, unitPrice: 14800 }
        ]
      },
      {
        id: 'inv_603',
        workspaceId: wsId,
        invoiceNumber: 'INV-2026-101',
        customerName: 'Zephyr Haulage Corp',
        customerEmail: 'ops@zephyrhaul.com',
        amount: 8200,
        currency: 'USD',
        status: 'sent',
        issueDate: '2026-09-10',
        dueDate: '2026-09-24',
        collectionAttempts: 0,
        items: [
          { description: 'Heavy Haul Compliance & Route Optimization Retainer', quantity: 1, unitPrice: 8200 }
        ]
      },
      {
        id: 'inv_604',
        workspaceId: wsId,
        invoiceNumber: 'INV-2026-108',
        customerName: 'Summit Freight Corp',
        customerEmail: 'd.reynolds@summitfreight.com',
        amount: 6500,
        currency: 'USD',
        status: 'draft',
        issueDate: '2026-09-15',
        dueDate: '2026-09-30',
        collectionAttempts: 0,
        items: [
          { description: 'Initial Route Feasibility Diagnostic', quantity: 1, unitPrice: 6500 }
        ]
      }
    ];

    this.forms = [
      {
        id: 'form_701',
        workspaceId: wsId,
        title: 'High-Volume Enterprise Logistics Inquiry',
        slug: 'enterprise-inquiry',
        fields: [
          { id: 'f_name', label: 'Full Name', type: 'text', required: true },
          { id: 'f_email', label: 'Work Email', type: 'email', required: true },
          { id: 'f_phone', label: 'Direct Phone', type: 'phone', required: true },
          { id: 'f_company', label: 'Company / Fleet Size', type: 'text', required: true },
          { id: 'f_volume', label: 'Monthly Pallet / Freight Volume', type: 'select', required: true, options: ['Under 5,000 pallets', '5,000 - 25,000 pallets', '25,000+ pallets'] },
          { id: 'f_details', label: 'Operational Bottlenecks', type: 'textarea', required: false }
        ],
        submitButtonText: 'Request Operational Review',
        successMessage: 'Your inquiry has been received. An APEX3X logistics strategist will reach out within 2 hours.',
        submissionsCount: 42,
        conversionRate: 23.8,
        isActive: true,
      },
      {
        id: 'form_702',
        workspaceId: wsId,
        title: 'Emergency Expedited Freight Quote',
        slug: 'expedited-quote',
        fields: [
          { id: 'f_name', label: 'Full Name', type: 'text', required: true },
          { id: 'f_phone', label: 'WhatsApp / Cell', type: 'phone', required: true },
          { id: 'f_origin', label: 'Origin Zip / Port', type: 'text', required: true },
          { id: 'f_destination', label: 'Destination Zip / Port', type: 'text', required: true },
        ],
        submitButtonText: 'Get Instant Rate',
        successMessage: 'Instant quote calculation dispatched via WhatsApp.',
        submissionsCount: 88,
        conversionRate: 34.1,
        isActive: true,
      }
    ];

    this.workflows = [
      {
        id: 'wf_801',
        workspaceId: wsId,
        title: 'High-Value Inbound Lead Instant WhatsApp Alert',
        triggerEvent: 'lead_captured',
        conditionSummary: 'Estimated deal value > $20,000 & Inbound channel is Google/Meta',
        actionSummary: 'Send automated WhatsApp welcome message & create priority task for assigned rep',
        actionType: 'send_whatsapp',
        isActive: true,
        totalExecutions: 31,
        lastExecutedAt: '2026-09-14T08:15:00Z',
        successRate: 96.8,
      },
      {
        id: 'wf_802',
        workspaceId: wsId,
        title: 'Autonomous Overdue Receivables Recovery',
        triggerEvent: 'payment_overdue',
        conditionSummary: 'Invoice due date passed by > 5 days & status is Overdue',
        actionSummary: 'Send formal invoice statement via Email with 1-click payment link, follow up on WhatsApp 48h later',
        actionType: 'send_email',
        isActive: true,
        totalExecutions: 14,
        lastExecutedAt: '2026-09-11T10:00:00Z',
        successRate: 85.7,
      },
      {
        id: 'wf_803',
        workspaceId: wsId,
        title: 'Calendar Booking Pre-flight WhatsApp Confirmation',
        triggerEvent: 'booking_confirmed',
        conditionSummary: 'Appointment scheduled within next 48 hours',
        actionSummary: 'Send calendar invite confirmation + WhatsApp reminder with meeting agenda',
        actionType: 'send_whatsapp',
        isActive: true,
        totalExecutions: 58,
        lastExecutedAt: '2026-09-14T17:30:00Z',
        successRate: 100,
      },
      {
        id: 'wf_804',
        workspaceId: wsId,
        title: 'Pipeline Stalled Deal Autonomous Escalate',
        triggerEvent: 'deal_stalled',
        conditionSummary: 'Deal in Negotiation stage with no activity > 7 business days',
        actionSummary: 'Trigger Brain decision alert to Director of Sales and prepare re-engagement hook',
        actionType: 'escalate_alert',
        isActive: true,
        totalExecutions: 9,
        lastExecutedAt: '2026-09-13T09:00:00Z',
        successRate: 100,
      }
    ];

    this.executionLogs = [
      {
        id: 'log_901',
        workflowId: 'wf_801',
        workspaceId: wsId,
        triggerEvent: 'lead_captured',
        status: 'success',
        details: 'Dispatched automated WhatsApp introduction to David Reynolds (+1 555-234-8901). Assigned to Marcus Thorne.',
        executedAt: '2026-09-14T08:15:30Z',
        recoveredValue: 24500,
      },
      {
        id: 'log_902',
        workflowId: 'wf_802',
        workspaceId: wsId,
        triggerEvent: 'payment_overdue',
        status: 'success',
        details: 'Invoice reminder sent to Nordic Trans-Logix AB (INV-2026-094, $14,800).',
        executedAt: '2026-09-11T10:00:15Z',
      },
      {
        id: 'log_903',
        workflowId: 'wf_803',
        workspaceId: wsId,
        triggerEvent: 'booking_confirmed',
        status: 'success',
        details: 'Confirmation dispatched to Elena Rostova for Sept 16 strategy session.',
        executedAt: '2026-09-14T17:30:45Z',
      }
    ];

    this.integrations = [
      {
        id: 'int_01',
        workspaceId: wsId,
        provider: 'google_ads',
        name: 'Google Ads',
        category: 'advertising',
        status: 'connected',
        connectedAccountName: 'APEX Logistics - US East Core (ID: 849-291-0021)',
        connectedAccountId: '849-291-0021',
        lastSyncedAt: '2026-09-15T02:00:00Z',
        capabilities: ['Campaign Performance Sync', 'Conversion Tracking', 'Lost ROAS Audit'],
      },
      {
        id: 'int_02',
        workspaceId: wsId,
        provider: 'google_business_profile',
        name: 'Google Business Profile',
        category: 'reputation',
        status: 'connected',
        connectedAccountName: 'APEX Industrial Logistics HQ (New York)',
        connectedAccountId: 'gbp_loc_ny_01',
        lastSyncedAt: '2026-09-14T18:00:00Z',
        capabilities: ['Local Search Views', 'Call Inquiries', 'Review Sentiment Analysis'],
      },
      {
        id: 'int_03',
        workspaceId: wsId,
        provider: 'meta_ads',
        name: 'Meta Ads & Instagram',
        category: 'advertising',
        status: 'connected',
        connectedAccountName: 'APEX B2B Lead Gen Account (act_993821049)',
        connectedAccountId: 'act_993821049',
        lastSyncedAt: '2026-09-15T01:30:00Z',
        capabilities: ['Meta Lead Forms Sync', 'Ad Spend Analytics', 'Cost Per Acquisition Tracking'],
      },
      {
        id: 'int_04',
        workspaceId: wsId,
        provider: 'whatsapp_cloud',
        name: 'WhatsApp Business Cloud API',
        category: 'communication',
        status: 'connected',
        connectedAccountName: '+1 (555) 019-2830 (Verified Meta Business WABA)',
        connectedAccountId: 'waba_992182736',
        lastSyncedAt: '2026-09-15T02:50:00Z',
        capabilities: ['Real-time 2-way Messaging', 'Template Delivery', 'Automated Re-engagement'],
      },
      {
        id: 'int_05',
        workspaceId: wsId,
        provider: 'resend_email',
        name: 'Resend Transactional & Marketing Email',
        category: 'communication',
        status: 'connected',
        connectedAccountName: 'notifications@apexindustrial.com (Verified Domain)',
        connectedAccountId: 'domain_apexindustrial_com',
        lastSyncedAt: '2026-09-15T02:40:00Z',
        capabilities: ['Transactional Delivery', 'Invoice Dispatch', 'Open/Bounce Telemetry'],
      },
      {
        id: 'int_06',
        workspaceId: wsId,
        provider: 'stripe',
        name: 'Stripe Payments & Billing',
        category: 'payment',
        status: 'connected',
        connectedAccountName: 'APEX Industrial Holdings (acct_1N9x829Klp0)',
        connectedAccountId: 'acct_1N9x829Klp0',
        lastSyncedAt: '2026-09-15T02:45:00Z',
        capabilities: ['Payment Links', 'Automated Card Settlements', 'Dispute Guard'],
      },
      {
        id: 'int_07',
        workspaceId: wsId,
        provider: 'razorpay',
        name: 'Razorpay Global Invoicing',
        category: 'payment',
        status: 'disconnected',
        capabilities: ['Cross-Border Wire Payments', 'Smart Virtual Accounts', 'UPI & Direct Bank Transfer'],
      }
    ];

    this.aiProviders = [
      {
        id: 'ai_01',
        workspaceId: wsId,
        provider: 'gemini',
        name: 'Google Gemini (Native Engine)',
        status: 'connected',
        modelSelected: 'gemini-3.8-flash',
        hasCustomKey: true,
        maskedKey: 'AIzaSy********************7xQ',
        lastTestedAt: '2026-09-15T02:55:00Z',
        latencyMs: 340,
      },
      {
        id: 'ai_02',
        workspaceId: wsId,
        provider: 'openai',
        name: 'OpenAI (BYOK)',
        status: 'not_configured',
        modelSelected: 'gpt-4o',
        hasCustomKey: false,
      },
      {
        id: 'ai_03',
        workspaceId: wsId,
        provider: 'anthropic',
        name: 'Anthropic Claude (BYOK)',
        status: 'not_configured',
        modelSelected: 'claude-3-5-sonnet',
        hasCustomKey: false,
      },
      {
        id: 'ai_04',
        workspaceId: wsId,
        provider: 'custom_openai',
        name: 'Custom OpenAI-Compatible Endpoint (BYOK)',
        status: 'not_configured',
        modelSelected: 'meta-llama/llama-3.3-70b-instruct',
        endpointUrl: 'https://api.together.xyz/v1',
        hasCustomKey: false,
      }
    ];

    this.autonomousAlerts = [
      {
        id: 'alt_001',
        workspaceId: wsId,
        stage: 'detect',
        severity: 'critical',
        category: 'unresponsive_lead',
        headline: 'High-Value Lead Risk: Summit Freight ($24,500)',
        detectedIssue: 'Lead submitted quote request 18h ago via Google Ads. Response threshold SLA is 2 hours. Conversion decay probability is at 76%.',
        revenueAtRisk: 24500,
        recommendedAction: 'Trigger autonomous multi-channel response: Send personalized WhatsApp quote intro from Marcus Thorne and reserve calendar slot.',
        executionStatus: 'pending_approval',
        suggestedAt: '2026-09-15T02:15:00Z',
      },
      {
        id: 'alt_002',
        workspaceId: wsId,
        stage: 'decide',
        severity: 'critical',
        category: 'overdue_receivable',
        headline: 'Receivable Overdue: Nordic Trans-Logix AB ($14,800)',
        detectedIssue: 'Invoice INV-2026-094 overdue by 10 days. 2 preliminary reminders sent without settlement confirmation.',
        revenueAtRisk: 14800,
        recommendedAction: 'Initiate Stage-2 automated collection escalation: Send formal payment demand letter with Stripe Instant ACH link to CFO email.',
        executionStatus: 'pending_approval',
        suggestedAt: '2026-09-15T01:45:00Z',
      },
      {
        id: 'alt_003',
        workspaceId: wsId,
        stage: 'understand',
        severity: 'warning',
        category: 'ad_spend_leak',
        headline: 'Negative ROI Ad Group: "Intermodal Container Rental"',
        detectedIssue: 'Google Ads campaign spent $3,420 over the last 14 days generating 84 clicks and 0 qualified leads (Target CPA: $180).',
        revenueAtRisk: 3420,
        recommendedAction: 'Pause underperforming keyword group and reallocate remaining monthly budget to "Dedicated Fleet Transport" campaign (ROAS 4.8x).',
        executionStatus: 'pending_approval',
        suggestedAt: '2026-09-14T23:10:00Z',
      },
      {
        id: 'alt_004',
        workspaceId: wsId,
        stage: 'learn',
        severity: 'info',
        category: 'pipeline_stall',
        headline: 'Recovered: Samantha Drake ($36,000 Deal Advanced)',
        detectedIssue: 'Autonomous WhatsApp check-in sent on Sept 14 successfully unblocked legal review for AeroFlux International contract.',
        revenueAtRisk: 0,
        recommendedAction: 'System updated prompt weighting: 48h polite inquiry on WhatsApp improved deal velocity by 3.2 days.',
        executionStatus: 'executed',
        suggestedAt: '2026-09-14T20:45:00Z',
        executedAt: '2026-09-14T20:46:10Z',
      }
    ];

    this.auditRecords = [
      {
        id: 'aud_01',
        workspaceId: wsId,
        userId: 'usr_owner_01',
        userName: 'Alex Vance',
        action: 'Verified Google Ads OAuth connection sync',
        category: 'integration',
        ipAddress: '198.51.100.44',
        timestamp: '2026-09-15T02:00:00Z',
      },
      {
        id: 'aud_02',
        workspaceId: wsId,
        userId: 'usr_ops_02',
        userName: 'Sarah Kim',
        action: 'Updated BYOK Gemini Model configuration to gemini-3.8-flash',
        category: 'ai_config',
        ipAddress: '198.51.100.12',
        timestamp: '2026-09-15T02:55:00Z',
      },
      {
        id: 'aud_03',
        workspaceId: wsId,
        userId: 'usr_owner_01',
        userName: 'Alex Vance',
        action: 'Triggered Autonomous Collections Workflow for INV-2026-094',
        category: 'financial',
        ipAddress: '198.51.100.44',
        timestamp: '2026-09-11T10:00:00Z',
      }
    ];

    this.billing[wsId] = {
      planTier: 'growth',
      status: 'active',
      renewalDate: '2026-10-15T00:00:00Z',
      amount: 499,
      currency: 'USD',
      limits: {
        leadsMonthly: { used: 412, total: 2500 },
        automations: { used: 4, total: 25 },
        connectedIntegrations: { used: 6, total: 10 },
        aiRuns: { used: 1248, total: 5000 },
      },
      paymentMethod: {
        brand: 'Visa',
        last4: '4242',
        expiry: '08/28',
      }
    };
  }

  // Workspace helper
  getWorkspace(id: string): Workspace | undefined {
    return this.workspaces.find(w => w.id === id) || this.workspaces[0];
  }
}

export const db = new DataStore();
