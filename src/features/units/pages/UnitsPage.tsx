import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchUnits, addUnit, editUnit, removeUnit } from '../slices/unitSlice';
import { fetchProperties } from '../../properties/slices/propertySlice';
import { UnitList } from '../components/UnitList';
import { UnitForm } from '../components/UnitForm';
import { Button } from '../../../components/Button';
import { Plus } from 'lucide-react';
import type {  CreateUnitInput, Unit  } from "../types";
import styles from '../../properties/pages/PropertiesPage.module.css'; // Reusing layout styles

export default function UnitsPage() {
  const dispatch = useAppDispatch();
  const { units, loading, error } = useAppSelector((state) => state.units);
  const { properties } = useAppSelector((state) => state.properties);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchUnits());
    if (properties.length === 0) {
      dispatch(fetchProperties());
    }
  }, [dispatch, properties.length]);

  const handleOpenAddForm = () => {
    setEditingUnit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (unit: Unit) => {
    setEditingUnit(unit);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUnit(null);
  };

  const handleSubmitUnit = async (data: CreateUnitInput) => {
    try {
      setSubmitting(true);
      if (editingUnit) {
        await dispatch(editUnit({ id: editingUnit.id, data })).unwrap();
      } else {
        await dispatch(addUnit(data)).unwrap();
      }
      handleCloseForm();
    } catch (err) {
      console.error('Failed to save unit', err);
      alert('Failed to save unit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUnit = async (unit: Unit) => {
    if (window.confirm('Are you sure you want to delete unit "' + unit.unit_number + '"?')) {
      try {
        await dispatch(removeUnit(unit.id)).unwrap();
      } catch (err) {
        console.error('Failed to delete unit', err);
        alert('Failed to delete unit. It might be occupied by a tenant.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Units</h1>
          <p className="text-muted">Manage individual rental units across all properties.</p>
        </div>
        {!isFormOpen && properties.length > 0 && (
          <Button onClick={handleOpenAddForm}>
            <Plus size={20} />
            <span>Add Unit</span>
          </Button>
        )}
      </header>

      {error && (
        <div className={styles.errorBanner}>
          {error}
        </div>
      )}
      
      {properties.length === 0 && !loading && (
        <div className={styles.errorBanner} style={{ backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
          You must create a property before you can add units.
        </div>
      )}

      {isFormOpen ? (
        <div className={styles.formContainer}>
          <UnitForm 
            initialData={editingUnit || undefined}
            onSubmit={handleSubmitUnit} 
            onCancel={handleCloseForm} 
            isSubmitting={submitting}
          />
        </div>
      ) : (
        <div className={styles.listContainer}>
          {loading && units.length === 0 ? (
            <div className="flex-center" style={{ padding: '3rem' }}>Loading units...</div>
          ) : (
            <UnitList 
              units={units} 
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteUnit}
            />
          )}
        </div>
      )}
    </div>
  );
}
