export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  unit_type: string;
  monthly_rent: number;
  water_charge: number;
  garbage_fee: number;
  status: 'Occupied' | 'Vacant' | 'Reserved' | 'Under Maintenance';
  created_at: number;
}

export type CreateUnitInput = Omit<Unit, 'id' | 'created_at'>;
