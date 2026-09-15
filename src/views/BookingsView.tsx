import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, User, Mail, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Appointment } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const BookingsView: React.FC = () => {
  const { addToast, triggerRefresh, refreshKey } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [duration, setDuration] = useState('30');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.getBookings();
      setAppointments(res);
    } catch (err) {
      console.error('Failed fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [refreshKey]);

  const handleCreate = async () => {
    if (!customerName || !scheduledAt) return;
    try {
      await api.createBooking({
        title: title || undefined,
        customerName,
        customerEmail,
        customerPhone,
        scheduledAt,
        durationMinutes: Number(duration),
        serviceType: serviceType || undefined,
      });
      addToast({
        type: 'success',
        title: 'Appointment Created',
        description: `Scheduled with ${customerName}.`,
      });
      setIsCreateOpen(false);
      setTitle('');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setServiceType('');
      await fetchBookings();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Booking failed',
        description: (err as Error).message,
      });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setStatusUpdatingId(id);
      await api.updateBookingStatus(id, newStatus);
      addToast({
        type: 'info',
        title: 'Status Updated',
        description: `Booking updated to ${newStatus}.`,
      });
      await fetchBookings();
      triggerRefresh();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update failed',
        description: (err as Error).message,
      });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-serif-display font-bold text-zinc-100">
              Appointments & Calendar Scheduling
            </h2>
            <Badge variant="gold" size="sm">
              {appointments.length} Bookings
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Appointment scheduling and status management for this workspace.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Schedule Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" padding="sm">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Confirmed Bookings</span>
          <div className="text-xl font-serif-display font-bold text-zinc-100 mt-1">{confirmedCount}</div>
        </Card>
        <Card variant="default" padding="sm">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Pending Confirmation</span>
          <div className="text-xl font-serif-display font-bold text-amber-300 mt-1">{pendingCount}</div>
        </Card>
        <Card variant="default" padding="sm">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Completed Bookings</span>
          <div className="text-xl font-serif-display font-bold text-emerald-400 mt-1">
            {appointments.filter(a => a.status === 'completed').length}
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="No Scheduled Appointments"
          description="No appointments are available for this workspace."
          actionLabel="Schedule Appointment"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {appointments.map(appt => {
            const dateObj = new Date(appt.scheduledAt);
            return (
              <Card key={appt.id} variant="default" padding="md" className="hover:border-white/[0.14] transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-sm font-semibold text-zinc-100">{appt.title}</h4>
                      <Badge variant={appt.status === 'confirmed' ? 'emerald' : appt.status === 'pending' ? 'amber' : 'slate'} size="sm">
                        {appt.status.toUpperCase()}
                      </Badge>
                      {appt.serviceType && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400">{appt.serviceType}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                      <span className="flex items-center gap-1.5 text-zinc-300 font-medium"><User className="w-3.5 h-3.5 text-zinc-500" /> {appt.customerName}</span>
                      {appt.customerEmail && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-zinc-500" /> {appt.customerEmail}</span>}
                      {appt.customerPhone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-zinc-500" /> {appt.customerPhone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono font-medium justify-end">
                        <Clock className="w-3.5 h-3.5" />
                        {dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <span className="text-[11px] text-zinc-500">{appt.durationMinutes} mins{appt.assignedStaff ? ` · Staff: ${appt.assignedStaff}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {appt.status === 'pending' && <Button variant="secondary" size="sm" isLoading={statusUpdatingId === appt.id} onClick={() => handleUpdateStatus(appt.id, 'confirmed')}>Confirm</Button>}
                      {appt.status === 'confirmed' && <Button variant="outline" size="sm" isLoading={statusUpdatingId === appt.id} onClick={() => handleUpdateStatus(appt.id, 'completed')}>Mark Completed</Button>}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Schedule Appointment" subtitle="Create an appointment for the current workspace.">
        <div className="space-y-4">
          <Input label="Session Purpose / Title" placeholder="Enter appointment title" value={title} onChange={e => setTitle(e.target.value)} />
          <Input label="Client / Contact Name" placeholder="Enter contact name" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Contact Email" type="email" placeholder="Enter email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
            <Input label="Contact Phone" placeholder="Enter phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date & Time" type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required />
            <Select label="Duration" value={duration} onChange={e => setDuration(e.target.value)} options={[
              { value: '15', label: '15 Minutes' },
              { value: '30', label: '30 Minutes' },
              { value: '45', label: '45 Minutes' },
              { value: '60', label: '60 Minutes (1 Hour)' },
            ]} />
          </div>
          <Input label="Service Type" placeholder="Enter service type" value={serviceType} onChange={e => setServiceType(e.target.value)} />
          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button variant="secondary" size="md" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={handleCreate}>Create Appointment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
