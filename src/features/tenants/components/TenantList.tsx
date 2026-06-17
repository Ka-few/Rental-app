import React from 'react';
import type { Tenant, TenantAllocation } from '../types';
import type { Unit } from '../../units/types';
import { Card } from '../../../components/Card';
import { Users, Phone, FileText, Pencil, Trash2, Home } from 'lucide-react';
import styles from './TenantList.module.css';

interface TenantListProps {
  tenants: Tenant[];
  allocations?: TenantAllocation[];
  units?: Unit[];
  onEdit?: (tenant: Tenant) => void;
  onDelete?: (tenant: Tenant) => void;
  onMoveOut?: (tenant: Tenant, allocation: TenantAllocation) => void;
}

export const TenantList: React.FC<TenantListProps> = ({
  tenants,
  allocations = [],
  units = [],
  onEdit,
  onDelete,
  onMoveOut,
}) => {
  if (tenants.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Users size={48} className={styles.emptyIcon} />
        <p>No tenants registered.</p>
        <p className="text-muted">Register a tenant to get started.</p>
      </div>
    );
  }

  /** Find the active allocation for a given tenant */
  const getActiveAllocation = (tenantId: string) =>
    allocations.find((a) => a.tenant_id === tenantId && a.status === 'Active');

  /** Find a unit by id */
  const getUnit = (unitId: string) => units.find((u) => u.id === unitId);

  return (
    <div className={styles.grid}>
      {tenants.map((tenant) => {
        const allocation = getActiveAllocation(tenant.id);
        const unit = allocation ? getUnit(allocation.unit_id) : undefined;

        return (
          <Card key={tenant.id} className={styles.tenantCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTitle}>
                <h4 className={styles.tenantName}>{tenant.full_name}</h4>
                <span className={`${styles.statusBadge} ${tenant.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                  {tenant.status || 'Active'}
                </span>
              </div>
              <div className={styles.actions}>
                {tenant.status !== 'Inactive' && allocation && (
                  <button
                    className={`${styles.iconButton} ${styles.warning}`}
                    onClick={() => onMoveOut?.(tenant, allocation)}
                    title="Move Out Tenant"
                  >
                    Move Out
                  </button>
                )}
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

            {/* Allocated unit badge */}
            {unit ? (
              <div className={styles.unitBadge}>
                <Home size={14} />
                <span>Unit {unit.unit_number} — {unit.unit_type}</span>
                <span className={styles.unitRent}>KES {unit.monthly_rent.toLocaleString()}/mo</span>
              </div>
            ) : (
              <div className={`${styles.unitBadge} ${styles.unitBadgeVacant}`}>
                <Home size={14} />
                <span>No unit assigned</span>
              </div>
            )}

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
        );
      })}
    </div>
  );
};
