export interface Tenant {
  id: string;
  full_name: string;
  national_id: string;
  phone_number: string;
  emergency_contact: string;
  next_of_kin: string;
  occupation: string;
  status: 'Active' | 'Inactive';
  created_at: number;
}

export type CreateTenantInput = Omit<Tenant, 'id' | 'created_at'>;

export interface TenantAllocation {
  id: string;
  tenant_id: string;
  unit_id: string;
  move_in_date: number;
  move_out_date: number | null;
  deposit_paid: number;
  status: 'Active' | 'Vacated';
  notes: string;
  created_at: number;
}

export type CreateTenantAllocationInput = Omit<TenantAllocation, 'id' | 'created_at'>;
