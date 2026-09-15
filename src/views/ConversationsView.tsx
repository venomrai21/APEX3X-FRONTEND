import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  CheckCheck,
  Search,
  Bot,
  Sparkles,
  Zap,
  Globe,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  DollarSign,
  Briefcase,
  Calendar,
  AlertCircle,
  Building2,
  UserCheck,
  FileText,
  Plus,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { ConversationThread, ConversationMessage, Customer, Lead, PipelineDeal, Invoice, IntegrationConnection } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const ConversationsView: React.FC = () => {
  const { addToast, refreshKey, setActiveNav } = useApp();
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [currentThread, setCurrentThread] = useState<ConversationThread | null>(null);
  const [customerContext, setCustomerContext] = useState<{
    customer: Customer | null;
    lead: Lead | null;
    deals: PipelineDeal[];
    invoices: Invoice[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [contextLoading, setContextLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [generatingReply, setGeneratingReply] = useState(false);
  const [channelMode, setChannelMode] = useState<'whatsapp' | 'email' | 'web_chat' | 'internal' | 'sms'>('whatsapp');
  
  // New conversation modal state
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newChannel, setNewChannel] = useState<'whatsapp' | 'email' | 'web_chat'>('whatsapp');
  const [newInitialMsg, setNewInitialMsg] = useState('');
  const [creatingConversation, setCreatingConversation] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const isWhatsAppConnected = integrations.some(i => i.provider === 'whatsapp_cloud' && i.status === 'connected');
  const isEmailConnected = integrations.some(i => i.provider === 'resend_email' && i.status === 'connected');

  const fetchThreads = async (preserveActiveId?: string) => {
    try {
      setLoading(true);
      const [res, intRes] = await Promise.all([
        api.getConversations({
          channel: channelFilter !== 'all' ? channelFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: search.trim() || undefined,
          unreadOnly: unreadOnly || undefined,
        }),
        api.getIntegrations().catch(() => [])
      ]);
      setThreads(res);
      setIntegrations(intRes);

      const targetId = preserveActiveId || activeThreadId || (res.length > 0 ? res[0].id : null);
      if (targetId && res.some(t => t.id === targetId)) {
        setActiveThreadId(targetId);
        loadThreadDetails(targetId);
      } else if (res.length > 0) {
        setActiveThreadId(res[0].id);
        loadThreadDetails(res[0].id);
      } else {
        setCurrentThread(null);
        setCustomerContext(null);
      }
    } catch (err) {
      console.error('Failed fetching conversations:', err);
      addToast({
        type: 'error',
        title: 'Conversations Sync Error',
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadThreadDetails = async (id: string) => {
    try {
      setContextLoading(true);
      const [thread, ctx] = await Promise.all([
        api.getConversation(id),
        api.getConversationCustomerContext(id)
      ]);
      setCurrentThread(thread);
      setChannelMode(
        thread.channel === 'email'
          ? 'email'
          : thread.channel === 'web_chat'
          ? 'web_chat'
          : 'whatsapp'
      );
      setCustomerContext({
        customer: ctx.customer,
        lead: ctx.lead,
        deals: ctx.deals,
        invoices: ctx.invoices,
      });
    } catch (err) {
      console.error('Failed loading thread details:', err);
    } finally {
      setContextLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [refreshKey, channelFilter, statusFilter, unreadOnly]);

  const handleSelectThread = (id: string) => {
    if (id === activeThreadId) return;
    setActiveThreadId(id);
    loadThreadDetails(id);
  };

  const handleSendMessage = async () => {
    if (!replyText.trim() || !activeThreadId || !currentThread) return;
    try {
      setSending(true);
      const newMsg = await api.sendMessage(activeThreadId, replyText.trim(), channelMode);
      
      setCurrentThread(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, newMsg],
          lastMessageSnippet: newMsg.content,
          lastMessageAt: newMsg.timestamp,
        };
      });

      // Update thread in list
      setThreads(prev =>
        prev.map(t =>
          t.id === activeThreadId
            ? {
                ...t,
                lastMessageSnippet: newMsg.content,
                lastMessageAt: newMsg.timestamp,
                messages: [...t.messages, newMsg],
              }
            : t
        )
      );

      setReplyText('');
      addToast({
        type: 'success',
        title: 'Message Dispatched',
        description: `Delivered via ${channelMode.toUpperCase()} to ${currentThread.contactName}.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Dispatch Failed',
        description: (err as Error).message,
      });
    } finally {
      setSending(false);
    }
  };

  const handleGenerateSmartReply = async () => {
    if (!activeThreadId || !currentThread) return;
    try {
      setGeneratingReply(true);
      const res = await api.getConversationSmartReply(activeThreadId);
      setReplyText(res.replyText);
      addToast({
        type: 'info',
        title: 'AI Draft Formulated',
        description: 'Gemini 3.8 Flash analyzed recent context to generate response.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'AI Draft Error',
        description: (err as Error).message,
      });
    } finally {
      setGeneratingReply(false);
    }
  };

  const handleUpdateStatus = async (status: 'open' | 'pending' | 'resolved') => {
    if (!activeThreadId || !currentThread) return;
    try {
      const updated = await api.updateConversationStatus(activeThreadId, status);
      setCurrentThread(updated);
      setThreads(prev => prev.map(t => (t.id === activeThreadId ? { ...t, status } : t)));
      addToast({
        type: 'success',
        title: 'Thread Status Updated',
        description: `Marked conversation as ${status.toUpperCase()}.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Status Update Failed',
        description: (err as Error).message,
      });
    }
  };

  const handleSendInvoiceReminder = async (invoiceId: string) => {
    try {
      const res = await api.sendInvoiceReminder(invoiceId);
      addToast({
        type: 'success',
        title: 'Payment Reminder Dispatched',
        description: res.message,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Reminder Failed',
        description: (err as Error).message,
      });
    }
  };

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) {
      addToast({ type: 'warning', title: 'Contact Name Required', description: 'Please provide a name for this conversation.' });
      return;
    }
    try {
      setCreatingConversation(true);
      const thread = await api.createConversation({
        contactName: newContactName.trim(),
        company: newCompany.trim() || undefined,
        contactEmail: newEmail.trim() || undefined,
        contactPhone: newPhone.trim() || undefined,
        channel: newChannel,
        initialMessage: newInitialMsg.trim() || undefined,
      });

      setThreads(prev => [thread, ...prev]);
      setActiveThreadId(thread.id);
      loadThreadDetails(thread.id);
      setNewModalOpen(false);
      setNewContactName('');
      setNewCompany('');
      setNewEmail('');
      setNewPhone('');
      setNewInitialMsg('');

      addToast({
        type: 'success',
        title: 'Conversation Started',
        description: `Active thread established with ${thread.contactName}.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Start Conversation',
        description: (err as Error).message,
      });
    } finally {
      setCreatingConversation(false);
    }
  };

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
            <MessageSquare className="w-2.5 h-2.5 text-zinc-400" /> WhatsApp
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
            <Mail className="w-2.5 h-2.5 text-zinc-400" /> Email
          </span>
        );
      case 'web_chat':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
            <Globe className="w-2.5 h-2.5 text-zinc-400" /> Web Chat
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
            <MessageSquare className="w-2.5 h-2.5 text-zinc-400" /> Omnichannel
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12" id="unified-inbox-root">
      {/* Header & Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif-display font-bold text-zinc-100 tracking-tight">
              Unified Communications Inbox
            </h1>
            <Badge variant="gold" size="sm">
              Multi-Channel Live Sync
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Aggregated conversations stream across WhatsApp Cloud, verified Resend Email, and Inbound Web Chat with automated customer intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="btn-sync-all-channels"
            variant="secondary"
            size="sm"
            onClick={() => fetchThreads()}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
          >
            Sync All Channels
          </Button>
          <Button
            id="btn-new-conversation"
            variant="primary"
            size="sm"
            onClick={() => setNewModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5 text-zinc-950" />}
          >
            New Conversation
          </Button>
        </div>
      </div>

      {/* Main 3-Column Unified Inbox Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-[720px] bg-[#09090e] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
        
        {/* ========================================================= */}
        {/* COLUMN 1: THREAD LIST & FILTERS (4 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 border-r border-white/[0.08] flex flex-col bg-[#07070b]">
          
          {/* Search & Channel Selector */}
          <div className="p-3 border-b border-white/[0.08] space-y-2.5 bg-[#09090f]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by contact, company, message..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') fetchThreads();
                }}
                className="w-full bg-[#12121c] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Channel Filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'whatsapp', label: 'WhatsApp' },
                { id: 'email', label: 'Email' },
                { id: 'web_chat', label: 'Web Chat' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setChannelFilter(c.id)}
                  className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    channelFilter === c.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-zinc-400 hover:text-zinc-200 bg-white/[0.02]'
                  }`}
                >
                  {c.label}
                </button>
              ))}

              <button
                onClick={() => setUnreadOnly(prev => !prev)}
                className={`ml-auto px-2 py-1 text-[11px] rounded font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  unreadOnly
                    ? 'bg-amber-500 text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 bg-white/[0.02]'
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Disconnected Channel Status Banners */}
          {channelFilter === 'whatsapp' && !isWhatsAppConnected && (
            <div className="p-3 mx-3 my-2 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-amber-300 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                WhatsApp Cloud API Disconnected
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                WhatsApp integration is currently inactive for this workspace. Messages received or sent will only be simulated locally until Meta Business is configured.
              </p>
              <button
                onClick={() => setActiveNav('settings')}
                className="mt-1.5 text-[11px] text-amber-400 hover:underline flex items-center gap-0.5 font-medium"
              >
                Configure WhatsApp <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {channelFilter === 'email' && !isEmailConnected && (
            <div className="p-3 mx-3 my-2 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-amber-300 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Email Integration Disconnected
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Resend Email integration is currently disconnected for this workspace. Connect your email service in Settings to deliver verified outbound emails.
              </p>
              <button
                onClick={() => setActiveNav('settings')}
                className="mt-1.5 text-[11px] text-amber-400 hover:underline flex items-center gap-0.5 font-medium"
              >
                Configure Email <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : threads.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-zinc-300 font-medium">No conversations found</p>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  {search || channelFilter !== 'all' || statusFilter !== 'all' || unreadOnly
                    ? 'No conversations match the selected filter criteria.'
                    : 'No persisted conversation records exist in this workspace. Start an outreach conversation or sync incoming messages.'}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  {search || channelFilter !== 'all' || statusFilter !== 'all' || unreadOnly ? (
                    <button
                      onClick={() => {
                        setSearch('');
                        setChannelFilter('all');
                        setStatusFilter('all');
                        setUnreadOnly(false);
                      }}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      Reset filters
                    </button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setNewModalOpen(true)}
                      className="text-xs"
                    >
                      Start Conversation
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              threads.map(thread => {
                const isSelected = thread.id === activeThreadId;
                const hasUnread = thread.unreadCount > 0;

                return (
                  <button
                    key={thread.id}
                    onClick={() => handleSelectThread(thread.id)}
                    className={`w-full p-3.5 text-left transition-colors cursor-pointer relative group ${
                      isSelected
                        ? 'bg-[#141420] border-l-2 border-amber-500'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        <span className={`text-xs font-semibold truncate ${isSelected ? 'text-amber-200' : 'text-zinc-200'}`}>
                          {thread.contactName}
                        </span>
                        {thread.company && (
                          <span className="text-[10px] text-zinc-500 truncate hidden sm:inline">
                            &bull; {thread.company}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                        {new Date(thread.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className={`text-xs line-clamp-1 leading-snug mb-2 ${hasUnread ? 'text-zinc-200 font-medium' : 'text-zinc-400'}`}>
                      {thread.lastMessageSnippet}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {getChannelBadge(thread.channel)}
                        {thread.priority === 'high' && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-red-950/60 text-red-300 border border-red-500/20">
                            HIGH
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {thread.status === 'resolved' && (
                          <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Resolved
                          </span>
                        )}
                        {hasUnread && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold font-mono">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: ACTIVE THREAD & CHAT (5 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 border-r border-white/[0.08] flex flex-col bg-[#0b0b12]">
          {currentThread ? (
            <>
              {/* Active Header */}
              <div className="p-3.5 px-4 border-b border-white/[0.08] bg-[#09090f] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-100 truncate">
                      {currentThread.contactName}
                    </h3>
                    {getChannelBadge(currentThread.channel)}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">
                    {currentThread.contactEmail || currentThread.contactPhone}
                  </div>
                </div>

                {/* Status Switcher Action */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {currentThread.status !== 'resolved' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateStatus('resolved')}
                      title="Mark conversation resolved"
                      leftIcon={<CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    >
                      Resolve
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateStatus('open')}
                      title="Reopen conversation"
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>

              {/* Message History Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {currentThread.messages.map(msg => {
                  const isAgent = msg.sender === 'agent';
                  const isSystem = msg.sender === 'system' || msg.sender === 'ai';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
                          <Bot className="w-3 h-3 text-amber-400" />
                          <span>{msg.content}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-zinc-500 mb-1 px-1 font-mono flex items-center gap-1.5">
                        <span>{isAgent ? 'Sarah Kim (APEX)' : currentThread.contactName}</span>
                        <span>&bull;</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`max-w-md p-3 rounded-xl text-xs leading-relaxed ${
                          isAgent
                            ? 'bg-amber-500/15 border border-amber-500/30 text-zinc-100 rounded-tr-none'
                            : 'bg-[#13131d] border border-white/[0.08] text-zinc-200 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-[9px] font-mono text-zinc-500 px-1">
                        <span className="uppercase">{msg.channel}</span>
                        {isAgent && (
                          <span className="flex items-center gap-0.5 text-zinc-400">
                            &bull; <CheckCheck className="w-2.5 h-2.5 text-amber-400" /> Delivered
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI & Canned Replies Toolbar */}
              <div className="px-3 py-2 border-t border-white/[0.06] bg-[#07070b] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>AI Copilot & Fast Replies:</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    isLoading={generatingReply}
                    onClick={handleGenerateSmartReply}
                    className="text-[10px] text-amber-300 hover:text-amber-200 h-6 px-2"
                  >
                    Draft with Gemini
                  </Button>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {/* Real contextual action based on actual customer invoices */}
                  {customerContext?.invoices && customerContext.invoices.length > 0 && (
                    <button
                      onClick={() => {
                        const inv = customerContext.invoices.find(i => i.status === 'overdue') || customerContext.invoices[0];
                        setReplyText(
                          `Hi ${currentThread.contactName}, following up regarding invoice ${inv.invoiceNumber} for $${inv.amount.toLocaleString()} (due date: ${inv.dueDate}). Please let us know if you need updated payment details or remittance support.`
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-white/[0.03] hover:bg-white/[0.06] text-[10px] text-zinc-300 border border-white/[0.06] whitespace-nowrap cursor-pointer flex items-center gap-1 font-mono"
                    >
                      <FileText className="w-2.5 h-2.5 text-amber-400" />
                      Invoice #{customerContext.invoices[0].invoiceNumber}
                    </button>
                  )}

                  {/* Real contextual action based on actual deals */}
                  {customerContext?.deals && customerContext.deals.length > 0 && (
                    <button
                      onClick={() => {
                        const deal = customerContext.deals[0];
                        setReplyText(
                          `Hi ${currentThread.contactName}, following up on our proposal regarding ${deal.title}. We are ready to proceed with stage milestones at your convenience.`
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-white/[0.03] hover:bg-white/[0.06] text-[10px] text-zinc-300 border border-white/[0.06] whitespace-nowrap cursor-pointer flex items-center gap-1 font-mono"
                    >
                      <Briefcase className="w-2.5 h-2.5 text-amber-400" />
                      Deal: {customerContext.deals[0].title.slice(0, 18)}...
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setReplyText(
                        `Hi ${currentThread.contactName}, thank you for reaching out. We have logged your request and our team is currently reviewing the specifications. We will follow up shortly.`
                      )
                    }
                    className="px-2 py-0.5 rounded bg-white/[0.03] hover:bg-white/[0.06] text-[10px] text-zinc-300 border border-white/[0.06] whitespace-nowrap cursor-pointer"
                  >
                    Acknowledge & Review
                  </button>

                  <button
                    onClick={() =>
                      setReplyText(
                        `Hi ${currentThread.contactName}, confirmed. We have verified your information and updated our operations records accordingly.`
                      )
                    }
                    className="px-2 py-0.5 rounded bg-white/[0.03] hover:bg-white/[0.06] text-[10px] text-zinc-300 border border-white/[0.06] whitespace-nowrap cursor-pointer"
                  >
                    Confirm & Update
                  </button>
                </div>
              </div>

              {/* Compose Bar */}
              <div className="p-3 border-t border-white/[0.08] bg-[#09090f] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500 font-mono">
                    Dispatch via:
                  </span>
                  <div className="flex items-center gap-1 bg-[#12121c] p-0.5 rounded-lg border border-white/[0.08]">
                    <button
                      onClick={() => setChannelMode('whatsapp')}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                        channelMode === 'whatsapp'
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => setChannelMode('email')}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                        channelMode === 'email'
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      onClick={() => setChannelMode('web_chat')}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                        channelMode === 'web_chat'
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Web Chat
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Type message to ${currentThread.contactName} via ${channelMode.toUpperCase()}... (Press Enter)`}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-[#12121c] border border-white/[0.08] rounded-lg px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={sending}
                    onClick={handleSendMessage}
                    rightIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState
                icon={<MessageSquare className="w-6 h-6 text-zinc-500" />}
                title="Select a Conversation"
                description="Select a conversation thread from the left to view omnichannel message history and respond."
              />
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* COLUMN 3: CUSTOMER CONTEXT & LINKED DATA (3 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 flex flex-col bg-[#07070b] overflow-y-auto p-4 space-y-4">
          <div className="border-b border-white/[0.08] pb-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              Customer 360 Telemetry
            </h4>
          </div>

          {contextLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          ) : currentThread ? (
            <>
              {/* Account Identity Card */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Account Profile</span>
                  {customerContext?.customer ? (
                    <Badge variant="success" size="sm">Active Client</Badge>
                  ) : customerContext?.lead ? (
                    <Badge variant="warning" size="sm">Inbound Lead</Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">Prospect</Badge>
                  )}
                </div>

                <div className="font-semibold text-zinc-100 text-sm">
                  {currentThread.company || currentThread.contactName}
                </div>

                <div className="text-xs text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-zinc-500" />
                    <span className="truncate">{currentThread.contactEmail || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-zinc-500" />
                    <span>{currentThread.contactPhone || 'N/A'}</span>
                  </div>
                </div>

                {customerContext?.customer && (
                  <div className="pt-2 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-mono block">LIFETIME VALUE</span>
                      <span className="font-mono text-amber-300 font-semibold">
                        ${customerContext.customer.lifetimeValue.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 font-mono block">HEALTH SCORE</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {customerContext.customer.healthScore} / 100
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Pipeline Deals */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-amber-400" /> Pipeline Deals
                  </span>
                  <button
                    onClick={() => setActiveNav('pipeline')}
                    className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    View <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                </div>

                {customerContext?.deals && customerContext.deals.length > 0 ? (
                  <div className="space-y-2">
                    {customerContext.deals.map(deal => (
                      <div
                        key={deal.id}
                        className="p-2.5 rounded-lg bg-[#0e0e16] border border-white/[0.04] space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-zinc-200 truncate">{deal.title}</span>
                          <span className="font-mono text-amber-300 font-semibold shrink-0">
                            ${deal.value.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                          <span className="capitalize">{deal.stage.replace('_', ' ')}</span>
                          <span>{deal.probability}% Win Prob.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">No active deals in pipeline.</p>
                )}
              </div>

              {/* Outstanding Invoices & AR */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold flex items-center gap-1">
                    <FileText className="w-3 h-3 text-amber-400" /> Linked Invoices
                  </span>
                  <button
                    onClick={() => setActiveNav('invoices')}
                    className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    Ledger <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                </div>

                {customerContext?.invoices && customerContext.invoices.length > 0 ? (
                  <div className="space-y-2">
                    {customerContext.invoices.map(inv => (
                      <div
                        key={inv.id}
                        className="p-2.5 rounded-lg bg-[#0e0e16] border border-white/[0.04] space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-zinc-300">{inv.invoiceNumber}</span>
                          <span className="font-mono font-semibold text-zinc-100">
                            ${inv.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className={inv.status === 'overdue' ? 'text-red-400 font-semibold' : 'text-zinc-400'}>
                            {inv.status.toUpperCase()} (Due {inv.dueDate})
                          </span>
                        </div>

                        {inv.status === 'overdue' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSendInvoiceReminder(inv.id)}
                            className="w-full text-[10px] h-6 mt-1"
                          >
                            Dispatch Statement
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">No pending invoices recorded.</p>
                )}
              </div>

              {/* Quick Module Jump */}
              <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                  Connected System Navigation
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveNav('leads')}
                    className="text-[11px] justify-start h-7"
                    leftIcon={<UserCheck className="w-3 h-3 text-zinc-400" />}
                  >
                    CRM Leads
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveNav('bookings')}
                    className="text-[11px] justify-start h-7"
                    leftIcon={<Calendar className="w-3 h-3 text-zinc-400" />}
                  >
                    Book Call
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-zinc-500">Select a thread to view customer telemetry.</p>
          )}
        </div>

      </div>

      {/* New Conversation Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0c0c14] border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#09090f]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-serif-display font-semibold text-zinc-100">
                  Initiate Outreach Conversation
                </h3>
              </div>
              <button
                onClick={() => setNewModalOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateConversation} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Miller"
                    value={newContactName}
                    onChange={e => setNewContactName(e.target.value)}
                    className="w-full bg-[#141420] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Freight Co"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    className="w-full bg-[#141420] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="contact@company.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full bg-[#141420] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Phone / Mobile
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2831"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full bg-[#141420] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Primary Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'whatsapp' as const, label: 'WhatsApp' },
                    { id: 'email' as const, label: 'Email' },
                    { id: 'web_chat' as const, label: 'Web Chat' },
                  ].map(ch => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setNewChannel(ch.id)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                        newChannel === ch.id
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                          : 'bg-[#141420] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Initial Message (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter message to send upon creating the thread..."
                  value={newInitialMsg}
                  onChange={e => setNewInitialMsg(e.target.value)}
                  className="w-full bg-[#141420] border border-white/[0.08] rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={creatingConversation}
                  leftIcon={<Send className="w-3.5 h-3.5 text-zinc-950" />}
                >
                  Start Thread
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
