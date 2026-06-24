import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
  rent_amount: z.number().min(0).optional(),
  water_amount: z.number().min(0).optional(),
  garbage_amount: z.number().min(0).optional(),
  deposit_amount: z.number().min(0).optional(),
  other_amount: z.number().min(0).optional(),
  amount_paid: z.number().min(1, 'Total Amount must be greater than 0'),
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

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData ? {
      ...initialData,
    } : {
      tenant_id: '',
      unit_id: '',
      rent_amount: 0,
      water_amount: 0,
      garbage_amount: 0,
      deposit_amount: 0,
      other_amount: 0,
      amount_paid: 0,
      balance: 0,
      payment_method: 'M-Pesa',
      payment_date: Date.now(),
      notes: ''
    }
  });

  const rent = useWatch({ control, name: 'rent_amount' }) || 0;
  const water = useWatch({ control, name: 'water_amount' }) || 0;
  const garbage = useWatch({ control, name: 'garbage_amount' }) || 0;
  const deposit = useWatch({ control, name: 'deposit_amount' }) || 0;
  const other = useWatch({ control, name: 'other_amount' }) || 0;

  useEffect(() => {
    const total = (Number(rent) || 0) + (Number(water) || 0) + (Number(garbage) || 0) + (Number(deposit) || 0) + (Number(other) || 0);
    setValue('amount_paid', total);
  }, [rent, water, garbage, deposit, other, setValue]);

  const handleFormSubmit = (data: PaymentFormData) => {
    const { notes, ...rest } = data;
    
    const types: string[] = [];
    if (data.rent_amount && data.rent_amount > 0) types.push('Rent');
    if (data.water_amount && data.water_amount > 0) types.push('Water');
    if (data.garbage_amount && data.garbage_amount > 0) types.push('Garbage');
    if (data.deposit_amount && data.deposit_amount > 0) types.push('Deposit');
    if (data.other_amount && data.other_amount > 0) types.push('Other');

    onSubmit({
      ...rest,
      notes: notes || '',
      payment_type: types.length > 0 ? types.join(', ') : 'Unknown',
      rent_amount: data.rent_amount || 0,
      water_amount: data.water_amount || 0,
      garbage_amount: data.garbage_amount || 0,
      deposit_amount: data.deposit_amount || 0,
      other_amount: data.other_amount || 0,
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
        <Input 
          label="Rent Amount (KES)" 
          type="number"
          {...register('rent_amount', { valueAsNumber: true })} 
          error={errors.rent_amount?.message} 
        />
        <Input 
          label="Water Amount (KES)" 
          type="number"
          {...register('water_amount', { valueAsNumber: true })} 
          error={errors.water_amount?.message} 
        />
      </div>

      <div className={styles.row}>
        <Input 
          label="Garbage Amount (KES)" 
          type="number"
          {...register('garbage_amount', { valueAsNumber: true })} 
          error={errors.garbage_amount?.message} 
        />
        <Input 
          label="Deposit Amount (KES)" 
          type="number"
          {...register('deposit_amount', { valueAsNumber: true })} 
          error={errors.deposit_amount?.message} 
        />
      </div>

      <div className={styles.row}>
        <Input 
          label="Other Amount (KES)" 
          type="number"
          {...register('other_amount', { valueAsNumber: true })} 
          error={errors.other_amount?.message} 
        />
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
          label="Total Amount Paid (KES)" 
          type="number"
          {...register('amount_paid', { valueAsNumber: true })} 
          error={errors.amount_paid?.message} 
          disabled // calculated automatically
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
