import React, { useState, useEffect } from 'react';
import { Building, Search, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Customer } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { AnimatedNumber, AnimatedProgress, AnimatedGrid, ExpandableCard } from '../components/apex3x/adapters';

export const CustomersView: React.FC = () => {
  const { setActiveNav, refreshKey } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const fetchCustomers = async () => { try { setLoading(true); setCustomers(await api.getCustomers()); } catch (err) { console.error('Failed fetching customers:', err); } finally { setLoading(false); } };
  useEffect(() => { fetchCustomers(); }, [refreshKey]);
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
  const totalLtv = customers.reduce((acc, c) => acc + c.lifetimeValue, 0);
  const customersWithHealth = customers.filter(c => Number.isFinite(c.healthScore));
  const averageHealth = customersWithHealth.length ? Math.round(customersWithHealth.reduce((acc, c) => acc + c.healthScore, 0) / customersWithHealth.length) : null;
  const activeCustomers = customers.filter(c => c.status === 'active').length;

  return <div className="space-y-6 pb-12">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-lg font-serif-display font-bold text-zinc-100">Customer Directory</h2><Badge variant="gold" size="sm">{customers.length} Accounts</Badge></div><p className="text-xs text-zinc-400 mt-1">Account lifetime values, operational health scores, and engagement retention.</p></div><Button variant="secondary" size="md" onClick={() => setActiveNav('invoices')} leftIcon={<ArrowUpRight className="w-4 h-4" />}>Commercial Billing Ledger</Button></div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><Card variant="default" padding="sm"><span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Customer LTV</span><AnimatedNumber value={totalLtv} prefix="$" className="block text-xl font-serif-display font-bold text-amber-300 mt-1" /></Card><Card variant="default" padding="sm"><span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Average Account Health</span><AnimatedNumber value={averageHealth ?? 0} suffix={averageHealth === null ? '' : '%'} className={`block text-xl font-serif-display font-bold mt-1 ${averageHealth === null ? 'text-zinc-500' : 'text-emerald-400'}`} /></Card><Card variant="default" padding="sm"><span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active Accounts</span><AnimatedNumber value={activeCustomers} className="block text-xl font-serif-display font-bold text-zinc-100 mt-1" /></Card></div>
    <div className="p-3 bg-[#0a0a0f] border border-white/[0.08] rounded-xl flex items-center max-w-md"><Search className="w-4 h-4 text-zinc-500 mr-2.5 shrink-0" /><input type="text" placeholder="Filter customers by name, company, or email..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none" /></div>
    {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div> : filtered.length === 0 ? <EmptyState icon={<Building className="w-6 h-6" />} title="No Accounts Found" description={search ? 'No customer accounts match your search filter.' : 'No customer accounts are available for this workspace.'} /> : <AnimatedGrid className="!grid-cols-1" itemClassName="w-full">{filtered.map(cust => <ExpandableCard key={cust.id} title={cust.company} summary={`${cust.name} · ${cust.tier.toUpperCase()} tier · ${cust.status.replace('_', ' ')}`}><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5"><div className="space-y-2 min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="text-xs text-zinc-400">Primary contact: {cust.name}</span><Badge variant={cust.tier === 'enterprise' ? 'gold' : 'slate'} size="sm">{cust.tier.toUpperCase()} TIER</Badge><Badge variant={cust.status === 'active' ? 'emerald' : cust.status === 'at_risk' ? 'amber' : 'rose'} size="sm">{cust.status.replace('_', ' ')}</Badge></div><div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap"><span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-zinc-500" /> {cust.email}</span><span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-zinc-500" /> {cust.phone}</span><span className="text-[11px] text-zinc-500">Joined {new Date(cust.joinedAt).toLocaleDateString()}</span></div><AnimatedProgress value={cust.healthScore} label="Account health" /></div><div className="flex items-center gap-6 shrink-0"><div className="text-right"><span className="text-xs text-zinc-500">Lifetime Value</span><AnimatedNumber value={cust.lifetimeValue} prefix="$" className="block text-base font-mono font-bold text-amber-300" /></div><Button variant="secondary" size="sm" onClick={() => setActiveNav('conversations')}>Message</Button></div></div></ExpandableCard>)}</AnimatedGrid>}
  </div>;
};
