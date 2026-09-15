import React, { useState, useEffect } from 'react';
import { Search, Command, ArrowRight, Bot, Zap, PlusCircle, Plug, FileText, UserPlus, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavItemKey } from '../../types';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveNav,
    setConnectDrawerOpen,
    addToast,
    triggerRefresh,
  } = useApp();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery('');
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const quickActions = [
    {
      id: 'act_brain',
      label: 'Run Autonomous Revenue Audit',
      category: 'Autonomous Brain',
      icon: <Bot className="w-4 h-4 text-zinc-300 group-hover:text-amber-400" />,
      action: () => {
        setActiveNav('brain');
        setCommandPaletteOpen(false);
        addToast({
          type: 'info',
          title: 'Autonomous Scan Triggered',
          description: 'Evaluating current leads, receivables, and conversion velocities.',
        });
      },
    },
    {
      id: 'act_lead',
      label: 'Add Inbound Lead',
      category: 'CRM',
      icon: <UserPlus className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />,
      action: () => {
        setActiveNav('leads');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act_invoice',
      label: 'Create Commercial Invoice',
      category: 'Revenue',
      icon: <FileText className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />,
      action: () => {
        setActiveNav('invoices');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act_booking',
      label: 'Schedule Customer Strategy Session',
      category: 'Bookings',
      icon: <Calendar className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />,
      action: () => {
        setActiveNav('bookings');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act_connect',
      label: '+ Connect Provider (WhatsApp, Stripe, Google, AI)',
      category: 'Ecosystem',
      icon: <Plug className="w-4 h-4 text-zinc-400 group-hover:text-amber-400" />,
      action: () => {
        setCommandPaletteOpen(false);
        setConnectDrawerOpen(true);
      },
    },
  ];

  const navigationTargets: { label: string; key: NavItemKey; category: string }[] = [
    { label: 'Operational Command Center', key: 'dashboard', category: 'Navigation' },
    { label: 'APEX3X Autonomous Brain', key: 'brain', category: 'Navigation' },
    { label: 'AI Business Insights & Predictive Loss Telemetry', key: 'insights', category: 'Navigation' },
    { label: 'CRM & Qualified Leads', key: 'leads', category: 'Navigation' },
    { label: 'Customer Directory & LTV', key: 'customers', category: 'Navigation' },
    { label: 'Unified Conversations (WhatsApp & Email)', key: 'conversations', category: 'Navigation' },
    { label: 'Appointments & Calendar Availability', key: 'bookings', category: 'Navigation' },
    { label: 'Sales Pipeline & Commercial Deals', key: 'pipeline', category: 'Navigation' },
    { label: 'Invoices, Collections & Payments', key: 'invoices', category: 'Navigation' },
    { label: 'Forms & Website Capture', key: 'forms', category: 'Navigation' },
    { label: 'Marketing & Ad Intelligence (Google, Meta)', key: 'marketing', category: 'Navigation' },
    { label: 'Workflows & Autonomous Rules', key: 'workflows', category: 'Navigation' },
    { label: 'Integration Ecosystem & + Connect Hub', key: 'integrations', category: 'Navigation' },
    { label: 'AI Provider Hub (BYOK Gemini, OpenAI, Anthropic)', key: 'ai_hub', category: 'Navigation' },
    { label: 'Team Members & Security Audit Log', key: 'team', category: 'Navigation' },
    { label: 'Billing & Entitlements', key: 'billing', category: 'Navigation' },
    { label: 'Workspace Profile & Verification', key: 'settings', category: 'Navigation' },
  ];

  const filteredActions = quickActions.filter(
    a => a.label.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredNav = navigationTargets.filter(
    n => n.label.toLowerCase().includes(query.toLowerCase()) || n.key.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={() => setCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-xl bg-[#0c0c12] border border-white/[0.14] rounded-xl shadow-2xl shadow-black/95 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] bg-[#09090d]">
          <Search className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, module, or business action..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-zinc-400 bg-white/[0.06] border border-white/[0.08] rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {filteredActions.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Instant Business Actions
              </p>
              <div className="space-y-1">
                {filteredActions.map(action => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-zinc-200 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded bg-white/[0.04] border border-white/[0.06]">
                        {action.icon}
                      </div>
                      <span className="font-medium">{action.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredNav.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Operating System Modules
              </p>
              <div className="space-y-0.5">
                {filteredNav.map(nav => (
                  <button
                    key={nav.key}
                    onClick={() => {
                      setActiveNav(nav.key);
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                      <span>{nav.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase">{nav.key}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredActions.length === 0 && filteredNav.length === 0 && (
            <div className="py-8 text-center text-xs text-zinc-500">
              No actions matching &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-[#08080b] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Command className="w-3 h-3 text-amber-500/80" /> APEX3X Command System
          </span>
          <span>&uarr;&darr; Navigate &middot; &crarr; Select</span>
        </div>
      </div>
    </div>
  );
};
