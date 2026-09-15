import React, { useState } from 'react';
import { Globe2, KeyRound, Webhook, Braces, Server, ShieldCheck, X } from 'lucide-react';
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

interface UniversalConnectorProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: UniversalConnectionDraft) => Promise<void> | void;
}

const methods = [
  { id: 'oauth2', label: 'OAuth 2.0', icon: ShieldCheck },
  { id: 'api_key', label: 'API Key', icon: KeyRound },
  { id: 'basic_auth', label: 'Basic Auth', icon: KeyRound },
  { id: 'webhook', label: 'Webhook', icon: Webhook },
  { id: 'custom_http', label: 'Custom HTTP', icon: Braces },
  { id: 'mcp', label: 'MCP', icon: Server },
] as const;

export const UniversalConnector: React.FC<UniversalConnectorProps> = ({ open, onClose, onSubmit }) => {
  const [method, setMethod] = useState<UniversalConnectionMethod>('oauth2');
  const [name, setName] = useState('');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [accountId, setAccountId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [scopes, setScopes] = useState('');
  const [headers, setHeaders] = useState('');
  const [events, setEvents] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !endpointUrl.trim()) return;
    try {
      setSubmitting(true);
      await onSubmit({ name: name.trim(), method, endpointUrl: endpointUrl.trim(), accountId: accountId.trim() || undefined, apiKey: apiKey || undefined, username: username.trim() || undefined, password: password || undefined, scopes: scopes.trim() || undefined, headers: headers.trim() || undefined, events: events.trim() || undefined, notes: notes.trim() || undefined });
    } finally { setSubmitting(false); }
  };

  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="universal-connector-title">
    <form onSubmit={submit} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0b0b11] border border-white/[0.12] shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 p-5 border-b border-white/[0.08] bg-[#0b0b11]/95 backdrop-blur-md">
        <div><div className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-amber-400" /><h2 id="universal-connector-title" className="text-base font-serif-display font-semibold text-white">Connect Anything</h2></div><p className="text-[11px] text-zinc-500 mt-1">Connect a customer-owned service through its supported authorization or protocol boundary.</p></div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05]" aria-label="Close"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-5 space-y-5">
        <AnimatedInput label="Connection name" placeholder="e.g. WhatsApp Business, HubSpot, Shopify, custom ERP" value={name} onChange={e => setName(e.target.value)} required />
        <div><p className="text-[11px] font-medium text-zinc-400 mb-2">Connection method</p><AnimatedTabs tabs={methods.map(m => ({ id: m.id, label: m.label, icon: <m.icon className="w-3 h-3" /> }))} activeTab={method} onChange={id => setMethod(id as UniversalConnectionMethod)} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><AnimatedInput label={method === 'webhook' ? 'Webhook URL' : 'Endpoint / Base URL'} placeholder="https://..." value={endpointUrl} onChange={e => setEndpointUrl(e.target.value)} required /><AnimatedInput label="Account / Resource ID" placeholder="Optional provider account, page, store, project, etc." value={accountId} onChange={e => setAccountId(e.target.value)} /></div>
        {(method === 'api_key' || method === 'custom_http' || method === 'mcp') && <AnimatedInput label="Secret / API key" type="password" placeholder="Stored by the connected platform; never displayed back" value={apiKey} onChange={e => setApiKey(e.target.value)} />}
        {method === 'basic_auth' && <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><AnimatedInput label="Username" value={username} onChange={e => setUsername(e.target.value)} /><AnimatedInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>}
        {(method === 'oauth2' || method === 'mcp') && <AnimatedInput label="Scopes / permissions" placeholder="Comma-separated permissions requested from the provider" value={scopes} onChange={e => setScopes(e.target.value)} />}
        {(method === 'custom_http' || method === 'webhook') && <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><AnimatedInput label="Headers" placeholder="Authorization, X-Signature, Content-Type…" value={headers} onChange={e => setHeaders(e.target.value)} /><AnimatedInput label="Events / routes" placeholder="lead.created, message.received, payment.*" value={events} onChange={e => setEvents(e.target.value)} /></div>}
        <div className="p-4 rounded-xl bg-[#08080d] border border-amber-500/15 space-y-2"><div className="flex items-center gap-2 text-xs font-semibold text-amber-300"><ShieldCheck className="w-3.5 h-3.5" /> Universal connection boundary</div><p className="text-[11px] leading-relaxed text-zinc-400">This surface is deliberately not a fixed vendor list. Named providers can use native adapters; compatible services can use generic protocols; non-compatible services can be added later through a dedicated adapter without changing the customer workspace connection model.</p><p className="text-[10px] text-zinc-600">Secrets are never rendered after submission.</p></div>
        <AnimatedInput label="Notes" placeholder="Optional setup context for this connection" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <div className="sticky bottom-0 flex justify-end gap-3 p-4 border-t border-white/[0.08] bg-[#09090e]"><Button type="button" variant="secondary" size="md" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" size="md" isLoading={submitting} disabled={!name.trim() || !endpointUrl.trim()}>Prepare Connection</Button></div>
    </form>
  </div>;
};
