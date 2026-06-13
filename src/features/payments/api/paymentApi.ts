import { dbService } from '../../../db/sqlite';
import type {  Payment, CreatePaymentInput  } from "../types";
import { v4 as uuidv4 } from 'uuid';

export const paymentApi = {
  async getPayments(tenantId?: string): Promise<Payment[]> {
    const db = dbService.getDb();
    if (!db) return [];
    try {
      let res;
      if (tenantId) {
        res = await db.query('SELECT * FROM payments WHERE tenant_id = ? ORDER BY payment_date DESC', [tenantId]);
      } else {
        res = await db.query('SELECT * FROM payments ORDER BY payment_date DESC');
      }
      return res.values || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  },

  async addPayment(data: CreatePaymentInput): Promise<Payment | null> {
    const db = dbService.getDb();
    if (!db) return null;
    const id = uuidv4();
    const now = Date.now();
    const query = 'INSERT INTO payments (id, tenant_id, unit_id, payment_type, amount_paid, balance, payment_method, payment_date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [id, data.tenant_id, data.unit_id, data.payment_type, data.amount_paid, data.balance, data.payment_method, data.payment_date, data.notes || '', now];
    try {
      await db.run(query, values);
      return { id, ...data, created_at: now };
    } catch (error) {
      console.error('Error adding payment:', error);
      return null;
    }
  },

  async updatePayment(id: string, data: Partial<CreatePaymentInput>): Promise<Payment | null> {
    const db = dbService.getDb();
    if (!db) return null;
    const query = 'UPDATE payments SET tenant_id = ?, unit_id = ?, payment_type = ?, amount_paid = ?, balance = ?, payment_method = ?, payment_date = ?, notes = ? WHERE id = ?';
    const values = [data.tenant_id, data.unit_id, data.payment_type, data.amount_paid, data.balance, data.payment_method, data.payment_date, data.notes || '', id];
    try {
      await db.run(query, values);
      const updated = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
      return updated.values?.[0] || null;
    } catch (error) {
      console.error('Error updating payment:', error);
      return null;
    }
  },

  async deletePayment(id: string): Promise<boolean> {
    const db = dbService.getDb();
    if (!db) return false;
    try {
      await db.run('DELETE FROM payments WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      return false;
    }
  }
};
