import React, { useEffect, useState } from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const SubWorkspaceModal: React.FC = () => {
  const { subWorkspaceOpen, setSubWorkspaceOpen, refreshWorkspaces, switchWorkspace, addToast } = useApp();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subWorkspaceOpen) setName('');
  }, [subWorkspaceOpen]);

  if (!subWorkspaceOpen) return null;

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      addToast({ type: 'warning', title: 'Sub Workspace Name Required', description: 'Enter the business or operating workspace name.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const workspace = await api.createWorkspace({ name: trimmedName });
      await refreshWorkspaces();
      await switchWorkspace(workspace.id);
      setSubWorkspaceOpen(false);
      addToast({ type: 'success', title: 'Sub Workspace Created', description: `Now operating in ${workspace.name}.` });
    } catch (err) {
      addToast({ type: 'error', title: 'Sub Workspace Creation Failed', description: (err as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={subWorkspaceOpen} onClose={() => setSubWorkspaceOpen(false)} title="Create Sub Workspace" subtitle="Create a separate operating space for another business or business unit." maxWidth="md">
      <div className="space-y-5">
        <div className="p-4 rounded-xl bg-[#08080c] border border-white/[0.08]">
          <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-4 h-4" /> Multi-business workspace
          </div>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            Each Sub Workspace can represent a separate business or business unit. Additional Sub Workspaces can be created as needed.
          </p>
        </div>

        <Input
          label="Sub Workspace / Business Name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter workspace or business name"
          leftIcon={<Building2 className="w-4 h-4 text-zinc-500" />}
          autoFocus
        />

        <div className="flex justify-end pt-1">
          <Button variant="primary" size="md" isLoading={isSubmitting} onClick={handleCreate} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Create Sub Workspace
          </Button>
        </div>
      </div>
    </Modal>
  );
};
