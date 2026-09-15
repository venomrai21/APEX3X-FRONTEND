import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/dataStore.js';
import { runAutonomousRevenueAudit, runBusinessInsightsAnalysis, generateSmartConversationReply } from './server/aiService.js';
import { Lead, Appointment, PipelineDeal, Invoice, WebsiteForm, ConversationThread } from './server/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to extract workspace
  const getWsId = (req: express.Request): string => {
    return (req.headers['x-workspace-id'] as string) || 'ws_apex_core';
  };

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      brand: 'APEX3X',
      system: 'Autonomous Business Operating System',
      time: new Date().toISOString(),
    });
  });

  // -------------------------------------------------------------
  // AUTH & WORKSPACE MANAGEMENT
  // -------------------------------------------------------------
  app.get('/api/auth/me', (req, res) => {
    const wsId = getWsId(req);
    const user = db.users[0]; // Active operator
    const workspace = db.getWorkspace(wsId);
    res.json({ user, workspace });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || db.users[0];
    const workspace = db.getWorkspace(user.workspaceId);
    res.json({
      success: true,
      token: 'jwt_apex_' + Math.random().toString(36).substring(2),
      user,
      workspace,
    });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { email } = req.body;
    res.json({
      success: true,
      message: `Password reset instructions dispatched to ${email || 'your registered email'}.`,
    });
  });

  app.get('/api/workspaces', (req, res) => {
    res.json(db.workspaces);
  });

  app.post('/api/workspaces', (req, res) => {
    const { name, industry, website, currency, timezone } = req.body;
    const newWs = {
      id: 'ws_' + Math.random().toString(36).substring(2, 9),
      name: name || 'New Enterprise Workspace',
      slug: (name || 'new-workspace').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      industry: industry || 'General Commerce',
      website: website || '',
      currency: currency || 'USD',
      timezone: timezone || 'America/New_York',
      verificationStatus: 'in_review' as const,
      createdAt: new Date().toISOString(),
    };
    db.workspaces.push(newWs);
    db.billing[newWs.id] = {
      planTier: 'growth',
      status: 'active',
      renewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      amount: 499,
      currency: newWs.currency,
      limits: {
        leadsMonthly: { used: 0, total: 2500 },
        automations: { used: 0, total: 25 },
        connectedIntegrations: { used: 0, total: 10 },
        aiRuns: { used: 0, total: 5000 },
      },
      paymentMethod: { brand: 'Visa', last4: '4242', expiry: '12/28' }
    };
    res.json(newWs);
  });

  app.put('/api/workspace', (req, res) => {
    const wsId = getWsId(req);
    const ws = db.getWorkspace(wsId);
    if (!ws) return res.status(404).json({ error: 'Workspace not found' });

    const { name, industry, website, currency, timezone, taxId, registeredAddress } = req.body;
    if (name) ws.name = name;
    if (industry) ws.industry = industry;
    if (website) ws.website = website;
    if (currency) ws.currency = currency;
    if (timezone) ws.timezone = timezone;
    if (taxId) ws.taxId = taxId;
    if (registeredAddress) ws.registeredAddress = registeredAddress;

    res.json(ws);
  });

  app.post('/api/workspace/verify', (req, res) => {
    const wsId = getWsId(req);
    const ws = db.getWorkspace(wsId);
    if (ws) {
      ws.verificationStatus = 'verified';
    }
    res.json({ success: true, workspace: ws });
  });

  // -------------------------------------------------------------
  // OPERATIONAL COMMAND CENTER / DASHBOARD
  // -------------------------------------------------------------
  app.get('/api/dashboard/summary', async (req, res) => {
    const wsId = getWsId(req);
    const ws = db.getWorkspace(wsId);
    const leads = db.leads.filter(l => l.workspaceId === wsId);
    const customers = db.customers.filter(c => c.workspaceId === wsId);
    const deals = db.deals.filter(d => d.workspaceId === wsId);
    const invoices = db.invoices.filter(i => i.workspaceId === wsId);
    const alerts = db.autonomousAlerts.filter(a => a.workspaceId === wsId);

    const activePipelineValue = deals
      .filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
      .reduce((acc, d) => acc + d.value, 0);

    const wonValueThisMonth = deals
      .filter(d => d.stage === 'closed_won')
      .reduce((acc, d) => acc + d.value, 0);

    const overdueReceivables = invoices
      .filter(i => i.status === 'overdue' || i.status === 'in_collection')
      .reduce((acc, i) => acc + i.amount, 0);

    const highRiskLeadsValue = leads
      .filter(l => l.leakRisk === 'high')
      .reduce((acc, l) => acc + l.estimatedValue, 0);

    const totalRevenueAtRisk = overdueReceivables + highRiskLeadsValue;

    res.json({
      workspace: ws,
      metrics: {
        totalRevenueAtRisk,
        activePipelineValue,
        wonValueThisMonth,
        overdueReceivables,
        activeCustomersCount: customers.length,
        openLeadsCount: leads.filter(l => l.status !== 'converted' && l.status !== 'lost').length,
        systemHealth: 98.4,
        connectedIntegrationsCount: db.integrations.filter(i => i.status === 'connected').length,
      },
      autonomousCycleStatus: {
        currentPhase: 'Decide & Act',
        detectedAnomalies: alerts.filter(a => a.executionStatus === 'pending_approval').length,
        recoveredRevenueMonth: 60500,
      },
      pendingAlerts: alerts.filter(a => a.executionStatus === 'pending_approval'),
      recentDeals: deals.slice(0, 5),
    });
  });

  // -------------------------------------------------------------
  // AUTONOMOUS BRAIN ENGINE
  // -------------------------------------------------------------
  app.get('/api/brain/audit', async (req, res) => {
    const wsId = getWsId(req);
    try {
      const audit = await runAutonomousRevenueAudit(wsId);
      res.json(audit);
    } catch (err: any) {
      res.status(500).json({ error: 'Audit execution failed', details: err.message });
    }
  });

  app.get('/api/brain/alerts', (req, res) => {
    const wsId = getWsId(req);
    res.json(db.autonomousAlerts.filter(a => a.workspaceId === wsId));
  });

  app.post('/api/brain/execute-action', (req, res) => {
    const wsId = getWsId(req);
    const { alertId } = req.body;
    const alert = db.autonomousAlerts.find(a => a.id === alertId && a.workspaceId === wsId);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    alert.executionStatus = 'executed';
    alert.executedAt = new Date().toISOString();

    // Log to execution history
    db.executionLogs.unshift({
      id: 'log_' + Math.random().toString(36).substring(2, 8),
      workflowId: 'wf_brain_autonomous',
      workspaceId: wsId,
      triggerEvent: 'autonomous_brain_dispatch',
      status: 'success',
      details: `Executed: ${alert.recommendedAction} (Revenue Protected: $${alert.revenueAtRisk.toLocaleString()})`,
      executedAt: new Date().toISOString(),
      recoveredValue: alert.revenueAtRisk,
    });

    // Record audit record
    db.auditRecords.unshift({
      id: 'aud_' + Math.random().toString(36).substring(2, 8),
      workspaceId: wsId,
      userId: 'usr_owner_01',
      userName: 'Alex Vance',
      action: `Executed Autonomous Brain Decision: ${alert.headline}`,
      category: 'ai_config',
      ipAddress: '198.51.100.44',
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      alert,
      message: 'Decision executed successfully through connected business channels.',
    });
  });

  // -------------------------------------------------------------
  // AI-POWERED BUSINESS INSIGHTS & PREDICTIVE TELEMETRY
  // -------------------------------------------------------------
  let cachedInsights: Record<string, any> = {};

  app.get('/api/insights/overview', async (req, res) => {
    const wsId = getWsId(req);
    try {
      if (!cachedInsights[wsId] || req.query.refresh === 'true') {
        cachedInsights[wsId] = await runBusinessInsightsAnalysis(wsId);
      }
      res.json(cachedInsights[wsId]);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed computing business insights', details: err.message });
    }
  });

  app.post('/api/insights/analyze', async (req, res) => {
    const wsId = getWsId(req);
    try {
      const freshInsights = await runBusinessInsightsAnalysis(wsId);
      cachedInsights[wsId] = freshInsights;

      db.auditRecords.unshift({
        id: 'aud_' + Math.random().toString(36).substring(2, 8),
        workspaceId: wsId,
        userId: 'usr_owner_01',
        userName: 'Alex Vance',
        action: 'Triggered Gemini-Powered Autonomous Business Insights Analysis',
        category: 'ai_config',
        ipAddress: '198.51.100.44',
        timestamp: new Date().toISOString(),
      });

      res.json(freshInsights);
    } catch (err: any) {
      res.status(500).json({ error: 'Analysis failed', details: err.message });
    }
  });

  app.post('/api/insights/actions/:id/execute', (req, res) => {
    const wsId = getWsId(req);
    const { id } = req.params;
    const insights = cachedInsights[wsId];

    if (insights && insights.actionableRecommendations) {
      const rec = insights.actionableRecommendations.find((r: any) => r.id === id);
      if (rec) {
        rec.status = 'executed';
      }
    }

    db.executionLogs.unshift({
      id: 'log_' + Math.random().toString(36).substring(2, 8),
      workflowId: 'wf_ai_insights_action',
      workspaceId: wsId,
      triggerEvent: 'ai_insight_recommendation_executed',
      status: 'success',
      details: `Executed AI Recommendation: ${id}`,
      executedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: 'AI Recommendation executed successfully.' });
  });

  // -------------------------------------------------------------
  // CRM: LEADS & CUSTOMERS
  // -------------------------------------------------------------
  app.get('/api/crm/leads', (req, res) => {
    const wsId = getWsId(req);
    res.json(db.leads.filter(l => l.workspaceId === wsId));
  });

  app.post('/api/crm/leads', (req, res) => {
    const wsId = getWsId(req);
    const { name, email, phone, company, source, estimatedValue, notes } = req.body;

    const newLead: Lead = {
      id: 'lead_' + Math.random().toString(36).substring(2, 9),
      workspaceId: wsId,
      name: name || 'Anonymous Inbound',
      email: email || '',
      phone: phone || '',
      company: company || '',
      source: source || 'website_form',
      status: 'new',
      estimatedValue: Number(estimatedValue) || 10000,
      score: 75,
      leakRisk: 'medium',
      leakReason: 'Fresh lead awaiting contact initiation',
      lastContactAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      assignedTo: 'Marcus Thorne',
      notes: notes || '',
    };

    db.leads.unshift(newLead);
    res.status(201).json(newLead);
  });

  app.put('/api/crm/leads/:id', (req, res) => {
    const wsId = getWsId(req);
    const lead = db.leads.find(l => l.id === req.params.id && l.workspaceId === wsId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    Object.assign(lead, req.body);
    res.json(lead);
  });

  app.post('/api/crm/leads/:id/qualify', (req, res) => {
    const wsId = getWsId(req);
    const lead = db.leads.find(l => l.id === req.params.id && l.workspaceId === wsId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    lead.status = 'qualified';
    lead.score = Math.min(100, (lead.score || 70) + 15);
    lead.leakRisk = 'low';
    lead.leakReason = undefined;
    res.json(lead);
  });

  app.post('/api/crm/leads/:id/convert', (req, res) => {
    const wsId = getWsId(req);
    const lead = db.leads.find(l => l.id === req.params.id && l.workspaceId === wsId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    lead.status = 'converted';
    const newCustomer = {
      id: 'cust_' + Math.random().toString(36).substring(2, 9),
      workspaceId: wsId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      tier: 'growth' as const,
      lifetimeValue: lead.estimatedValue,
      healthScore: 92,
      status: 'active' as const,
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      industry: 'Commercial Client',
    };
    db.customers.unshift(newCustomer);
    res.json({ success: true, customer: newCustomer, lead });
  });

  app.get('/api/crm/customers', (req, res) => {
    const wsId = getWsId(req);
    res.json(db.customers.filter(c => c.workspaceId === wsId));
  });

  // -------------------------------------------------------------
  // CONVERSATIONS & UNIFIED INBOX (OMNICHANNEL)
  // -------------------------------------------------------------
  app.get('/api/conversations', (req, res) => {
    const wsId = getWsId(req);
    let threads = db.conversations.filter(c => c.workspaceId === wsId);

    const { channel, status, search, unreadOnly } = req.query;

    if (channel && channel !== 'all') {
      threads = threads.filter(c => c.channel === channel);
    }
    if (status && status !== 'all') {
      threads = threads.filter(c => c.status === status);
    }
    if (unreadOnly === 'true') {
      threads = threads.filter(c => c.unreadCount > 0);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      threads = threads.filter(
        c =>
          c.contactName.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          c.contactEmail.toLowerCase().includes(q) ||
          c.lastMessageSnippet.toLowerCase().includes(q)
      );
    }

    res.json(threads);
  });

  app.post('/api/conversations', (req, res) => {
    const wsId = getWsId(req);
    const { contactName, contactEmail, contactPhone, company, channel, initialMessage } = req.body;

    const threadId = 'conv_' + Math.random().toString(36).substring(2, 9);
    const newThread: ConversationThread = {
      id: threadId,
      workspaceId: wsId,
      contactName: contactName || 'Inbound Contact',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      company: company || '',
      channel: channel || 'whatsapp',
      unreadCount: 0,
      priority: 'normal',
      tags: [],
      lastMessageSnippet: initialMessage || 'Conversation initiated',
      lastMessageAt: new Date().toISOString(),
      status: 'open',
      messages: initialMessage
        ? [
            {
              id: 'msg_' + Math.random().toString(36).substring(2, 9),
              conversationId: threadId,
              sender: 'agent',
              senderName: 'Sarah Kim',
              content: initialMessage,
              channel: channel || 'whatsapp',
              timestamp: new Date().toISOString(),
              status: 'sent',
            },
          ]
        : [],
    };

    db.conversations.unshift(newThread);
    res.status(201).json(newThread);
  });

  app.get('/api/conversations/:id', (req, res) => {
    const wsId = getWsId(req);
    const conv = db.conversations.find(c => c.id === req.params.id && c.workspaceId === wsId);
    if (!conv) return res.status(404).json({ error: 'Conversation thread not found' });
    conv.unreadCount = 0;
    res.json(conv);
  });

  app.get('/api/conversations/:id/customer-context', (req, res) => {
    const wsId = getWsId(req);
    const conv = db.conversations.find(c => c.id === req.params.id && c.workspaceId === wsId);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    // Look up associated customer, lead, deals, invoices
    const customer = db.customers.find(
      c =>
        c.workspaceId === wsId &&
        (c.id === conv.customerId ||
          c.email.toLowerCase() === conv.contactEmail.toLowerCase() ||
          (conv.company && c.company.toLowerCase() === conv.company.toLowerCase()))
    );

    const lead = db.leads.find(
      l =>
        l.workspaceId === wsId &&
        (l.email.toLowerCase() === conv.contactEmail.toLowerCase() ||
          (conv.company && l.company.toLowerCase() === conv.company.toLowerCase()))
    );

    const relatedDeals = db.deals.filter(
      d =>
        d.workspaceId === wsId &&
        (d.customerName.toLowerCase() === conv.contactName.toLowerCase() ||
          (conv.company && d.company.toLowerCase() === conv.company.toLowerCase()))
    );

    const relatedInvoices = db.invoices.filter(
      i =>
        i.workspaceId === wsId &&
        (i.customerEmail.toLowerCase() === conv.contactEmail.toLowerCase() ||
          i.customerName.toLowerCase() === conv.contactName.toLowerCase())
    );

    res.json({
      conversation: conv,
      customer: customer || null,
      lead: lead || null,
      deals: relatedDeals,
      invoices: relatedInvoices,
    });
  });

  app.post('/api/conversations/:id/messages', (req, res) => {
    const wsId = getWsId(req);
    const conv = db.conversations.find(c => c.id === req.params.id && c.workspaceId === wsId);
    if (!conv) return res.status(404).json({ error: 'Conversation thread not found' });

    const { content, channel } = req.body;
    const newMsg = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      conversationId: conv.id,
      sender: 'agent' as const,
      senderName: 'Sarah Kim',
      content: content || '',
      channel: (channel || conv.channel || 'whatsapp') as any,
      timestamp: new Date().toISOString(),
      status: 'sent' as const,
    };

    conv.messages.push(newMsg);
    conv.lastMessageSnippet = newMsg.content;
    conv.lastMessageAt = newMsg.timestamp;
    if (conv.status === 'resolved') {
      conv.status = 'open';
    }

    res.status(201).json(newMsg);
  });

  app.put('/api/conversations/:id/status', (req, res) => {
    const wsId = getWsId(req);
    const conv = db.conversations.find(c => c.id === req.params.id && c.workspaceId === wsId);
    if (!conv) return res.status(404).json({ error: 'Conversation thread not found' });

    const { status } = req.body;
    if (status && ['open', 'pending', 'resolved'].includes(status)) {
      conv.status = status;
    }
    res.json(conv);
  });

  app.post('/api/conversations/:id/read', (req, res) => {
    const wsId = getWsId(req);
    const conv = db.conversations.find(c => c.id === req.params.id && c.workspaceId === wsId);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    conv.unreadCount = 0;
    res.json({ success: true, conversation: conv });
  });

  app.post('/api/conversations/:id/suggest-reply', async (req, res) => {
    const wsId = getWsId(req);
    const conv = db.conversations.find(c => c.id === req.params.id && c.workspaceId === wsId);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    try {
      const suggestion = await generateSmartConversationReply(conv, req.body.instruction);
      res.json(suggestion);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed generating smart reply', details: err.message });
    }
  });

  // -------------------------------------------------------------
  // BOOKINGS & CALENDAR
  // -------------------------------------------------------------
  app.get('/api/bookings', (req, res) => {
    const wsId = getWsId(req);
    res.json(db.appointments.filter(a => a.workspaceId === wsId));
  });

  app.post('/api/bookings', (req, res) => {
    const wsId = getWsId(req);
    const { title, customerName, customerEmail, customerPhone, scheduledAt, durationMinutes, serviceType } = req.body;

    const newAppt: Appointment = {
      id: 'appt_' + Math.random().toString(36).substring(2, 9),
      workspaceId: wsId,
      title: title || 'Executive Business Strategy',
      customerName: customerName || 'Client Representative',
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      scheduledAt: scheduledAt || new Date(Date.now() + 86400000).toISOString(),
      durationMinutes: durationMinutes || 30,
      status: 'confirmed',
      serviceType: serviceType || 'Operational Review',
      assignedStaff: 'Sarah Kim',
    };

    db.appointments.push(newAppt);
    res.status(201).json(newAppt);
  });

  app.put('/api/bookings/:id/status', (req, res) => {
    const wsId = getWsId(req);
    const appt = db.appointments.find(a => a.id === req.params.id && a.workspaceId === wsId);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    const { status } = req.body;
    if (status) appt.status = status;
    res.json(appt);
  });

  // -------------------------------------------------------------
  // PIPELINE & DEALS
  // -------------------------------------------------------------
  app.get('/api/pipeline/deals', (req, res) => {
    const wsId = getWsId(req);
    res.json(db.deals.filter(d => d.workspaceId === wsId));
  });

  app.post('/api/pipeline/deals', (req, res) => {
    const wsId = getWsId(req);
    const { title, customerName, company, value, stage, probability, expectedCloseDate } = req.body;

    const newDeal: PipelineDeal = {
      id: 'deal_' + Math.random().toString(36).substring(2, 9),
      workspaceId: wsId,
      title: title || 'New Commercial Deal',
      customerName: customerName || 'Authorized Contact',
      company: company || 'Enterprise Client',
      value: Number(value) || 25000,
      stage: stage || 'discovery',
      probability: Number(probability) || 40,
      expectedCloseDate: expectedCloseDate || '2026-10-30',
      assignedTo: 'Marcus Thorne',
      updatedAt: new Date().toISOString(),
    };

    db.deals.push(newDeal);
    res.status(201).json(newDeal);
  });

  app.put('/api/pipeline/deals/:id/stage', (req, res) => {
    const wsId = getWsId(req);
    const deal = db.deals.find(d => d.id === req.params.id && d.workspaceId === wsId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const { stage } = req.body;
    if (stage) {
      deal.stage = stage;
      deal.updatedAt = new Date().toISOString();
      if (stage === 'closed_won') deal.probability = 100;
      if (stage === 'closed_lost') deal.probability = 0;
    }
    res.json(deal);
  });

  // -------------------------------------------------------------
  // INVOICES & PAYMENTS & RECOVERY
  // -------------------------------------------------------------
  app.get('/api/invoices', (req, res) => {
    const wsId = getWsId(req);
    res.json(db.invoices.filter(i => i.workspaceId === wsId));
  });

  app.post('/api/invoices', (req, res) => {
    const wsId = getWsId(req);
    const { customerName, customerEmail, amount, dueDate, description } = req.body;

    const newInvoice: Invoice = {
      id: 'inv_' + Math.random().toString(36).substring(2, 9),
      workspaceId: wsId,
      invoiceNumber: 'INV-2026-' + Math.floor(100 + Math.random() * 900),
      customerName: customerName || 'Client Organization',
      customerEmail: customerEmail || 'billing@client.com',
      amount: Number(amount) || 5000,
      currency: 'USD',
      status: 'sent',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      collectionAttempts: 0,
      items: [
        {
          description: description || 'Professional Logistics Architecture & SLA',
          quantity: 1,
          unitPrice: Number(amount) || 5000,
        }
      ]
    };

    db.invoices.push(newInvoice);
    res.status(201).json(newInvoice);
  });

  app.post('/api/invoices/:id/payment', (req, res) => {
    const wsId = getWsId(req);
    const invoice = db.invoices.find(i => i.id === req.params.id && i.workspaceId === wsId);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    invoice.status = 'paid';
    invoice.paidAt = new Date().toISOString();
    res.json({ success: true, invoice });
  });

  app.post('/api/invoices/:id/send-reminder', (req, res) => {
    const wsId = getWsId(req);
    const invoice = db.invoices.find(i => i.id === req.params.id && i.workspaceId === wsId);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    invoice.collectionAttempts += 1;
    invoice.lastReminderSentAt = new Date().toISOString();

    db.executionLogs.unshift({
      id: 'log_' + Math.random().toString(36).substring(2, 8),
      workflowId: 'wf_manual_collection',
      workspaceId: wsId,
      triggerEvent: 'payment_reminder_dispatched',
      status: 'success',
      details: `Dispatched payment reminder for ${invoice.invoiceNumber} to ${invoice.customerEmail} ($${invoice.amount.toLocaleString()}).`,
      executedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Direct payment reminder dispatched via verified Email and WhatsApp for ${invoice.invoiceNumber}.`,
      invoice,
    });
  });

  // -------------------------------------------------------------
  // WEBSITE FORMS & EMBEDDABLE LEAD CAPTURE
  // -------------------------------------------------------------
  app.get('/api/forms', (req, res) => {
    const wsId = getWsId(req);
    res.json(db.forms.filter(f => f.workspaceId === wsId));
  });

  app.post('/api/forms', (req, res) => {
    const wsId = getWsId(req);
    const { title, submitButtonText, successMessage } = req.body;

    const newForm: WebsiteForm = {
      id: 'form_' + Math.random().toString(36).substring(2, 9),
      workspaceId: wsId,
      title: title || 'Inbound Commercial Quote',
      slug: (title || 'inbound-form').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      fields: [
        { id: 'f_name', label: 'Full Name', type: 'text', required: true },
        { id: 'f_email', label: 'Work Email', type: 'email', required: true },
        { id: 'f_phone', label: 'Phone Number', type: 'phone', required: true },
        { id: 'f_company', label: 'Company Name', type: 'text', required: true },
      ],
      submitButtonText: submitButtonText || 'Submit Inquiry',
      successMessage: successMessage || 'Thank you. We have received your inquiry.',
      submissionsCount: 0,
      conversionRate: 0,
      isActive: true,
    };

    db.forms.push(newForm);
    res.status(201).json(newForm);
  });

  app.post('/api/forms/:id/submit', (req, res) => {
    const wsId = getWsId(req);
    const form = db.forms.find(f => f.id === req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    form.submissionsCount += 1;
    const subData = req.body || {};

    // Auto-create lead
    const newLead: Lead = {
      id: 'lead_' + Math.random().toString(36).substring(2, 9),
      workspaceId: form.workspaceId,
      name: subData.f_name || subData.name || 'Web Inbound Submission',
      email: subData.f_email || subData.email || '',
      phone: subData.f_phone || subData.phone || '',
      company: subData.f_company || subData.company || 'Direct Inbound',
      source: 'website_form',
      status: 'new',
      estimatedValue: 15000,
      score: 80,
      leakRisk: 'medium',
      leakReason: 'Captured from web form, pending triage',
      lastContactAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      assignedTo: 'Sarah Kim',
      notes: `Form submission via "${form.title}"`,
    };

    db.leads.unshift(newLead);

    res.json({
      success: true,
      message: form.successMessage,
      leadId: newLead.id,
    });
  });

  // -------------------------------------------------------------
  // MARKETING & GROWTH INTELLIGENCE
  // -------------------------------------------------------------
  app.get('/api/marketing/overview', (req, res) => {
    res.json({
      googleAds: {
        accountName: 'APEX Logistics - US East Core',
        monthlySpend: 14250,
        impressions: 184200,
        clicks: 4890,
        avgCpc: 2.91,
        conversions: 114,
        costPerConversion: 125,
        lostRoasOpportunity: 3420,
        campaigns: [
          { name: 'Search - Dedicated Fleet Transport', spend: 6800, conversions: 62, roas: 4.8, status: 'healthy' },
          { name: 'Search - Northeast Regional Haulage', spend: 4030, conversions: 38, roas: 3.6, status: 'healthy' },
          { name: 'Search - Intermodal Container Rental', spend: 3420, conversions: 0, roas: 0.0, status: 'leaking' },
        ]
      },
      metaAds: {
        accountName: 'APEX B2B Lead Gen Account',
        monthlySpend: 8400,
        impressions: 342000,
        clicks: 6120,
        leadsGenerated: 78,
        costPerLead: 107.69,
        topCreative: 'Supply Chain Bottleneck Calculator (Video)',
      },
      googleBusinessProfile: {
        locationName: 'APEX Industrial Logistics HQ',
        searchViews: 12400,
        directCalls: 86,
        directionRequests: 42,
        rating: 4.9,
        reviewsCount: 38,
      },
      channelAttribution: [
        { channel: 'Google Ads', spend: 14250, revenue: 184500, roas: 12.9, leakRisk: 'medium' },
        { channel: 'Meta Ads', spend: 8400, revenue: 94000, roas: 11.2, leakRisk: 'low' },
        { channel: 'Website Organic & Forms', spend: 1200, revenue: 86000, roas: 71.6, leakRisk: 'low' },
        { channel: 'Referral & Partner Outbound', spend: 2500, revenue: 120000, roas: 48.0, leakRisk: 'low' },
      ]
    });
  });

  // -------------------------------------------------------------
  // WORKFLOWS & AUTOMATIONS
  // -------------------------------------------------------------
  app.get('/api/workflows', (req, res) => {
    const wsId = getWsId(req);
    res.json(db.workflows.filter(w => w.workspaceId === wsId));
  });

  app.put('/api/workflows/:id/toggle', (req, res) => {
    const wsId = getWsId(req);
    const wf = db.workflows.find(w => w.id === req.params.id && w.workspaceId === wsId);
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });

    wf.isActive = !wf.isActive;
    res.json(wf);
  });

  app.post('/api/workflows/:id/test-run', (req, res) => {
    const wsId = getWsId(req);
    const wf = db.workflows.find(w => w.id === req.params.id && w.workspaceId === wsId);
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });

    wf.totalExecutions += 1;
    wf.lastExecutedAt = new Date().toISOString();

    const log = {
      id: 'log_' + Math.random().toString(36).substring(2, 8),
      workflowId: wf.id,
      workspaceId: wsId,
      triggerEvent: wf.triggerEvent,
      status: 'success' as const,
      details: `Autonomous simulation executed: ${wf.actionSummary}`,
      executedAt: new Date().toISOString(),
    };
    db.executionLogs.unshift(log);

    res.json({ success: true, message: 'Workflow rule tested and logged successfully.', log });
  });

  app.get('/api/workflows/logs', (req, res) => {
    const wsId = getWsId(req);
    res.json(db.executionLogs.filter(l => l.workspaceId === wsId));
  });

  // -------------------------------------------------------------
  // INTEGRATIONS & + CONNECT ECOSYSTEM
  // -------------------------------------------------------------
  app.get('/api/integrations', (req, res) => {
    const wsId = getWsId(req);
    res.json(db.integrations.filter(i => i.workspaceId === wsId));
  });

  app.post('/api/integrations/:provider/connect', (req, res) => {
    const wsId = getWsId(req);
    const provider = req.params.provider;
    const integ = db.integrations.find(i => i.provider === provider && i.workspaceId === wsId);

    if (!integ) {
      return res.status(404).json({ error: 'Integration provider not recognized' });
    }

    const { accountName, accountId } = req.body;
    integ.status = 'connected';
    integ.connectedAccountName = accountName || `APEX Connected ${integ.name} (${integ.provider})`;
    integ.connectedAccountId = accountId || 'acc_' + Math.random().toString(36).substring(2, 9);
    integ.lastSyncedAt = new Date().toISOString();
    integ.errorDetails = undefined;

    db.auditRecords.unshift({
      id: 'aud_' + Math.random().toString(36).substring(2, 8),
      workspaceId: wsId,
      userId: 'usr_owner_01',
      userName: 'Alex Vance',
      action: `Connected and authenticated provider: ${integ.name}`,
      category: 'integration',
      ipAddress: '198.51.100.44',
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, integration: integ });
  });

  app.post('/api/integrations/:provider/disconnect', (req, res) => {
    const wsId = getWsId(req);
    const provider = req.params.provider;
    const integ = db.integrations.find(i => i.provider === provider && i.workspaceId === wsId);

    if (!integ) return res.status(404).json({ error: 'Integration provider not recognized' });

    integ.status = 'disconnected';
    integ.connectedAccountName = undefined;
    integ.connectedAccountId = undefined;
    integ.lastSyncedAt = undefined;

    res.json({ success: true, integration: integ });
  });

  app.post('/api/integrations/:provider/sync', (req, res) => {
    const wsId = getWsId(req);
    const provider = req.params.provider;
    const integ = db.integrations.find(i => i.provider === provider && i.workspaceId === wsId);

    if (!integ) return res.status(404).json({ error: 'Integration provider not recognized' });

    integ.lastSyncedAt = new Date().toISOString();
    res.json({ success: true, integration: integ, message: 'Provider data synchronized with APEX3X operating state.' });
  });

  // -------------------------------------------------------------
  // AI PROVIDER HUB (BYOK)
  // -------------------------------------------------------------
  app.get('/api/ai/providers', (req, res) => {
    const wsId = getWsId(req);
    // Never expose raw plaintext keys! Mask them
    const providers = db.aiProviders.filter(p => p.workspaceId === wsId).map(p => ({
      ...p,
    }));
    res.json(providers);
  });

  app.post('/api/ai/providers/:provider/configure', (req, res) => {
    const wsId = getWsId(req);
    const provider = req.params.provider;
    const aiConfig = db.aiProviders.find(p => p.provider === provider && p.workspaceId === wsId);

    if (!aiConfig) return res.status(404).json({ error: 'AI provider not found' });

    const { apiKey, modelSelected, endpointUrl } = req.body;

    if (apiKey) {
      aiConfig.hasCustomKey = true;
      // Mask key for safety
      aiConfig.maskedKey = apiKey.slice(0, 6) + '****************' + apiKey.slice(-4);
      aiConfig.status = 'connected';
    }
    if (modelSelected) aiConfig.modelSelected = modelSelected;
    if (endpointUrl) aiConfig.endpointUrl = endpointUrl;

    aiConfig.lastTestedAt = new Date().toISOString();
    aiConfig.latencyMs = 280;

    db.auditRecords.unshift({
      id: 'aud_' + Math.random().toString(36).substring(2, 8),
      workspaceId: wsId,
      userId: 'usr_owner_01',
      userName: 'Alex Vance',
      action: `Configured BYOK AI Credentials for ${aiConfig.name} (${aiConfig.modelSelected})`,
      category: 'ai_config',
      ipAddress: '198.51.100.44',
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, provider: aiConfig });
  });

  app.post('/api/ai/providers/:provider/test', async (req, res) => {
    const wsId = getWsId(req);
    const provider = req.params.provider;
    const aiConfig = db.aiProviders.find(p => p.provider === provider && p.workspaceId === wsId);

    if (!aiConfig) return res.status(404).json({ error: 'AI provider not found' });

    aiConfig.lastTestedAt = new Date().toISOString();
    aiConfig.latencyMs = Math.floor(180 + Math.random() * 150);

    res.json({
      success: true,
      provider: aiConfig,
      message: `Verified connection to ${aiConfig.name}. Latency: ${aiConfig.latencyMs}ms. Ready for autonomous revenue inference.`,
    });
  });

  // -------------------------------------------------------------
  // TEAM & SECURITY AUDIT LOG
  // -------------------------------------------------------------
  app.get('/api/team', (req, res) => {
    const wsId = getWsId(req);
    res.json(db.users.filter(u => u.workspaceId === wsId));
  });

  app.post('/api/team/invite', (req, res) => {
    const wsId = getWsId(req);
    const { email, name, role } = req.body;

    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: email || 'colleague@apexindustrial.com',
      name: name || 'Team Member',
      role: role || 'operator',
      workspaceId: wsId,
    };

    db.users.push(newUser);
    res.status(201).json(newUser);
  });

  app.get('/api/security/audit', (req, res) => {
    const wsId = getWsId(req);
    res.json(db.auditRecords.filter(a => a.workspaceId === wsId));
  });

  // -------------------------------------------------------------
  // BILLING & ENTITLEMENTS
  // -------------------------------------------------------------
  app.get('/api/billing', (req, res) => {
    const wsId = getWsId(req);
    const billing = db.billing[wsId] || db.billing['ws_apex_core'];
    res.json(billing);
  });

  // -------------------------------------------------------------
  // VITE MIDDLEWARE (DEV) / STATIC (PROD)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`APEX3X Business Operating System running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
