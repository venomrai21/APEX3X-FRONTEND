import React, { useState, useEffect } from 'react';
import { FileText, Plus, Check, Code } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { WebsiteForm } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const FormsView: React.FC = () => {
  const { addToast, triggerRefresh, refreshKey } = useApp();
  const [forms, setForms] = useState<WebsiteForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchForms = async () => { try { setLoading(true); setForms(await api.getForms()); } catch (err) { console.error('Failed fetching forms:', err); } finally { setLoading(false); } };
  useEffect(() => { fetchForms(); }, [refreshKey]);

  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    try { await api.createForm({ title: formTitle.trim(), submitButtonText: buttonText.trim(), successMessage: successMsg.trim() }); addToast({ type: 'success', title: 'Form Created', description: `"${formTitle.trim()}" is ready for configuration.` }); setIsCreateOpen(false); setFormTitle(''); setButtonText(''); setSuccessMsg(''); await fetchForms(); triggerRefresh(); }
    catch (err) { addToast({ type: 'error', title: 'Creation failed', description: (err as Error).message }); }
  };

  const copyEmbed = async (form: WebsiteForm) => {
    try {
      const embedCode = await api.getFormEmbedCode(form.id);
      await navigator.clipboard.writeText(embedCode);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 3000);
      addToast({ type: 'info', title: 'Embed Code Copied', description: 'Paste the platform-provided snippet into the website where this form should appear.' });
    } catch (err) {
      addToast({ type: 'error', title: 'Embed Code Unavailable', description: (err as Error).message });
    }
  };

  return <div className="space-y-6 pb-12">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-lg font-serif-display font-bold text-zinc-100">Forms & Inbound Lead Capture</h2><Badge variant="gold" size="sm">{forms.length} Forms</Badge></div><p className="text-xs text-zinc-400 mt-1">Manage embeddable intake forms and their connected lead-capture configuration.</p></div><Button variant="primary" size="md" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>Create Intake Form</Button></div>
    {loading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2].map(i => <Skeleton key={i} className="h-48" />)}</div> : forms.length === 0 ? <EmptyState icon={<FileText className="w-6 h-6" />} title="No Forms Created" description="Build an intake form to capture inbound leads on your website." actionLabel="Create Intake Form" onAction={() => setIsCreateOpen(true)} /> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{forms.map(form => <Card key={form.id} variant="default" padding="lg" className="space-y-4 hover:border-white/[0.14] transition-all"><div className="flex items-start justify-between"><div><h3 className="text-sm font-semibold text-zinc-100">{form.title}</h3><span className="text-[11px] font-mono text-zinc-500">Slug: /{form.slug}</span></div><Badge variant={form.isActive ? 'emerald' : 'slate'} size="sm">{form.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge></div><div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#07070b] border border-white/[0.05]"><div><span className="text-[10px] text-zinc-500 uppercase tracking-wider">Submissions</span><div className="text-base font-mono font-bold text-zinc-200 mt-0.5">{form.submissionsCount}</div></div><div><span className="text-[10px] text-zinc-500 uppercase tracking-wider">Conversion Rate</span><div className="text-base font-mono font-bold text-amber-300 mt-0.5">{form.conversionRate}%</div></div></div><div className="space-y-1"><span className="text-[11px] font-medium text-zinc-400">Captured Fields:</span><div className="flex flex-wrap gap-1.5 pt-0.5">{form.fields.map(f => <span key={f.id} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.06]">{f.label}{f.required ? ' *' : ''}</span>)}</div></div><div className="flex items-center justify-between pt-2 border-t border-white/[0.06]"><Button variant="outline" size="sm" onClick={() => copyEmbed(form)} leftIcon={copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}>{copiedSnippet ? 'Copied HTML' : 'Copy Embed Snippet'}</Button></div></Card>)}</div>}
    {isCreateOpen && <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Intake Form" subtitle="Configure an intake form for the connected lead-capture platform."><div className="space-y-4"><Input label="Form Name" placeholder="Form name" value={formTitle} onChange={e => setFormTitle(e.target.value)} required /><Input label="Submit Button Label" placeholder="Submit" value={buttonText} onChange={e => setButtonText(e.target.value)} /><Input label="Success Notice Text" placeholder="Submission received." value={successMsg} onChange={e => setSuccessMsg(e.target.value)} /><div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]"><Button variant="secondary" size="md" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button variant="primary" size="md" onClick={handleCreate} disabled={!formTitle.trim()}>Create Form</Button></div></div></Modal>}
  </div>;
};
