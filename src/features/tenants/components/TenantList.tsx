import React from 'react';
import type {  Tenant  } from "../types";
import { Card } from '../../../components/Card';
import { Users, Phone, FileText, Pencil, Trash2 } from 'lucide-react';
import styles from './TenantList.module.css';

interface TenantListProps {
  tenants: Tenant[];
  onEdit?: (tenant: Tenant) => void;
  onDelete?: (tenant: Tenant) => void;
}

export const TenantList: React.FC<TenantListProps> = ({ tenants, onEdit, onDelete }) => {
  if (tenants.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Users size={48} className={styles.emptyIcon} />
        <p>No tenants registered.</p>
        <p className="text-muted">Register a tenant to get started.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {tenants.map((tenant) => (
        <Card key={tenant.id} className={styles.tenantCard}>
          <div className={styles.cardHeader}>
            <h4 className={styles.tenantName}>{tenant.full_name}</h4>
            <div className={styles.actions}>
              <button 
                className={styles.iconButton} 
                onClick={() => onEdit?.(tenant)}
                title="Edit Tenant"
              >
                <Pencil size={18} />
              </button>
              <button 
                className={`${styles.iconButton} ${styles.danger}`} 
                onClick={() => onDelete?.(tenant)}
                title="Delete Tenant"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          
          <div className={styles.details}>
            <div className={styles.detailRow}>
              <Phone size={16} className="text-muted" />
              <span>{tenant.phone_number}</span>
            </div>
            
            {tenant.national_id && (
              <div className={styles.detailRow}>
                <FileText size={16} className="text-muted" />
                <span>ID: {tenant.national_id}</span>
              </div>
            )}
            
            {tenant.occupation && (
              <div className={styles.detailRow}>
                <span className="text-muted">Occupation:</span>
                <span>{tenant.occupation}</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
