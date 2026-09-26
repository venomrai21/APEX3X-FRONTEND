import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Badge, Button, Card, APEXReveal } from '../components/apex3x';
import { BusinessProfile } from '../components/settings/BusinessProfile';

export const BusinessProfileView: React.FC = () => {
  const { addToast, currentWorkspace, setCurrentWorkspace, triggerRefresh } = useApp();
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    try {
      setVerifying(true);
      const result = await api.verifyWorkspace();
      setCurrentWorkspace(result.workspace);
      triggerRefresh();
      addToast({
        type: 'success',
        title: 'Verification updated',
        description: 'Business verification status was updated by the connected service.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'Unable to update verification.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const statusLabel = !currentWorkspace
    ? 'NOT CONNECTED'
    : currentWorkspace.verificationStatus === 'verified'
      ? 'VERIFIED'
      : currentWorkspace.verificationStatus === 'in_review'
        ? 'IN REVIEW'
        : 'UNVERIFIED';

  return (
    <div className="space-y-6 pb-12">
      <APEXReveal>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Business Profile</h2>
              <Badge variant="neutral" size="sm">
                <ShieldCheck className="h-3 w-3" /> {statusLabel}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Tell APEX about your business so it can understand your customers, offers, operations, and goals.
            </p>
          </div>
          {currentWorkspace && currentWorkspace.verificationStatus !== 'verified' && (
            <Button variant="secondary" size="md" isLoading={verifying} onClick={handleVerify}>
              Submit Verification
            </Button>
          )}
        </div>

        <BusinessProfile addToast={addToast} />

        <Card padding="md">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
            <div>
              <div className="text-xs font-semibold text-[var(--text-primary)]">
                Business verification: {currentWorkspace?.verificationStatus || 'Not connected'}
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
                Verification is separate from the business information you provide and does not block the optional steps.
              </p>
            </div>
          </div>
        </Card>
      </APEXReveal>
    </div>
  );
};
