import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTenants, addTenant, editTenant, removeTenant } from '../slices/tenantSlice';
import { TenantList } from '../components/TenantList';
import { TenantForm } from '../components/TenantForm';
import { Button } from '../../../components/Button';
import { Plus } from 'lucide-react';
import type {  CreateTenantInput, Tenant  } from "../types";
import styles from '../../properties/pages/PropertiesPage.module.css'; // Reusing layout styles

export default function TenantsPage() {
  const dispatch = useAppDispatch();
  const { tenants, loading, error } = useAppSelector((state) => state.tenants);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchTenants());
  }, [dispatch]);

  const handleOpenAddForm = () => {
    setEditingTenant(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTenant(null);
  };

  const handleSubmitTenant = async (data: CreateTenantInput) => {
    try {
      setSubmitting(true);
      if (editingTenant) {
        await dispatch(editTenant({ id: editingTenant.id, data })).unwrap();
      } else {
        await dispatch(addTenant(data)).unwrap();
      }
      handleCloseForm();
    } catch (err) {
      console.error('Failed to save tenant', err);
      alert('Failed to save tenant. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTenant = async (tenant: Tenant) => {
    if (window.confirm('Are you sure you want to delete tenant "' + tenant.full_name + '"?')) {
      try {
        await dispatch(removeTenant(tenant.id)).unwrap();
      } catch (err) {
        console.error('Failed to delete tenant', err);
        alert('Failed to delete tenant. They might have active allocations.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tenants</h1>
          <p className="text-muted">Register and manage tenants across your properties.</p>
        </div>
        {!isFormOpen && (
          <Button onClick={handleOpenAddForm}>
            <Plus size={20} />
            <span>Register Tenant</span>
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
          <TenantForm 
            initialData={editingTenant || undefined}
            onSubmit={handleSubmitTenant} 
            onCancel={handleCloseForm} 
            isSubmitting={submitting}
          />
        </div>
      ) : (
        <div className={styles.listContainer}>
          {loading && tenants.length === 0 ? (
            <div className="flex-center" style={{ padding: '3rem' }}>Loading tenants...</div>
          ) : (
            <TenantList 
              tenants={tenants} 
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteTenant}
            />
          )}
        </div>
      )}
    </div>
  );
}
