'use client';

import { useState, useEffect, FormEvent } from 'react';
import { X, UserPlus, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Transcript } from '@/types';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillName: string;
  transcriptId: string;
  onSuccess: (updatedTranscript: Transcript, leadName: string, leadId: string) => void;
}

export const LeadModal = ({
  isOpen,
  onClose,
  prefillName,
  transcriptId,
  onSuccess
}: LeadModalProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const trimmed = prefillName.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length > 0) {
      setFirstName(parts[0]);
      setLastName(parts.slice(1).join(' '));
    } else {
      setFirstName('');
      setLastName('');
    }
    setPhone('');
    setEmail('');
    setDuplicateWarning(false);
  }, [isOpen, prefillName]);

  useEffect(() => {
    if (!firstName.trim() && !lastName.trim()) {
      setDuplicateWarning(false);
      return;
    }

    const checkDuplicate = async () => {
      try {
        const response = await fetch(
          `/api/leads/search/check?firstName=${encodeURIComponent(firstName.trim())}&lastName=${encodeURIComponent(lastName.trim())}`
        );
        if (response.ok) {
          const data = await response.json();
          setDuplicateWarning(data.exists);
        }
      } catch (err) {
        console.error('Error checking duplicate lead:', err);
      }
    };

    const debounce = setTimeout(checkDuplicate, 400);
    return () => clearTimeout(debounce);
  }, [firstName, lastName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!lastName.trim()) {
      toast.error('Last name is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: firstName.trim(),
          lastname: lastName.trim(),
          phoneNumber: phone.trim(),
          email: email.trim(),
          transcriptId
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create lead');
      }

      toast.success(`Lead "${firstName} ${lastName}" created successfully!`);
      const leadName = `${firstName.trim()} ${lastName.trim()}`.trim();
      onSuccess(data.updatedTranscript, leadName, data.leadId);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs p-4 animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 flex flex-col gap-4 animate-scale-up"
      >
        <div className="flex items-center justify-between border-b border-zinc-150 pb-3 dark:border-zinc-850">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-450" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Create New Lead</h3>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. John"
                required
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-805 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-600 dark:focus:border-white"
              />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Doe"
                required
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-805 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-600 dark:focus:border-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-zinc-500">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 555-123-4567"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-805 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-600 dark:focus:border-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-zinc-500">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john.doe@example.com"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-805 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-600 dark:focus:border-white"
            />
          </div>

          {duplicateWarning && (
            <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3.5 text-xs text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 animate-shake">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="font-semibold leading-normal">
                A lead named &quot;{firstName} {lastName}&quot; already exists in Lofty.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-150 dark:border-zinc-850">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !firstName.trim() || !lastName.trim()}
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
