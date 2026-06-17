import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import type { CreateTenantInput, Tenant } from '../types';
import type { Unit } from '../../units/types';
import styles from './TenantForm.module.css';
import { Home } from 'lucide-react';

export interface AllocationDraft {
  unit_id: string;
  move_in_date: string;
  deposit_paid: number;
  notes: string;
}

const tenantSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  national_id: z.string().optional(),
  phone_number: z.string().min(1, 'Phone number is required'),
  emergency_contact: z.string().optional(),
  next_of_kin: z.string().optional(),
  occupation: z.string().optional(),
});

const allocationSchema = z.object({
  unit_id: z.string().min(1, 'Please select a unit'),
  move_in_date: z.string().min(1, 'Move-in date is required'),
  deposit_paid: z.coerce.number().min(0, 'Deposit must be 0 or more'),
  notes: z.string().optional(),
});

type AllocationForm = z.infer<typeof allocationSchema>;

interface TenantFormProps {
  initialData?: Tenant;
  onSubmit: (data: CreateTenantInput, allocationDraft?: AllocationDraft) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  vacantUnits?: Unit[];
}

export const TenantForm: React.FC<TenantFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  vacantUnits = [],
}) => {
  const [allocate, setAllocate] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTenantInput>({
    resolver: zodResolver(tenantSchema),
    defaultValues: initialData
      ? {
          full_name: initialData.full_name,
          national_id: initialData.national_id,
          phone_number: initialData.phone_number,
          emergency_contact: initialData.emergency_contact,
          next_of_kin: initialData.next_of_kin,
          occupation: initialData.occupation,
        }
      : {
          full_name: '',
          national_id: '',
          phone_number: '',
          emergency_contact: '',
          next_of_kin: '',
          occupation: '',
        },
  });

  const {
    register: registerAlloc,
    handleSubmit: handleSubmitAlloc,
    formState: { errors: allocErrors },
  } = useForm<AllocationForm>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      unit_id: '',
      move_in_date: new Date().toISOString().split('T')[0],
      deposit_paid: 0,
      notes: '',
    },
  });

  const onFormSubmit = handleSubmit((tenantData) => {
    if (allocate) {
      handleSubmitAlloc((allocData) => {
        onSubmit(tenantData, {
          unit_id: allocData.unit_id,
          move_in_date: allocData.move_in_date,
          deposit_paid: allocData.deposit_paid,
          notes: allocData.notes || '',
        });
      })();
    } else {
      onSubmit(tenantData, undefined);
    }
  });

  const isNew = !initialData;

  return (
    <form onSubmit={onFormSubmit} className={styles.form}>
      <h3 className={styles.title}>{initialData ? 'Edit Tenant' : 'Register Tenant'}</h3>

      {/* ── Tenant details ── */}
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

      {/* ── Unit allocation toggle (new tenants only) ── */}
      {isNew && (
        <div className={styles.allocSection}>
          <button
            type="button"
            className={`${styles.allocToggle} ${allocate ? styles.allocToggleActive : ''}`}
            onClick={() => setAllocate((v) => !v)}
          >
            <Home size={16} />
            <span>{allocate ? 'Remove Unit Allocation' : 'Allocate to a Unit (optional)'}</span>
          </button>

          {allocate && (
            <div className={styles.allocFields}>
              <div className={styles.row}>
                <Input
                  label="Select Unit"
                  type="select"
                  options={vacantUnits.map((u) => ({
                    value: u.id,
                    label: `Unit ${u.unit_number} — ${u.unit_type} (KES ${u.monthly_rent.toLocaleString()}/mo)`,
                  }))}
                  {...registerAlloc('unit_id')}
                  error={allocErrors.unit_id?.message}
                />
                <Input
                  label="Move-in Date"
                  type="date"
                  {...registerAlloc('move_in_date')}
                  error={allocErrors.move_in_date?.message}
                />
              </div>
              <div className={styles.row}>
                <Input
                  label="Deposit Paid (KES)"
                  type="number"
                  min={0}
                  {...registerAlloc('deposit_paid')}
                  error={allocErrors.deposit_paid?.message}
                />
                <Input
                  label="Notes (optional)"
                  {...registerAlloc('notes')}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} fullWidth>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Tenant' : allocate ? 'Register & Allocate' : 'Save Tenant'}
        </Button>
      </div>
    </form>
  );
};
