import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchPayments, addPayment, editPayment, removePayment } from '../slices/paymentSlice';
import { fetchTenants } from '../../tenants/slices/tenantSlice';
import { fetchUnits } from '../../units/slices/unitSlice';
import { PaymentList } from '../components/PaymentList';
import { PaymentForm } from '../components/PaymentForm';
import { Button } from '../../../components/Button';
import { Plus } from 'lucide-react';
import type {  CreatePaymentInput, Payment  } from "../types";
import styles from '../../properties/pages/PropertiesPage.module.css'; // Reusing layout styles

export default function PaymentsPage() {
  const dispatch = useAppDispatch();
  const { payments, loading, error } = useAppSelector((state) => state.payments);
  const { tenants } = useAppSelector((state) => state.tenants);
  const { units } = useAppSelector((state) => state.units);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchPayments());
    if (tenants.length === 0) dispatch(fetchTenants());
    if (units.length === 0) dispatch(fetchUnits());
  }, [dispatch, tenants.length, units.length]);

  const handleOpenAddForm = () => {
    setEditingPayment(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (payment: Payment) => {
    setEditingPayment(payment);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPayment(null);
  };

  const handleSubmitPayment = async (data: CreatePaymentInput) => {
    try {
      setSubmitting(true);
      if (editingPayment) {
        await dispatch(editPayment({ id: editingPayment.id, data })).unwrap();
      } else {
        await dispatch(addPayment(data)).unwrap();
      }
      handleCloseForm();
    } catch (err) {
      console.error('Failed to save payment', err);
      alert('Failed to save payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async (payment: Payment) => {
    if (window.confirm('Are you sure you want to delete this payment of KES ' + payment.amount_paid + '?')) {
      try {
        await dispatch(removePayment(payment.id)).unwrap();
      } catch (err) {
        console.error('Failed to delete payment', err);
        alert('Failed to delete payment.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Payments</h1>
          <p className="text-muted">Record and track rent, water, and garbage payments.</p>
        </div>
        {!isFormOpen && tenants.length > 0 && units.length > 0 && (
          <Button onClick={handleOpenAddForm}>
            <Plus size={20} />
            <span>Record Payment</span>
          </Button>
        )}
      </header>

      {error && (
        <div className={styles.errorBanner}>
          {error}
        </div>
      )}

      {(tenants.length === 0 || units.length === 0) && !loading && !isFormOpen && (
        <div className={styles.errorBanner} style={{ backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
          You must have at least one tenant and one unit registered to record a payment.
        </div>
      )}

      {isFormOpen ? (
        <div className={styles.formContainer}>
          <PaymentForm 
            initialData={editingPayment || undefined}
            onSubmit={handleSubmitPayment} 
            onCancel={handleCloseForm} 
            isSubmitting={submitting}
          />
        </div>
      ) : (
        <div className={styles.listContainer}>
          {loading && payments.length === 0 ? (
            <div className="flex-center" style={{ padding: '3rem' }}>Loading payments...</div>
          ) : (
            <PaymentList 
              payments={payments} 
              onEdit={handleOpenEditForm}
              onDelete={handleDeletePayment}
            />
          )}
        </div>
      )}
    </div>
  );
}
