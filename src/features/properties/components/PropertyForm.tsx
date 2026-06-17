import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import type {  CreatePropertyInput  } from "../types";
import styles from './PropertyForm.module.css';

const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  property_type: z.string().min(1, 'Property type is required'),
  location: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

interface PropertyFormProps {
  initialData?: Property;
  onSubmit: (data: CreatePropertyInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CreatePropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData ? {
      name: initialData.name,
      property_type: initialData.property_type,
      location: initialData.location,
      description: initialData.description,
      notes: initialData.notes
    } : {
      name: '',
      property_type: 'Apartment',
      location: '',
      description: '',
      notes: ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h3 className={styles.title}>{initialData ? 'Edit Property' : 'Add New Property'}</h3>
      
      <Input 
        label="Property Name" 
        {...register('name')} 
        error={errors.name?.message} 
        placeholder="e.g. Green Court" 
      />
      
      <Input 
        label="Property Type" 
        type="select"
        {...register('property_type')} 
        error={errors.property_type?.message}
        options={[
          { value: 'Apartment', label: 'Apartment' },
          { value: 'Flats', label: 'Flats' },
          { value: 'Bedsitter block', label: 'Bedsitter block' },
          { value: 'Mixed units', label: 'Mixed units' },
          { value: 'Commercial Property', label: 'Commercial Property' },
        ]}
      />

      <Input 
        label="Location" 
        {...register('location')} 
        error={errors.location?.message} 
        placeholder="e.g. Westlands, Nairobi" 
      />

      <Input 
        label="Description" 
        type="textarea"
        {...register('description')} 
        error={errors.description?.message} 
        placeholder="Brief description of the property" 
      />

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} fullWidth>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Property' : 'Save Property'}
        </Button>
      </div>
    </form>
  );
};
