import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import type {  CreatePaymentInput, Payment  } from "../types";
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTenants } from '../../tenants/slices/tenantSlice';
import { fetchUnits } from '../../units/slices/unitSlice';
import styles from './PaymentForm.module.css';

const paymentSchema = z.object({
  tenant_id: z.string().min(1, 'Tenant is required'),
  unit_id: z.string().min(1, 'Unit is required'),
  payment_types: z.array(z.string()).min(1, 'Select at least one payment type'),
  amount_paid: z.number().min(1, 'Amount must be greater than 0'),
  balance: z.number(),
  payment_method: z.enum(['Cash', 'M-Pesa', 'Bank']),
  payment_date: z.number(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  initialData?: Payment;
  onSubmit: (data: CreatePaymentInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const dispatch = useAppDispatch();
  const { tenants } = useAppSelector(state => state.tenants);
  const { units } = useAppSelector(state => state.units);

  useEffect(() => {
    if (tenants.length === 0) dispatch(fetchTenants());
    if (units.length === 0) dispatch(fetchUnits(undefined));
  }, [dispatch, tenants.length, units.length]);

  const { register, handleSubmit, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData ? {
      ...initialData,
      payment_types: initialData.payment_type ? initialData.payment_type.split(', ') : ['Rent'],
    } : {
      tenant_id: '',
      unit_id: '',
      payment_types: ['Rent'],
      amount_paid: 0,
      balance: 0,
      payment_method: 'M-Pesa',
      payment_date: Date.now(),
      notes: ''
    }
  });

  const handleFormSubmit = (data: PaymentFormData) => {
    const { payment_types, notes, ...rest } = data;
    onSubmit({
      ...rest,
      notes: notes || '',
      payment_type: payment_types.join(', ')
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
      <h3 className={styles.title}>{initialData ? 'Edit Payment' : 'Record Payment'}</h3>
      
      <div className={styles.row}>
        <Input 
          label="Tenant" 
          type="select"
          {...register('tenant_id')} 
          error={errors.tenant_id?.message}
          options={tenants.map(t => ({ value: t.id, label: t.full_name }))}
        />
        <Input 
          label="Unit" 
          type="select"
          {...register('unit_id')} 
          error={errors.unit_id?.message}
          options={units.map(u => ({ value: u.id, label: u.unit_number }))}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxGroupLabel}>Payment Types</label>
          <div className={styles.checkboxes}>
            {['Rent', 'Water', 'Garbage', 'Deposit', 'Other'].map(type => (
              <label key={type} className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  value={type} 
                  {...register('payment_types')} 
                />
                {type}
              </label>
            ))}
          </div>
          {errors.payment_types && <span className={styles.errorText}>{errors.payment_types.message}</span>}
        </div>
        <Input 
          label="Payment Method" 
          type="select"
          {...register('payment_method')} 
          error={errors.payment_method?.message}
          options={[
            { value: 'Cash', label: 'Cash' },
            { value: 'M-Pesa', label: 'M-Pesa' },
            { value: 'Bank', label: 'Bank' },
          ]}
        />
      </div>

      <div className={styles.row}>
        <Input 
          label="Amount Paid (KES)" 
          type="number"
          {...register('amount_paid', { valueAsNumber: true })} 
          error={errors.amount_paid?.message} 
        />
        <Input 
          label="Remaining Balance (KES)" 
          type="number"
          {...register('balance', { valueAsNumber: true })} 
          error={errors.balance?.message} 
        />
      </div>

      <Input 
        label="Notes" 
        type="textarea"
        {...register('notes')} 
        error={errors.notes?.message} 
        placeholder="Receipt number or details"
      />

      {/* Hidden date input for now, we just use Date.now() on creation. 
          If user wants to edit date later, we can add a date picker */}
      <input type="hidden" {...register('payment_date', { valueAsNumber: true })} />

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>Cancel</Button>
        <Button type="submit" disabled={isSubmitting || tenants.length === 0} fullWidth>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Payment' : 'Record Payment'}
        </Button>
      </div>
    </form>
  );
};
