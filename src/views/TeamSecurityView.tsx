import React, { useState, useEffect } from 'react';
import { Shield, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { User, SecurityAuditRecord } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { Tabs } from '../components/ui/Tabs';

export const TeamSecurityView: React.FC = () => {
  const { addToast, triggerRefresh, refreshKey } = useApp();
  const [members, setMembers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'audit'>('members');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'operator' | 'viewer'>('operator');

  const fetchData = async () => {
    try { setLoading(true); const [membersRes, logsRes] = await Promise.all([api.getTeam(), api.getSecurityAudit()]); setMembers(membersRes); setAuditLogs(logsRes); }
    catch (err) { console.error('Failed fetching team/security data:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [refreshKey]);

  const handleInvite = async () => {
    if (!name || !email) return;
    try { await api.inviteTeamMember({ name, email, role }); addToast({ type: 'success', title: 'Team Invitation Dispatched', description: `Invitation sent to ${email}.` }); setIsInviteOpen(false); setName(''); setEmail(''); await fetchData(); triggerRefresh(); }
    catch (err) { addToast({ type: 'error', title: 'Invite failed', description: (err as Error).message }); }
  };

  return <div className="space-y-6 pb-12">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-lg font-serif-display font-bold text-zinc-100">Team & Security Audit</h2><Badge variant="gold" size="sm">Role-Based Access Control (RBAC)</Badge></div><p className="text-xs text-zinc-400 mt-1">Operator management, role scoping, and security audit records returned by the connected platform.</p></div><Button variant="primary" size="md" onClick={() => setIsInviteOpen(true)} leftIcon={<UserPlus className="w-4 h-4" />}>Invite Operator</Button></div>
    <Tabs tabs={[{ id: 'members', label: 'Team Members', count: members.length }, { id: 'audit', label: 'Security Audit Log', count: auditLogs.length }]} activeTab={activeTab} onChange={id => setActiveTab(id as any)} />
    {activeTab === 'members' && <div className="space-y-4">{loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div> : members.length === 0 ? <Card padding="lg"><p className="text-sm text-zinc-500">No team members returned by the connected platform.</p></Card> : <div className="space-y-3">{members.map(member => <Card key={member.id} variant="default" padding="md" className="hover:border-white/[0.14] transition-all"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div className="space-y-1"><div className="flex items-center gap-2.5"><h4 className="text-sm font-semibold text-zinc-100">{member.name}</h4><Badge variant={member.role === 'admin' ? 'gold' : member.role === 'manager' ? 'amber' : 'slate'} size="sm">{member.role.toUpperCase()}</Badge></div><div className="text-xs text-zinc-400 font-mono">{member.email}</div></div></div></Card>)}</div>}</div>}
    {activeTab === 'audit' && <Card variant="default" padding="none" className="overflow-hidden"><div className="p-4 border-b border-white/[0.08] bg-[#09090d]"><h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Tenant Security Audit Trail</h3></div><div className="divide-y divide-white/[0.06]">{loading ? <div className="p-6"><Skeleton className="h-20" /></div> : auditLogs.length === 0 ? <div className="p-6 text-sm text-zinc-500">No security audit records returned by the connected platform.</div> : auditLogs.map(log => <div key={log.id} className="p-4 flex items-center justify-between"><div className="space-y-1"><div className="flex items-center gap-2"><Badge variant="slate" size="sm">{log.action}</Badge><span className="text-xs font-medium text-zinc-200">{log.userName}</span></div><p className="text-xs text-zinc-400">Category: {log.category}</p></div><div className="text-right text-[11px] font-mono text-zinc-500"><div>{new Date(log.timestamp).toLocaleString()}</div><span className="text-zinc-600">IP: {log.ipAddress}</span></div></div>)}</div></Card>}
    <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Operator to Workspace" subtitle="Assign role-based permissions and grant secured dashboard access."><div className="space-y-4"><Input label="Full Name" placeholder="Contact name" value={name} onChange={e => setName(e.target.value)} required /><Input label="Corporate Email" type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required /><Select label="Role & Access Scope" value={role} onChange={e => setRole(e.target.value as any)} options={[{ value: 'admin', label: 'Admin (Full system and integration control)' }, { value: 'manager', label: 'Manager (CRM, Bookings, Operations)' }, { value: 'operator', label: 'Operator (Standard business execution)' }, { value: 'viewer', label: 'Viewer (Read-only analytics and audit logs)' }]} /><div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]"><Button variant="secondary" size="md" onClick={() => setIsInviteOpen(false)}>Cancel</Button><Button variant="primary" size="md" onClick={handleInvite}>Send Operator Invite</Button></div></div></Modal>
  </div>;
};
