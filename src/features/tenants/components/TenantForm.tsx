import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import type {  CreateTenantInput, Tenant  } from "../types";
import styles from './TenantForm.module.css';

const tenantSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  national_id: z.string().optional(),
  phone_number: z.string().min(1, 'Phone number is required'),
  emergency_contact: z.string().optional(),
  next_of_kin: z.string().optional(),
  occupation: z.string().optional(),
});

interface TenantFormProps {
  initialData?: Tenant;
  onSubmit: (data: CreateTenantInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const TenantForm: React.FC<TenantFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateTenantInput>({
    resolver: zodResolver(tenantSchema),
    defaultValues: initialData ? {
      full_name: initialData.full_name,
      national_id: initialData.national_id,
      phone_number: initialData.phone_number,
      emergency_contact: initialData.emergency_contact,
      next_of_kin: initialData.next_of_kin,
      occupation: initialData.occupation,
    } : {
      full_name: '',
      national_id: '',
      phone_number: '',
      emergency_contact: '',
      next_of_kin: '',
      occupation: '',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h3 className={styles.title}>{initialData ? 'Edit Tenant' : 'Register Tenant'}</h3>
      
      <div className={styles.row}>
        <Input 
          label="Full Name" 
          {...register('full_name')} 
          error={errors.full_name?.message} 
        />
        <Input 
          label="Phone Number" 
          {...register('phone_number')} 
          error={errors.phone_number?.message} 
        />
      </div>

      <div className={styles.row}>
        <Input 
          label="National ID / Passport" 
          {...register('national_id')} 
          error={errors.national_id?.message} 
        />
        <Input 
          label="Occupation" 
          {...register('occupation')} 
          error={errors.occupation?.message} 
        />
      </div>

      <div className={styles.row}>
        <Input 
          label="Emergency Contact" 
          {...register('emergency_contact')} 
          error={errors.emergency_contact?.message} 
        />
        <Input 
          label="Next of Kin" 
          {...register('next_of_kin')} 
          error={errors.next_of_kin?.message} 
        />
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} fullWidth>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Tenant' : 'Save Tenant'}
        </Button>
      </div>
    </form>
  );
};
