import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchPayments, addPayment, editPayment, removePayment } from '../slices/paymentSlice';
import { fetchTenants } from '../../tenants/slices/tenantSlice';
import { fetchUnits } from '../../units/slices/unitSlice';
import { fetchSettings } from '../../settings/slices/settingsSlice';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const { data: settings } = useAppSelector((state) => state.settings);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchPayments());
    dispatch(fetchSettings());
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

  const handleGenerateReceipt = (payment: Payment) => {
    const doc = new jsPDF();
    const tenantName = tenants.find(t => t.id === payment.tenant_id)?.full_name || 'Unknown Tenant';
    const unitNumber = units.find(u => u.id === payment.unit_id)?.unit_number || 'Unknown Unit';
    
    doc.setFontSize(20);
    doc.text(settings?.company_name || 'Rental Pro', 105, 22, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    if (settings?.phone) doc.text(`Phone: ${settings.phone}`, 105, 28, { align: 'center' });
    if (settings?.email) doc.text(`Email: ${settings.email}`, 105, 33, { align: 'center' });
    if (settings?.address) doc.text(`Address: ${settings.address}`, 105, 38, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Payment Receipt', 14, 50);

    doc.setFontSize(12);
    doc.text(`Receipt No: RCT-${payment.id.substring(0, 8).toUpperCase()}`, 14, 60);
    doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString()}`, 14, 66);
    doc.text(`Tenant: ${tenantName}`, 14, 72);
    doc.text(`Unit: ${unitNumber}`, 14, 78);

    autoTable(doc, {
      startY: 85,
      head: [['Description', 'Amount']],
      body: [
        [payment.payment_type + ' Payment via ' + payment.payment_method, `KES ${payment.amount_paid.toLocaleString()}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [108, 99, 255] }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 85;
    
    doc.setFontSize(11);
    if (payment.balance > 0) {
      doc.setTextColor(220, 38, 38); // red for balance
      doc.text(`Outstanding Balance: KES ${payment.balance.toLocaleString()}`, 14, finalY + 10);
    } else {
      doc.setTextColor(22, 163, 74); // green for cleared
      doc.text(`Outstanding Balance: KES 0 (Cleared)`, 14, finalY + 10);
    }
    
    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.text('Thank you for your payment!', 14, finalY + 25);

    const fileName = `receipt-${payment.id.substring(0, 8)}.pdf`;

    import('@capacitor/core').then(({ Capacitor }) => {
      if (Capacitor.isNativePlatform()) {
        const pdfBase64 = doc.output('datauristring').split(',')[1];
        import('@capacitor/filesystem').then(({ Filesystem, Directory }) => {
          Filesystem.writeFile({
            path: fileName,
            data: pdfBase64,
            directory: Directory.Cache
          }).then(savedFile => {
            import('@capacitor/share').then(({ Share }) => {
              Share.share({
                title: 'Payment Receipt',
                url: savedFile.uri,
                dialogTitle: 'Share or Save Receipt'
              });
            });
          }).catch(e => {
            console.error('Error saving PDF', e);
            alert('Failed to save PDF on mobile.');
          });
        });
      } else {
        doc.save(fileName);
      }
    });
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
              onGenerateReceipt={handleGenerateReceipt}
            />
          )}
        </div>
      )}
    </div>
  );
}
