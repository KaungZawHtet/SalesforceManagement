'use client';

import { LoaderCircle, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createAccount } from '@/lib/api/accounts';
import type { Account } from '@/types/account';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Account name is required')
    .max(255, 'Account name must not exceed 255 characters'),
  phone: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(255, 'Phone must not exceed 255 characters').optional(),
  ),
  website: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().url('Website must be a valid URL').optional(),
  ),
  industry: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(255, 'Industry must not exceed 255 characters').optional(),
  ),
});

type FormValues = z.infer<typeof formSchema>;
type FormInput = z.input<typeof formSchema>;

interface CreateAccountFormProps {
  onSuccess: (account: Account) => void | Promise<void>;
}

export function CreateAccountForm({ onSuccess }: CreateAccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const account = await createAccount({
        name: data.name,
        phone: data.phone,
        website: data.website,
        industry: data.industry,
      });
      reset();
      await onSuccess(account);
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Something went wrong. Please try again.';
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-foreground" htmlFor="name">
          Name *
        </Label>
        <Input
          id="name"
          placeholder="Acme Corporation"
          className={errors.name ? 'border-destructive/60 focus-visible:ring-destructive/40' : ''}
          {...register('name')}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-xs font-medium text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-foreground" htmlFor="phone">
          Phone
        </Label>
        <Input
          id="phone"
          placeholder="+1 555-1234"
          className={errors.phone ? 'border-destructive/60 focus-visible:ring-destructive/40' : ''}
          {...register('phone')}
          aria-invalid={errors.phone ? 'true' : 'false'}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone && (
          <p id="phone-error" role="alert" className="text-xs font-medium text-destructive">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-foreground" htmlFor="website">
          Website
        </Label>
        <Input
          id="website"
          type="url"
          placeholder="https://example.com"
          className={errors.website ? 'border-destructive/60 focus-visible:ring-destructive/40' : ''}
          {...register('website')}
          aria-invalid={errors.website ? 'true' : 'false'}
          aria-describedby={errors.website ? 'website-error' : undefined}
        />
        {errors.website && (
          <p id="website-error" role="alert" className="text-xs font-medium text-destructive">
            {errors.website.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-foreground" htmlFor="industry">
          Industry
        </Label>
        <Input
          id="industry"
          placeholder="Technology"
          className={errors.industry ? 'border-destructive/60 focus-visible:ring-destructive/40' : ''}
          {...register('industry')}
          aria-invalid={errors.industry ? 'true' : 'false'}
          aria-describedby={errors.industry ? 'industry-error' : undefined}
        />
        {errors.industry && (
          <p id="industry-error" role="alert" className="text-xs font-medium text-destructive">
            {errors.industry.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="mt-2 h-11 w-full rounded-lg shadow-sm"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle aria-hidden="true" className="animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Plus aria-hidden="true" />
            Create Account
          </>
        )}
      </Button>
    </form>
  );
}
