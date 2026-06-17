import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import type {  CreateUnitInput, Unit  } from "../types";
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchProperties } from '../../properties/slices/propertySlice';
import styles from './UnitForm.module.css';

const unitSchema = z.object({
  property_id: z.string().min(1, 'Property is required'),
  unit_number: z.string().min(1, 'Unit number is required'),
  unit_type: z.string().min(1, 'Unit type is required'),
  monthly_rent: z.number().min(0, 'Monthly rent must be positive'),
  water_charge: z.number().min(0, 'Water charge must be positive'),
  garbage_fee: z.number().min(0, 'Garbage fee must be positive'),
  status: z.enum(['Occupied', 'Vacant', 'Reserved', 'Under Maintenance']),
});

interface UnitFormProps {
  initialData?: Unit;
  onSubmit: (data: CreateUnitInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const UnitForm: React.FC<UnitFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const dispatch = useAppDispatch();
  const { properties } = useAppSelector((state) => state.properties);

  useEffect(() => {
    if (properties.length === 0) {
      dispatch(fetchProperties());
    }
  }, [dispatch, properties.length]);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateUnitInput>({
    resolver: zodResolver(unitSchema),
    defaultValues: initialData ? {
      property_id: initialData.property_id,
      unit_number: initialData.unit_number,
      unit_type: initialData.unit_type,
      monthly_rent: initialData.monthly_rent,
      water_charge: initialData.water_charge,
      garbage_fee: initialData.garbage_fee,
      status: initialData.status
    } : {
      property_id: '',
      unit_number: '',
      unit_type: 'Bedsitter',
      monthly_rent: 0,
      water_charge: 0,
      garbage_fee: 0,
      status: 'Vacant'
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h3 className={styles.title}>{initialData ? 'Edit Unit' : 'Add New Unit'}</h3>

      
      <Input 
        label="Select Property" 
        type="select"
        {...register('property_id')} 
        error={errors.property_id?.message}
        options={properties.map(p => ({ value: p.id, label: p.name }))}
      />

      <div className={styles.row}>
        <Input 
          label="Unit Number/Name" 
          {...register('unit_number')} 
          error={errors.unit_number?.message} 
          placeholder="e.g. A1, B2" 
        />
        
        <Input 
          label="Unit Type" 
          type="select"
          {...register('unit_type')} 
          error={errors.unit_type?.message}
          options={[
            { value: 'Bedsitter', label: 'Bedsitter' },
            { value: '1 Bedroom', label: '1 Bedroom' },
            { value: '2 Bedroom', label: '2 Bedroom' },
            { value: '3 Bedroom', label: '3 Bedroom' },
            { value: 'Shop', label: 'Shop' },
            { value: 'Front unit', label: 'Front unit' },
            { value: 'Inner unit', label: 'Inner unit' },
            { value: 'Back unit', label: 'Back unit' },
          ]}
        />
      </div>

      <div className={styles.row}>
        <Input 
          label="Monthly Rent" 
          type="number"
          {...register('monthly_rent', { valueAsNumber: true })} 
          error={errors.monthly_rent?.message} 
        />
        
        <Input 
          label="Water Charge" 
          type="number"
          {...register('water_charge', { valueAsNumber: true })} 
          error={errors.water_charge?.message} 
        />
        
        <Input 
          label="Garbage Fee" 
          type="number"
          {...register('garbage_fee', { valueAsNumber: true })} 
          error={errors.garbage_fee?.message} 
        />
      </div>

      <Input 
        label="Initial Status" 
        type="select"
        {...register('status')} 
        error={errors.status?.message}
        options={[
          { value: 'Vacant', label: 'Vacant' },
          { value: 'Occupied', label: 'Occupied' },
          { value: 'Reserved', label: 'Reserved' },
          { value: 'Under Maintenance', label: 'Under Maintenance' },
        ]}
      />

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>Cancel</Button>
        <Button type="submit" disabled={isSubmitting || properties.length === 0} fullWidth>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Unit' : 'Save Unit'}
        </Button>
      </div>
    </form>
  );
};
