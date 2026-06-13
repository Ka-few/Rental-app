import React from 'react';
import type {  Unit  } from "../types";
import { Card } from '../../../components/Card';
import { DoorOpen, Pencil, Trash2 } from 'lucide-react';
import styles from './UnitList.module.css';
import { useAppSelector } from '../../../store/hooks';

interface UnitListProps {
  units: Unit[];
  onEdit?: (unit: Unit) => void;
  onDelete?: (unit: Unit) => void;
}

export const UnitList: React.FC<UnitListProps> = ({ units, onEdit, onDelete }) => {
  const { properties } = useAppSelector(state => state.properties);

  if (units.length === 0) {
    return (
      <div className={styles.emptyState}>
        <DoorOpen size={48} className={styles.emptyIcon} />
        <p>No units found.</p>
        <p className="text-muted">Add units to your properties.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {units.map((unit) => {
        const propertyName = properties.find(p => p.id === unit.property_id)?.name || 'Unknown Property';

        return (
          <Card key={unit.id} className={styles.unitCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <h4 className={styles.unitNumber}>{unit.unit_number}</h4>
                <span className={`${styles.statusBadge} ${styles[unit.status.replace(' ', '')]}`}>
                  {unit.status}
                </span>
              </div>
              <div className={styles.actions}>
                <button 
                  className={styles.iconButton} 
                  onClick={() => onEdit?.(unit)}
                  title="Edit Unit"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  className={`${styles.iconButton} ${styles.danger}`} 
                  onClick={() => onDelete?.(unit)}
                  title="Delete Unit"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className="text-muted">Property:</span>
                <span className={styles.bold}>{propertyName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className="text-muted">Type:</span>
                <span>{unit.unit_type}</span>
              </div>
              <div className={styles.detailRow}>
                <span className="text-muted">Rent:</span>
                <span className={styles.amount}>KES {unit.monthly_rent.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
