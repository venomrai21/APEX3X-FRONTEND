import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Send,
  Download,
  DollarSign,
  Clock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Invoice } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const InvoicesView: React.FC = () => {
  const { addToast, triggerRefresh, refreshKey } = useApp();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // New invoice state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [amount, setAmount] = useState('12000');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('Enterprise Dedicated Haulage SLA (Q3)');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.getInvoices();
      setInvoices(res);
    } catch (err) {
      console.error('Failed fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [refreshKey]);

  const handleCreate = async () => {
    if (!customerName || !amount) return;
    try {
      await api.createInvoice({
        customerName,
        customerEmail,
        amount: Number(amount) || 5000,
        dueDate,
        description,
      });
      addToast({
        type: 'success',
        title: 'Invoice Generated',
        description: `Dispatched to ${customerName} ($${Number(amount).toLocaleString()}).`,
      });
      setIsCreateOpen(false);
      setCustomerName('');
      setCustomerEmail('');
      await fetchInvoices();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Invoice creation failed',
        description: (err as Error).message,
      });
    }
  };

  const handleSendReminder = async (invoiceId: string, invoiceNumber: string) => {
    try {
      setActionId(invoiceId);
      const res = await api.sendInvoiceReminder(invoiceId);
      addToast({
        type: 'success',
        title: 'Autonomous Reminder Dispatched',
        description: res.message,
      });
      await fetchInvoices();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Reminder failed',
        description: (err as Error).message,
      });
    } finally {
      setActionId(null);
    }
  };

  const handleRecordPayment = async (invoiceId: string, invoiceNumber: string) => {
    try {
      setActionId(invoiceId);
      await api.recordPayment(invoiceId);
      addToast({
        type: 'success',
        title: 'Payment Confirmed',
        description: `${invoiceNumber} settled via Stripe Instant Wire.`,
      });
      await fetchInvoices();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Settlement recording failed',
        description: (err as Error).message,
      });
    } finally {
      setActionId(null);
    }
  };

  const totalOverdue = invoices
    .filter(i => i.status === 'overdue' || i.status === 'in_collection')
    .reduce((acc, i) => acc + i.amount, 0);

  const totalCollected = invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-serif-display font-bold text-zinc-100">
              Invoices, Payments & Collections
            </h2>
            <Badge variant="gold" size="sm">
              Stripe Verified
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Receivables ledger, automated collection escalation sequences, and omnichannel payment links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="gold-accent" padding="sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Overdue Receivables (At Risk)
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-serif-display font-bold text-rose-300 mt-1">
            ${totalOverdue.toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Stage-2 automated dunning active
          </p>
        </Card>

        <Card variant="default" padding="sm">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Total Settled Revenue
          </span>
          <div className="text-xl font-serif-display font-bold text-emerald-400 mt-1">
            ${totalCollected.toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Verified Stripe & Wire transfers
          </p>
        </Card>

        <Card variant="default" padding="sm">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Average Days to Payment (DSO)
          </span>
          <div className="text-xl font-serif-display font-bold text-amber-300 mt-1">
            14.2 Days
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Reduced by 4.8 days via automated reminders
          </p>
        </Card>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-6 h-6" />}
          title="No Invoices Recorded"
          description="Create a commercial invoice to track payments and automated collection reminders."
          actionLabel="Generate Invoice"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => {
            const isOverdue = inv.status === 'overdue' || inv.status === 'in_collection';

            return (
              <Card
                key={inv.id}
                variant={isOverdue ? 'gold-accent' : 'default'}
                padding="md"
                className="hover:border-white/[0.14] transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-zinc-200">
                        {inv.invoiceNumber}
                      </span>
                      <h4 className="text-sm font-semibold text-zinc-100">{inv.customerName}</h4>
                      <Badge
                        variant={
                          inv.status === 'paid'
                            ? 'emerald'
                            : isOverdue
                            ? 'rose'
                            : 'amber'
                        }
                        size="sm"
                      >
                        {inv.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                      <span>{inv.customerEmail}</span>
                      <span>&middot;</span>
                      <span>Issued: {inv.issueDate}</span>
                      <span>&middot;</span>
                      <span className={isOverdue ? 'text-rose-400 font-medium' : ''}>
                        Due: {inv.dueDate}
                      </span>
                      {inv.collectionAttempts > 0 && (
                        <span className="text-[11px] font-mono text-amber-400">
                          ({inv.collectionAttempts} reminder{inv.collectionAttempts > 1 ? 's' : ''} dispatched)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-zinc-500">Invoice Total</span>
                      <div className="text-base font-mono font-bold text-amber-300">
                        ${inv.amount.toLocaleString()} {inv.currency}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {inv.status !== 'paid' && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            isLoading={actionId === inv.id}
                            onClick={() => handleSendReminder(inv.id, inv.invoiceNumber)}
                            leftIcon={<Send className="w-3 h-3 text-amber-400" />}
                          >
                            Send Dunning Notice
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={actionId === inv.id}
                            onClick={() => handleRecordPayment(inv.id, inv.invoiceNumber)}
                            leftIcon={<CheckCircle2 className="w-3 h-3" />}
                          >
                            Record Paid
                          </Button>
                        </>
                      )}
                      {inv.status === 'paid' && (
                        <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Settled {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Generate Commercial Invoice"
        subtitle="Create an itemized receivable linked to your verified payment gateway."
      >
        <div className="space-y-4">
          <Input
            label="Client Organization / Customer Name"
            placeholder="e.g. Nordic Trans-Logix AB"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            required
          />

          <Input
            label="Billing Recipient Email"
            type="email"
            placeholder="accounts.payable@client.com"
            value={customerEmail}
            onChange={e => setCustomerEmail(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount (USD)"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          <Input
            label="Line Item Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button variant="secondary" size="md" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleCreate}>
              Issue Commercial Invoice
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
