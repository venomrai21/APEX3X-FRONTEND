import React, { useMemo, useState } from 'react';
import { Globe2, KeyRound, Webhook, Braces, Server, ShieldCheck, X, Search, MessageCircle, Instagram, Facebook, Chrome, Megaphone, CreditCard, CalendarDays, ShoppingBag, Database, Mail, Code2 } from 'lucide-react';
import { AnimatedInput, AnimatedTabs } from '../apex3x/adapters';
import { Button } from '../ui/Button';

export type UniversalConnectionMethod = 'oauth2' | 'api_key' | 'basic_auth' | 'webhook' | 'custom_http' | 'mcp';

export interface UniversalConnectionDraft {
  name: string;
  method: UniversalConnectionMethod;
  endpointUrl: string;
  accountId?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  scopes?: string;
  headers?: string;
  events?: string;
  notes?: string;
}

interface UniversalConnectorProps { open: boolean; onClose: () => void; onSubmit: (draft: UniversalConnectionDraft) => Promise<void> | void; }

const methods = [
  { id: 'oauth2', label: 'OAuth 2.0', icon: ShieldCheck },
  { id: 'api_key', label: 'API Key', icon: KeyRound },
  { id: 'basic_auth', label: 'Basic Auth', icon: KeyRound },
  { id: 'webhook', label: 'Webhook', icon: Webhook },
  { id: 'custom_http', label: 'Custom HTTP', icon: Braces },
  { id: 'mcp', label: 'MCP', icon: Server },
] as const;

const providers = [
  { name: 'WhatsApp Business', category: 'Communication', method: 'oauth2' as const, icon: MessageCircle, description: 'Customer conversations, inbound messages and outbound communication.' },
  { name: 'Facebook', category: 'Social', method: 'oauth2' as const, icon: Facebook, description: 'Pages, messages, publishing and business data.' },
  { name: 'Instagram', category: 'Social', method: 'oauth2' as const, icon: Instagram, description: 'Professional account, messages, publishing and insights.' },
  { name: 'Google', category: 'Google', method: 'oauth2' as const, icon: Chrome, description: 'Connect Google services and authorize the specific scopes you need.' },
  { name: 'Google Ads', category: 'Advertising', method: 'oauth2' as const, icon: Megaphone, description: 'Campaign, account, performance and advertising data.' },
  { name: 'Meta Ads', category: 'Advertising', method: 'oauth2' as const, icon: Megaphone, description: 'Ad accounts, campaigns, audiences and performance.' },
  { name: 'Stripe', category: 'Payments', method: 'api_key' as const, icon: CreditCard, description: 'Customers, invoices, payments and revenue events.' },
  { name: 'Google Calendar', category: 'Calendar', method: 'oauth2' as const, icon: CalendarDays, description: 'Appointments, availability and scheduling.' },
  { name: 'Shopify', category: 'Commerce', method: 'api_key' as const, icon: ShoppingBag, description: 'Orders, customers, products and commerce events.' },
  { name: 'Custom CRM / ERP', category: 'Business Systems', method: 'custom_http' as const, icon: Database, description: 'Connect internal or proprietary systems over HTTP.' },
  { name: 'Email / SMTP', category: 'Communication', method: 'basic_auth' as const, icon: Mail, description: 'Customer-owned email infrastructure and delivery systems.' },
  { name: 'External MCP Server', category: 'AI / Tools', method: 'mcp' as const, icon: Code2, description: 'Expose an external MCP server as a governed APEX connection.' },
];

const categories = ['All', ...Array.from(new Set(providers.map(p => p.category)))];

export const UniversalConnector: React.FC<UniversalConnectorProps> = ({ open, onClose, onSubmit }) => {
  const [method, setMethod] = useState<UniversalConnectionMethod>('oauth2');
  const [name, setName] = useState(''); const [endpointUrl, setEndpointUrl] = useState(''); const [accountId, setAccountId] = useState(''); const [apiKey, setApiKey] = useState(''); const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [scopes, setScopes] = useState(''); const [headers, setHeaders] = useState(''); const [events, setEvents] = useState(''); const [notes, setNotes] = useState(''); const [submitting, setSubmitting] = useState(false); const [search, setSearch] = useState(''); const [category, setCategory] = useState('All');

  const filteredProviders = useMemo(() => providers.filter(p => (category === 'All' || p.category === category) && `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(search.toLowerCase())), [category, search]);
  if (!open) return null;

  const selectProvider = (provider: typeof providers[number]) => { setName(provider.name); setMethod(provider.method); setEndpointUrl(''); setApiKey(''); setUsername(''); setPassword(''); setScopes(''); setHeaders(''); setEvents(''); };
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!name.trim() || (method !== 'webhook' && !endpointUrl.trim())) return; try { setSubmitting(true); await onSubmit({ name: name.trim(), method, endpointUrl: endpointUrl.trim(), accountId: accountId.trim() || undefined, apiKey: apiKey || undefined, username: username.trim() || undefined, password: password || undefined, scopes: scopes.trim() || undefined, headers: headers.trim() || undefined, events: events.trim() || undefined, notes: notes.trim() || undefined }); } finally { setSubmitting(false); } };

  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="universal-connector-title">
    <form onSubmit={submit} className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#0b0b11] border border-white/[0.12] shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 p-5 border-b border-white/[0.08] bg-[#0b0b11]/95 backdrop-blur-md"><div><div className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-amber-400" /><h2 id="universal-connector-title" className="text-base font-serif-display font-semibold text-white">Connect Anything</h2></div><p className="text-[11px] text-zinc-500 mt-1">Connect anything your business owns through OAuth, APIs, webhooks, custom HTTP or MCP.</p></div><button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05]" aria-label="Close"><X className="w-4 h-4" /></button></div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr]">
        <div className="p-5 border-b lg:border-b-0 lg:border-r border-white/[0.08] space-y-4"><div><p className="text-[11px] font-semibold text-zinc-300">Start with a service</p><p className="text-[10px] text-zinc-500 mt-1">These are shortcuts, not a closed catalog. Any compatible service can still be configured below.</p></div><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search WhatsApp, Google, CRM, webhook…" className="w-full bg-[#12121a] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50" /></div><div className="flex gap-1.5 overflow-x-auto pb-1">{categories.map(item => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] border ${category === item ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : 'border-white/[0.07] text-zinc-500 hover:text-zinc-300'}`}>{item}</button>)}</div><div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">{filteredProviders.map(provider => <button key={provider.name} type="button" onClick={() => selectProvider(provider)} className={`text-left p-3 rounded-xl border transition-all hover:border-amber-500/30 hover:bg-white/[0.025] ${name === provider.name ? 'border-amber-500/35 bg-amber-500/[0.06]' : 'border-white/[0.07] bg-[#0e0e15]'}`}><div className="flex items-start gap-2.5"><span className="p-1.5 rounded-lg bg-white/[0.04] text-amber-400"><provider.icon className="w-3.5 h-3.5" /></span><span className="min-w-0"><span className="block text-xs font-semibold text-zinc-200 truncate">{provider.name}</span><span className="block text-[9px] uppercase tracking-wider text-zinc-600 mt-0.5">{provider.category}</span><span className="block text-[10px] text-zinc-500 leading-relaxed mt-1">{provider.description}</span></span></div></button>)}</div></div>
        <div className="p-5 space-y-5"><div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15"><p className="text-[11px] font-semibold text-amber-300">Universal connector</p><p className="text-[10px] text-zinc-400 mt-1">No provider ceiling. If it exposes a supported protocol, APEX3X can represent the connection here. A dedicated native adapter can later add richer capabilities without changing the connection model.</p></div><AnimatedInput label="Connection name" placeholder="e.g. My WhatsApp Business, ERP, webhook" value={name} onChange={e => setName(e.target.value)} required /><div><p className="text-[11px] font-medium text-zinc-400 mb-2">Connection method</p><AnimatedTabs tabs={methods.map(m => ({ id: m.id, label: m.label, icon: <m.icon className="w-3 h-3" /> }))} activeTab={method} onChange={id => setMethod(id as UniversalConnectionMethod)} /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><AnimatedInput label={method === 'webhook' ? 'Webhook URL / receiver' : 'Endpoint / Base URL'} placeholder={method === 'webhook' ? 'Provider webhook URL or receiver endpoint' : 'https://...'} value={endpointUrl} onChange={e => setEndpointUrl(e.target.value)} required={method !== 'webhook'} /><AnimatedInput label="Account / Resource ID" placeholder="Page, business, store, project, tenant…" value={accountId} onChange={e => setAccountId(e.target.value)} /></div>{(method === 'api_key' || method === 'custom_http' || method === 'mcp') && <AnimatedInput label="Secret / API key" type="password" placeholder="Customer-owned secret" value={apiKey} onChange={e => setApiKey(e.target.value)} />}{method === 'basic_auth' && <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><AnimatedInput label="Username" value={username} onChange={e => setUsername(e.target.value)} /><AnimatedInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>}{(method === 'oauth2' || method === 'mcp') && <AnimatedInput label="Scopes / permissions" placeholder="openid, pages_read_engagement, ads_read…" value={scopes} onChange={e => setScopes(e.target.value)} />}{(method === 'custom_http' || method === 'webhook') && <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><AnimatedInput label="Headers" placeholder="Content-Type, X-Signature…" value={headers} onChange={e => setHeaders(e.target.value)} /><AnimatedInput label="Events / routes" placeholder="lead.created, message.received, payment.*" value={events} onChange={e => setEvents(e.target.value)} /></div>}<AnimatedInput label="Notes" placeholder="Optional setup context" value={notes} onChange={e => setNotes(e.target.value)} /><div className="p-3.5 rounded-xl bg-[#08080d] border border-white/[0.06] space-y-1.5"><div className="flex items-center gap-2 text-xs font-semibold text-zinc-300"><ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Customer-owned connection boundary</div><p className="text-[10px] leading-relaxed text-zinc-500">APEX3X will use this connection only within the authorized workspace scope. Secrets must be stored server-side by the connected SaaS platform and must never be returned to the browser.</p></div></div>
      </div>
      <div className="sticky bottom-0 flex justify-end gap-3 p-4 border-t border-white/[0.08] bg-[#09090e]"><Button type="button" variant="secondary" size="md" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" size="md" isLoading={submitting} disabled={!name.trim() || (method !== 'webhook' && !endpointUrl.trim())}>Prepare Connection</Button></div>
    </form>
  </div>;
};
