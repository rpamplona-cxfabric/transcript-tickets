import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createLead, checkLeadExists } from '@/lib/api/leads';
import { queryKeys } from '@/lib/queryKeys';
import { Transcript } from '@/types';

export const leadModalSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

export type LeadModalFormValues = z.infer<typeof leadModalSchema>;

interface UseLeadModalProps {
  isOpen: boolean;
  prefillName: string;
  transcriptId: string;
  onSuccess: (updatedTranscript: Transcript, leadName: string, leadId: string) => void;
  onClose: () => void;
}

export const useLeadModal = ({ isOpen, prefillName, transcriptId, onSuccess, onClose }: UseLeadModalProps) => {
  const form = useForm<LeadModalFormValues>({
    resolver: zodResolver(leadModalSchema),
  });

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = form;

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

  const { data: duplicateExists } = useQuery({
    queryKey: queryKeys.leadExists(firstName.trim(), lastName.trim()),
    queryFn: () => checkLeadExists(firstName.trim(), lastName.trim()),
    enabled: isOpen && firstName.trim().length > 0 && lastName.trim().length > 0,
    staleTime: 10_000,
  });

  const mutation = useMutation({
    mutationFn: (values: LeadModalFormValues) =>
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
    onError: (err: Error) => toast.error(err.message || 'Failed to create lead'),
  });

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    firstName,
    lastName,
    duplicateExists,
    isPending: mutation.isPending,
    onSubmit: handleSubmit((v) => mutation.mutate(v)),
  };
};
