export interface Payment {
  id: string;
  tenant_id: string;
  unit_id: string;
  payment_type: 'Rent' | 'Water' | 'Garbage' | 'Deposit' | 'Other';
  amount_paid: number;
  balance: number;
  payment_method: 'Cash' | 'M-Pesa' | 'Bank';
  payment_date: number;
  notes: string;
  created_at: number;
}

export type CreatePaymentInput = Omit<Payment, 'id' | 'created_at'>;
