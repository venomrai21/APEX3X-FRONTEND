import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, CreditCard, FileText, LayoutTemplate, Package, Plus, RefreshCw, Send, Settings2, Upload, Wallet } from 'lucide-react';
import { formatMoney } from '../currency';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Invoice, InvoiceConfiguration, InvoiceDesign, InvoiceProductService, RecurringInvoiceSchedule } from '../types';
import { APEXReveal, AnimatedGrid, AnimatedNumber, Badge, Button, Card, EmptyState, ExpandableCard, Input, Modal, Skeleton } from '../components/apex3x';

type Mode = 'invoices' | 'designs' | 'products' | 'recurring' | 'configuration';
type CreatePath = 'create' | 'design' | 'import-invoice' | 'import-template' | null;
const today = () => new Date().toISOString().slice(0, 10);

export const InvoicesView: React.FC = () => {
  const { addToast, triggerRefresh, refreshKey, currentWorkspace } = useApp();
  const displayCurrency = currentWorkspace?.currency || 'USD';
  const [mode, setMode] = useState<Mode>('invoices');
  const [path, setPath] = useState<CreatePath>(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [designs, setDesigns] = useState<InvoiceDesign[]>([]);
  const [products, setProducts] = useState<InvoiceProductService[]>([]);
  const [recurring, setRecurring] = useState<RecurringInvoiceSchedule[]>([]);
  const [configuration, setConfiguration] = useState<InvoiceConfiguration | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [productId, setProductId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [designName, setDesignName] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productKind, setProductKind] = useState<'product' | 'service'>('service');
  const [recurringName, setRecurringName] = useState('');
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  const [recurringStart, setRecurringStart] = useState(today());
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [collectionInvoice, setCollectionInvoice] = useState<Invoice | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [ir, dr, pr, rr, cr] = await Promise.all([api.getInvoices(), api.getInvoiceDesigns(), api.getInvoiceProducts(), api.getRecurringInvoices(), api.getInvoiceConfiguration()]);
      setInvoices(ir); setDesigns(dr.designs); setProducts(pr.products); setRecurring(rr.schedules); setConfiguration(cr.configuration);
    } catch (err) {
      addToast({ type: 'error', title: 'Invoice workspace unavailable', description: (err as Error).message });
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [refreshKey]);

  const openBalance = useMemo(() => invoices.filter(i => !['paid', 'cancelled'].includes(i.status)).reduce((n, i) => n + Number(i.grandTotal ?? i.amount ?? 0), 0), [invoices]);
  const overdue = useMemo(() => invoices.filter(i => ['overdue', 'in_collection'].includes(i.status)).reduce((n, i) => n + Number(i.grandTotal ?? i.amount ?? 0), 0), [invoices]);
  const collected = useMemo(() => invoices.filter(i => i.status === 'paid').reduce((n, i) => n + Number(i.grandTotal ?? i.amount ?? 0), 0), [invoices]);

  const reset = () => { setPath(null); setCustomerName(''); setCustomerEmail(''); setInvoiceAmount(''); setInvoiceDescription(''); setInvoiceDueDate(''); setProductId(''); setFile(null); setDesignName(''); };
  const createInvoice = async () => {
    const amount = Number(invoiceAmount);
    if (!customerName.trim() || !customerEmail.trim() || !Number.isFinite(amount) || amount <= 0) {
      addToast({ type: 'error', title: 'Invoice details incomplete', description: 'Customer, email and a positive amount are required.' }); return;
    }
    try {
      await api.createInvoice({ customerName: customerName.trim(), customerEmail: customerEmail.trim(), amount, currency: configuration?.currency || displayCurrency, issueDate: today(), dueDate: invoiceDueDate || today(), description: invoiceDescription.trim(), items: [{ description: invoiceDescription.trim() || 'Professional services', quantity: 1, unitPrice: amount }], subtotal: amount, grandTotal: amount, status: 'draft', templateId: productId || undefined });
      addToast({ type: 'success', title: 'Invoice created', description: 'The invoice is stored in the workspace ledger.' }); reset(); await load(); triggerRefresh();
    } catch (err) { addToast({ type: 'error', title: 'Invoice creation failed', description: (err as Error).message }); }
  };
  const registerImport = async (kind: 'invoice' | 'template') => {
    if (!file) return;
    try {
      await api.registerInvoiceImport({ importType: kind, fileName: file.name, mimeType: file.type || 'application/octet-stream', sourceMetadata: { size: file.size, lastModified: file.lastModified }, extractedData: {}, fieldMapping: {} });
      addToast({ type: 'success', title: 'Import registered', description: 'The source is queued for controlled review; it is not trusted as financial truth.' }); reset(); await load();
    } catch (err) { addToast({ type: 'error', title: 'Import failed', description: (err as Error).message }); }
  };
  const createDesign = async () => {
    if (!designName.trim()) return;
    try { await api.createInvoiceDesign({ name: designName.trim(), sourceType: 'native', designDefinition: { version: 1, layout: 'standard' } }); addToast({ type: 'success', title: 'Design created', description: 'The design is now versioned independently from invoice data.' }); reset(); await load(); }
    catch (err) { addToast({ type: 'error', title: 'Design failed', description: (err as Error).message }); }
  };
  const createProduct = async () => {
    const price = Number(productPrice);
    if (!productName.trim() || !Number.isFinite(price) || price < 0) return;
    try { await api.createInvoiceProduct({ name: productName.trim(), kind: productKind, defaultPrice: price, currency: configuration?.currency || displayCurrency }); setProductName(''); setProductPrice(''); addToast({ type: 'success', title: 'Catalog item created', description: 'Reusable product/service default saved.' }); await load(); }
    catch (err) { addToast({ type: 'error', title: 'Catalog item failed', description: (err as Error).message }); }
  };
  const createRecurring = async () => {
    if (!recurringName.trim() || !customerName.trim()) { addToast({ type: 'error', title: 'Schedule details incomplete', description: 'Schedule name and customer are required.' }); return; }
    try { await api.createRecurringInvoice({ name: recurringName.trim(), customerName: customerName.trim(), customerEmail, frequency: recurringFrequency, startDate: recurringStart, scheduleType: 'review' }); setRecurringName(''); setCustomerName(''); setCustomerEmail(''); addToast({ type: 'success', title: 'Recurring schedule created', description: 'The schedule is review-first and will not silently issue invoices.' }); await load(); }
    catch (err) { addToast({ type: 'error', title: 'Recurring schedule failed', description: (err as Error).message }); }
  };
  const recordPayment = async () => {
    if (!paymentInvoice) return;
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    try { await api.recordInvoicePayment(paymentInvoice.id, { amount, method: 'manual' }); setPaymentInvoice(null); setPaymentAmount(''); addToast({ type: 'success', title: 'Payment recorded', description: 'Payment was allocated and the invoice lifecycle updated.' }); await load(); triggerRefresh(); }
    catch (err) { addToast({ type: 'error', title: 'Payment failed', description: (err as Error).message }); }
  };
  const reminder = async (id: string) => {
    try { setActionId(id); const r = await api.sendInvoiceReminder(id); addToast({ type: 'success', title: 'Reminder dispatched', description: r.message }); await load(); }
    catch (err) { addToast({ type: 'error', title: 'Reminder failed', description: (err as Error).message }); }
    finally { setActionId(null); }
  };
  const openCollection = async () => {
    if (!collectionInvoice) return;
    try { await api.updateInvoiceCollection(collectionInvoice.id, { status: 'active', priority: 'normal' }); setCollectionInvoice(null); addToast({ type: 'success', title: 'Collection case opened', description: 'Collection tracking is separate from payment state.' }); await load(); }
    catch (err) { addToast({ type: 'error', title: 'Collection case failed', description: (err as Error).message }); }
  };

  const paths = [
    ['create', Plus, 'Create Invoice', 'Start from structured invoice data.'],
    ['design', LayoutTemplate, 'Use Existing Design', 'Reuse a saved visual design.'],
    ['import-invoice', Upload, 'Import Existing Invoice', 'Bring an existing invoice into APEX for controlled review.'],
    ['import-template', FileText, 'Import Invoice Template', 'Register a reusable source template for mapping.']
  ] as const;

  return <div className="space-y-6 pb-12">
    <APEXReveal><div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-lg font-bold text-zinc-100">Invoices, Payments & Collections</h2><Badge variant="neutral" size="sm">Financial Workspace</Badge></div><p className="text-xs text-zinc-400 mt-1">Structured invoice data is authoritative; design, import, payment and collection layers remain separate.</p></div><Button variant="primary" size="md" onClick={() => setPath('create')} leftIcon={<Plus className="w-4 h-4" />}>Create Invoice</Button></div></APEXReveal>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">{paths.map(([key, Icon, title, text]) => <button key={key} onClick={() => setPath(key)} className="text-left rounded-xl border border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.05] p-4 transition-colors"><div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm"><Icon className="w-4 h-4" />{title}</div><p className="text-xs text-zinc-500 mt-2">{text}</p></button>)}</div>
    <div className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-2">{([['invoices','Invoices'],['designs','Designs'],['products','Products & Services'],['recurring','Recurring'],['configuration','Configuration']] as [Mode,string][]).map(([k,l]) => <Button key={k} variant={mode === k ? 'primary' : 'secondary'} size="sm" onClick={() => setMode(k)}>{l}</Button>)}</div>

    {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div> : mode === 'invoices' ? <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><Card padding="sm"><span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Open Receivables</span><AnimatedNumber value={openBalance} currency={displayCurrency} className="block text-xl font-bold text-zinc-100 mt-1" /></Card><Card padding="sm"><span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Overdue</span><AnimatedNumber value={overdue} currency={displayCurrency} className="block text-xl font-bold text-zinc-100 mt-1" /></Card><Card padding="sm"><span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Collected</span><AnimatedNumber value={collected} currency={displayCurrency} className="block text-xl font-bold text-zinc-100 mt-1" /></Card></div>
      {invoices.length === 0 ? <EmptyState icon={<CreditCard className="w-6 h-6" />} title="No invoices yet" description="Create your first invoice or import an existing document." actionLabel="Create Invoice" onAction={() => setPath('create')} /> : <AnimatedGrid className="!grid-cols-1" itemClassName="w-full">{invoices.map(inv => { const amount=Number(inv.grandTotal ?? inv.amount ?? 0); const overdueStatus=['overdue','in_collection'].includes(inv.status); return <ExpandableCard key={inv.id} title={inv.invoiceNumber + ' · ' + inv.customerName} summary={inv.status.replace('_',' ').toUpperCase() + ' · ' + formatMoney(amount,inv.currency || displayCurrency)}><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div><div className="flex items-center gap-2"><Badge variant={inv.status === 'paid' ? 'success' : overdueStatus ? 'warning' : 'neutral'} size="sm">{inv.status.replace('_',' ').toUpperCase()}</Badge><span className="text-xs text-zinc-400">{inv.customerEmail}</span></div><div className="flex gap-4 text-xs text-zinc-500 mt-2 flex-wrap"><span>Issued {inv.issueDate}</span><span>Due {inv.dueDate}</span>{inv.paymentStatus && <span>Payment {inv.paymentStatus}</span>}{inv.collectionStatus && inv.collectionStatus !== 'none' && <span>Collection {inv.collectionStatus}</span>}</div></div><div className="flex items-center gap-2"><span className="font-mono font-bold text-zinc-100 mr-2">{formatMoney(amount,inv.currency || displayCurrency)}</span>{!['paid','cancelled'].includes(inv.status) && <><Button variant="secondary" size="sm" isLoading={actionId === inv.id} onClick={() => reminder(inv.id)} leftIcon={<Send className="w-3 h-3" />}>Remind</Button><Button variant="secondary" size="sm" onClick={() => setCollectionInvoice(inv)} leftIcon={<AlertTriangle className="w-3 h-3" />}>Collect</Button><Button variant="primary" size="sm" onClick={() => setPaymentInvoice(inv)} leftIcon={<Wallet className="w-3 h-3" />}>Record Payment</Button></>}{inv.status === 'paid' && <span className="text-xs text-zinc-300 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Settled</span>}</div></div></ExpandableCard>; })}</AnimatedGrid>}
    </> : mode === 'designs' ? <Card padding="md"><div className="flex justify-between items-center mb-4"><div><h3 className="text-sm font-semibold text-zinc-100">Invoice Designs</h3><p className="text-xs text-zinc-500 mt-1">Visual design is independent of financial configuration.</p></div><Button size="sm" variant="primary" onClick={() => setPath('design')} leftIcon={<Plus className="w-3 h-3" />}>New Design</Button></div>{designs.length ? <div className="space-y-2">{designs.map(d => <div key={d.id} className="flex justify-between items-center border border-white/[0.07] rounded-lg p-3"><div><p className="text-sm text-zinc-200">{d.name}</p><p className="text-[11px] text-zinc-500">{d.sourceType} · {d.status}</p></div><Badge variant="neutral" size="sm">Versioned</Badge></div>)}</div> : <EmptyState icon={<LayoutTemplate className="w-5 h-5" />} title="No designs saved" description="Create a reusable design." />}</Card>
    : mode === 'products' ? <Card padding="md"><div className="flex justify-between items-center mb-4"><div><h3 className="text-sm font-semibold text-zinc-100">Products & Services</h3><p className="text-xs text-zinc-500 mt-1">Reusable defaults populate invoices but do not override invoice-level decisions.</p></div><Button size="sm" variant="primary" onClick={() => setPath('create')} leftIcon={<Plus className="w-3 h-3" />}>Add Item</Button></div>{products.length ? <div className="space-y-2">{products.map(p => <div key={p.id} className="flex justify-between items-center border border-white/[0.07] rounded-lg p-3"><div><p className="text-sm text-zinc-200">{p.name}</p><p className="text-[11px] text-zinc-500">{p.kind} · {p.unit}{p.sku ? ' · ' + p.sku : ''}</p></div><span className="font-mono text-sm text-zinc-200">{formatMoney(Number(p.defaultPrice),p.currency)}</span></div>)}</div> : <EmptyState icon={<Package className="w-5 h-5" />} title="Catalog is empty" description="Add reusable products or services." />}<div className="border-t border-white/[0.08] mt-5 pt-5 grid grid-cols-1 md:grid-cols-3 gap-3"><Input label="Name" value={productName} onChange={e => setProductName(e.target.value)} /><Input label="Default Price" type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)} /><div><label className="text-xs text-zinc-400">Type</label><select className="mt-1 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-zinc-200" value={productKind} onChange={e => setProductKind(e.target.value as 'product'|'service')}><option value="service">Service</option><option value="product">Product</option></select></div><div><Button size="sm" variant="primary" onClick={createProduct}>Save Catalog Item</Button></div></div></Card>
    : mode === 'recurring' ? <Card padding="md"><div className="flex justify-between items-center mb-4"><div><h3 className="text-sm font-semibold text-zinc-100">Recurring Invoices</h3><p className="text-xs text-zinc-500 mt-1">Review-first schedules prevent silent issuance of financial documents.</p></div></div>{recurring.length ? <div className="space-y-2">{recurring.map(r => <div key={r.id} className="flex justify-between items-center border border-white/[0.07] rounded-lg p-3"><div><p className="text-sm text-zinc-200">{r.name}</p><p className="text-[11px] text-zinc-500">{r.customerName} · {r.frequency} · {r.scheduleType}</p></div><Badge variant={r.status === 'active' ? 'success' : 'neutral'} size="sm">{r.status}</Badge></div>)}</div> : <EmptyState icon={<RefreshCw className="w-5 h-5" />} title="No recurring schedules" description="Create one from the invoice workflow." />}<div className="border-t border-white/[0.08] mt-5 pt-5 grid grid-cols-1 md:grid-cols-4 gap-3"><Input label="Schedule Name" value={recurringName} onChange={e => setRecurringName(e.target.value)} /><Input label="Customer" value={customerName} onChange={e => setCustomerName(e.target.value)} /><Input label="Customer Email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} /><div><label className="text-xs text-zinc-400">Frequency</label><select className="mt-1 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-zinc-200" value={recurringFrequency} onChange={e => setRecurringFrequency(e.target.value)}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></div><Button size="sm" variant="primary" onClick={createRecurring}>Save Schedule</Button></div></Card>
    : <Card padding="md"><div className="flex items-center gap-2 mb-4"><Settings2 className="w-4 h-4" /><div><h3 className="text-sm font-semibold text-zinc-100">Invoice Configuration</h3><p className="text-xs text-zinc-500 mt-1">Invoice-domain defaults are separate from the global Business Profile.</p></div></div>{configuration && <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input label="Invoice Prefix" value={configuration.invoicePrefix} onChange={() => {}} disabled /><Input label="Currency" value={configuration.currency} onChange={() => {}} disabled /><Input label="Payment Terms (days)" value={String(configuration.defaultPaymentTermsDays)} onChange={() => {}} disabled /><Input label="Rounding Precision" value={String(configuration.roundingPrecision)} onChange={() => {}} disabled /></div>}<p className="text-[11px] text-zinc-500 mt-4">Global business currency remains controlled by Business Profile. This configuration is the invoice-domain layer.</p></Card>}

    <Modal isOpen={path === 'create'} onClose={reset} title="Create Invoice" subtitle="Build from structured invoice data."><div className="space-y-4"><Input label="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} required /><Input label="Customer Email" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} required /><div className="grid grid-cols-2 gap-3"><Input label="Amount" type="number" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} required /><Input label="Due Date" type="date" value={invoiceDueDate} onChange={e => setInvoiceDueDate(e.target.value)} /></div><Input label="Line Item Description" value={invoiceDescription} onChange={e => setInvoiceDescription(e.target.value)} /><div><label className="text-xs text-zinc-400">Reusable Product / Service</label><select className="mt-1 w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-3 py-2 text-sm text-zinc-200" value={productId} onChange={e => setProductId(e.target.value)}><option value="">None</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} · {formatMoney(Number(p.defaultPrice),p.currency)}</option>)}</select></div><div className="flex justify-end gap-2"><Button variant="secondary" onClick={reset}>Cancel</Button><Button variant="primary" onClick={createInvoice}>Create Invoice</Button></div></div></Modal>
    <Modal isOpen={path === 'design'} onClose={reset} title="Use Existing Design" subtitle="Save a reusable invoice design definition."><div className="space-y-4"><Input label="Design Name" placeholder="My branded invoice" value={designName} onChange={e => setDesignName(e.target.value)} /><div className="rounded-lg border border-white/[0.08] p-3 text-xs text-zinc-500">Financial data and visual design are stored separately. Finalized invoices can reference a specific design version.</div><div className="flex justify-end gap-2"><Button variant="secondary" onClick={reset}>Cancel</Button><Button variant="primary" onClick={createDesign}>Create Design</Button></div></div></Modal>
    <Modal isOpen={path === 'import-invoice' || path === 'import-template'} onClose={reset} title={path === 'import-invoice' ? 'Import Existing Invoice' : 'Import Invoice Template'} subtitle="Register the source document for controlled extraction and validation."><div className="space-y-4"><div className="rounded-xl border border-dashed border-white/[0.14] p-6 text-center"><Upload className="w-6 h-6 mx-auto text-zinc-400" /><p className="text-sm text-zinc-200 mt-2">Choose PDF, image, DOCX or JSON</p><p className="text-[11px] text-zinc-500 mt-1">Imported content is not trusted financial truth until validated.</p><input className="mt-4 block w-full text-xs text-zinc-400" type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.json" onChange={e => setFile(e.target.files?.[0] || null)} /></div>{file && <p className="text-xs text-zinc-400">Selected: <span className="text-zinc-200">{file.name}</span> · {Math.round(file.size / 1024)} KB</p>}<div className="flex justify-end gap-2"><Button variant="secondary" onClick={reset}>Cancel</Button><Button variant="primary" disabled={!file} onClick={() => registerImport(path === 'import-invoice' ? 'invoice' : 'template')}>Register Import</Button></div></div></Modal>
    <Modal isOpen={!!paymentInvoice} onClose={() => setPaymentInvoice(null)} title="Record Payment" subtitle={paymentInvoice ? paymentInvoice.invoiceNumber + ' · ' + paymentInvoice.customerName : ''}><div className="space-y-4"><Input label="Payment Amount" type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} /><p className="text-[11px] text-zinc-500">APEX prevents allocation above the remaining invoice balance.</p><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setPaymentInvoice(null)}>Cancel</Button><Button variant="primary" onClick={recordPayment}>Record Payment</Button></div></div></Modal>
    <Modal isOpen={!!collectionInvoice} onClose={() => setCollectionInvoice(null)} title="Open Collection Case" subtitle={collectionInvoice ? collectionInvoice.invoiceNumber + ' · ' + collectionInvoice.customerName : ''}><div className="space-y-4"><div className="rounded-lg border border-white/[0.08] p-3 text-xs text-zinc-400">Collection status is independent from payment status.</div><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setCollectionInvoice(null)}>Cancel</Button><Button variant="primary" onClick={openCollection}>Open Collection Case</Button></div></div></Modal>
  </div>;
};
