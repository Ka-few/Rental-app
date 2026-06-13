import React from 'react';
import type {  Property  } from "../types";
import { Card } from '../../../components/Card';
import { Building, MapPin, Pencil, Trash2 } from 'lucide-react';
import styles from './PropertyList.module.css';

interface PropertyListProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({ properties, onPropertyClick, onEdit, onDelete }) => {
  if (properties.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Building size={48} className={styles.emptyIcon} />
        <p>No properties found.</p>
        <p className="text-muted">Add your first property to get started.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {properties.map((property) => (
        <Card 
          key={property.id} 
          onClick={() => onPropertyClick?.(property)}
          className={styles.propertyCard}
        >
          <div className={styles.cardHeader}>
            <div>
              <h4 className={styles.propertyName}>{property.name}</h4>
              <span className={styles.badge}>{property.property_type}</span>
            </div>
            <div className={styles.actions}>
              <button 
                className={styles.iconButton} 
                onClick={(e) => { e.stopPropagation(); onEdit?.(property); }}
                title="Edit Property"
              >
                <Pencil size={18} />
              </button>
              <button 
                className={`${styles.iconButton} ${styles.danger}`} 
                onClick={(e) => { e.stopPropagation(); onDelete?.(property); }}
                title="Delete Property"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          
          {property.location && (
            <div className={styles.location}>
              <MapPin size={16} />
              <span>{property.location}</span>
            </div>
          )}
          
          {property.description && (
            <p className={styles.description}>{property.description}</p>
          )}
        </Card>
      ))}
    </div>
  );
};
