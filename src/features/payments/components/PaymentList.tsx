import React from 'react';
import type {  Payment  } from "../types";
import { Card } from '../../../components/Card';
import { Banknote, Pencil, Trash2, Calendar, Download } from 'lucide-react';
import styles from './PaymentList.module.css';
import { useAppSelector } from '../../../store/hooks';

interface PaymentListProps {
  payments: Payment[];
  onEdit?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
  onGenerateReceipt?: (payment: Payment) => void;
}

export const PaymentList: React.FC<PaymentListProps> = ({ payments, onEdit, onDelete, onGenerateReceipt }) => {
  const { tenants } = useAppSelector(state => state.tenants);
  const { units } = useAppSelector(state => state.units);

  if (payments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Banknote size={48} className={styles.emptyIcon} />
        <p>No payments recorded.</p>
        <p className="text-muted">Record a payment to get started.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {payments.map((payment) => {
        const tenantName = tenants.find(t => t.id === payment.tenant_id)?.full_name || 'Unknown Tenant';
        const unitNumber = units.find(u => u.id === payment.unit_id)?.unit_number || 'Unknown Unit';
        const dateStr = new Date(payment.payment_date).toLocaleDateString();

        const paymentTypes = payment.payment_type.includes(',') 
          ? payment.payment_type.split(', ').join(' & ') 
          : payment.payment_type;
        const mainType = payment.payment_type.split(',')[0].trim();

        return (
          <Card key={payment.id} className={styles.paymentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <h4 className={styles.amount}>KES {payment.amount_paid.toLocaleString()}</h4>
                <span className={`${styles.statusBadge} ${styles[mainType] || ''}`}>
                  {paymentTypes}
                </span>
              </div>
              <div className={styles.actions}>
                <button 
                  className={styles.iconButton} 
                  onClick={() => onGenerateReceipt?.(payment)}
                  title="Generate Receipt"
                >
                  <Download size={18} />
                </button>
                <button 
                  className={styles.iconButton} 
                  onClick={() => onEdit?.(payment)}
                  title="Edit Payment"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  className={`${styles.iconButton} ${styles.danger}`} 
                  onClick={() => onDelete?.(payment)}
                  title="Delete Payment"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className="text-muted">Tenant:</span>
                <span className={styles.bold}>{tenantName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className="text-muted">Unit:</span>
                <span>{unitNumber}</span>
              </div>
              <div className={styles.detailRow}>
                <span className="text-muted">Method:</span>
                <span>{payment.payment_method}</span>
              </div>
              <div className={styles.detailRow}>
                <Calendar size={16} className="text-muted" />
                <span className="text-muted">{dateStr}</span>
              </div>
              {payment.balance > 0 && (
                <div className={styles.detailRow} style={{ color: 'var(--color-danger)', fontWeight: 500 }}>
                  <span>Balance:</span>
                  <span>KES {payment.balance.toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
