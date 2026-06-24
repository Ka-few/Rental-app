export interface Payment {
  id: string;
  tenant_id: string;
  unit_id: string;
  payment_type: string; // E.g. "Rent, Water"
  rent_amount: number;
  water_amount: number;
  garbage_amount: number;
  deposit_amount: number;
  other_amount: number;
  amount_paid: number;
  balance: number;
  payment_method: 'Cash' | 'M-Pesa' | 'Bank';
  payment_date: number;
  notes: string;
  created_at: number;
}

export type CreatePaymentInput = Omit<Payment, 'id' | 'created_at'>;
