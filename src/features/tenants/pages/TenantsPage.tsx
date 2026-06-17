import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTenants, addTenant, editTenant, removeTenant, allocateTenant, fetchAllocations, moveOutTenant } from '../slices/tenantSlice';
import { fetchUnits } from '../../units/slices/unitSlice';
import { TenantList } from '../components/TenantList';
import { TenantForm } from '../components/TenantForm';
import type { AllocationDraft } from '../components/TenantForm';
import { Button } from '../../../components/Button';
import { Plus } from 'lucide-react';
import type { CreateTenantInput, Tenant } from '../types';
import styles from '../../properties/pages/PropertiesPage.module.css'; // Reusing layout styles

export default function TenantsPage() {
  const dispatch = useAppDispatch();
  const { tenants, allocations, loading, error } = useAppSelector((state) => state.tenants);
  const { units } = useAppSelector((state) => state.units);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchTenants());
    dispatch(fetchAllocations());
    dispatch(fetchUnits());
  }, [dispatch]);

  const vacantUnits = units.filter((u) => u.status === 'Vacant');

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

  const handleSubmitTenant = async (data: CreateTenantInput, allocationDraft?: AllocationDraft) => {
    try {
      setSubmitting(true);
      if (editingTenant) {
        await dispatch(editTenant({ id: editingTenant.id, data })).unwrap();
      } else {
        // 1. Register the tenant
        const newTenant = await dispatch(addTenant(data)).unwrap();

        // 2. Optionally allocate immediately
        if (allocationDraft && allocationDraft.unit_id) {
          await dispatch(
            allocateTenant({
              tenant_id: newTenant.id,
              unit_id: allocationDraft.unit_id,
              move_in_date: new Date(allocationDraft.move_in_date).getTime(),
              move_out_date: null,
              deposit_paid: allocationDraft.deposit_paid,
              status: 'Active',
              notes: allocationDraft.notes,
            })
          ).unwrap();
        }
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
        alert('Failed to delete tenant.');
      }
    }
  };

  const handleMoveOutTenant = async (tenant: Tenant, allocation: any) => {
    if (window.confirm('Are you sure you want to move out "' + tenant.full_name + '"? They will be marked as Inactive and their unit will become Vacant.')) {
      try {
        await dispatch(moveOutTenant({ tenantId: tenant.id, unitId: allocation.unit_id, allocationId: allocation.id })).unwrap();
      } catch (err) {
        console.error('Failed to move out tenant', err);
        alert('Failed to move out tenant.');
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
            vacantUnits={vacantUnits}
          />
        </div>
      ) : (
        <div className={styles.listContainer}>
          {loading && tenants.length === 0 ? (
            <div className="flex-center" style={{ padding: '3rem' }}>Loading tenants...</div>
          ) : (
            <TenantList
              tenants={tenants}
              allocations={allocations}
              units={units}
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteTenant}
              onMoveOut={handleMoveOutTenant}
            />
          )}
        </div>
      )}
    </div>
  );
}
