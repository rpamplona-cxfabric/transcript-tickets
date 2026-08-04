'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X, UserPlus, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createLead, checkLeadExists } from '@/lib/api/leads';
import { queryKeys } from '@/lib/queryKeys';
import { Transcript } from '@/types';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillName: string;
  transcriptId: string;
  onSuccess: (updatedTranscript: Transcript, leadName: string, leadId: string) => void;
}

export const LeadModal = ({ isOpen, onClose, prefillName, transcriptId, onSuccess }: LeadModalProps) => {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const firstName = watch('firstName') ?? '';
  const lastName = watch('lastName') ?? '';

  useEffect(() => {
    if (!isOpen) return;
    const parts = prefillName.trim().split(/\s+/);
    reset({
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      phone: '',
      email: '',
    });
  }, [isOpen, prefillName, reset]);

  const { data: exists } = useQuery({
    queryKey: queryKeys.leadExists(firstName.trim(), lastName.trim()),
    queryFn: () => checkLeadExists(firstName.trim(), lastName.trim()),
    enabled: isOpen && firstName.trim().length > 0 && lastName.trim().length > 0,
    staleTime: 10_000,
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createLead({
        firstname: values.firstName.trim(),
        lastname: values.lastName.trim(),
        phoneNumber: values.phone?.trim(),
        email: values.email?.trim(),
        transcriptId,
      }),
    onSuccess: (data, values) => {
      const leadName = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
      toast.success(`Lead "${leadName}" created successfully!`);
      onSuccess(data.updatedTranscript, leadName, data.leadId);
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create lead');
    },
  });

  if (!isOpen) return null;

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
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500">First Name *</label>
              <input
                {...register('firstName')}
                placeholder="e.g. John"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-805 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-600 dark:focus:border-white"
              />
              {errors.firstName && <p className="text-[10px] text-red-500">{errors.firstName.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500">Last Name *</label>
              <input
                {...register('lastName')}
                placeholder="e.g. Doe"
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-805 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-600 dark:focus:border-white"
              />
              {errors.lastName && <p className="text-[10px] text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-zinc-500">Phone Number</label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="e.g. 555-123-4567"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-805 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-600 dark:focus:border-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-zinc-500">Email Address</label>
            <input
              {...register('email')}
              type="email"
              placeholder="e.g. john.doe@example.com"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-805 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-600 dark:focus:border-white"
            />
            {errors.email && <p className="text-[10px] text-red-500">{errors.email.message}</p>}
          </div>

          {exists && (
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
              disabled={isSubmitting || mutation.isPending}
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              {mutation.isPending ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
