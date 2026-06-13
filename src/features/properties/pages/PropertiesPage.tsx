import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchProperties, addProperty, editProperty, removeProperty } from '../slices/propertySlice';
import { PropertyList } from '../components/PropertyList';
import { PropertyForm } from '../components/PropertyForm';
import { Button } from '../../../components/Button';
import { Plus } from 'lucide-react';
import type {  CreatePropertyInput, Property  } from "../types";
import styles from './PropertiesPage.module.css';

export default function PropertiesPage() {
  const dispatch = useAppDispatch();
  const { properties, loading, error } = useAppSelector((state) => state.properties);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  const handleOpenAddForm = () => {
    setEditingProperty(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProperty(null);
  };

  const handleSubmitProperty = async (data: CreatePropertyInput) => {
    try {
      setSubmitting(true);
      if (editingProperty) {
        await dispatch(editProperty({ id: editingProperty.id, data })).unwrap();
      } else {
        await dispatch(addProperty(data)).unwrap();
      }
      handleCloseForm();
    } catch (err) {
      console.error('Failed to save property', err);
      alert('Failed to save property. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProperty = async (property: Property) => {
    if (window.confirm('Are you sure you want to delete "' + property.name + '"? This action cannot be undone and will delete all associated units.')) {
      try {
        await dispatch(removeProperty(property.id)).unwrap();
      } catch (err) {
        console.error('Failed to delete property', err);
        alert('Failed to delete property. It might have active units.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Properties</h1>
          <p className="text-muted">Manage your rental properties and buildings.</p>
        </div>
        {!isFormOpen && (
          <Button onClick={handleOpenAddForm}>
            <Plus size={20} />
            <span>Add Property</span>
          </Button>
        )}
      </header>

      {error && (
        <div className={styles.errorBanner}>
          {error}
        </div>
      )}

      {isFormOpen ? (
        <div className={styles.formContainer}>
          <PropertyForm 
            initialData={editingProperty || undefined}
            onSubmit={handleSubmitProperty} 
            onCancel={handleCloseForm} 
            isSubmitting={submitting}
          />
        </div>
      ) : (
        <div className={styles.listContainer}>
          {loading && properties.length === 0 ? (
            <div className="flex-center" style={{ padding: '3rem' }}>Loading properties...</div>
          ) : (
            <PropertyList 
              properties={properties} 
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteProperty}
            />
          )}
        </div>
      )}
    </div>
  );
}
