import { dbService } from '../../../db/sqlite';
import type {  Tenant, CreateTenantInput, TenantAllocation, CreateTenantAllocationInput  } from "../types";
import { v4 as uuidv4 } from 'uuid';

export const tenantApi = {
  async getTenants(): Promise<Tenant[]> {
    const db = dbService.getDb();
    if (!db) return [];
    try {
      const res = await db.query('SELECT * FROM tenants ORDER BY created_at DESC');
      return res.values || [];
    } catch (error) {
      console.error('Error fetching tenants:', error);
      return [];
    }
  },

  async addTenant(data: CreateTenantInput): Promise<Tenant | null> {
    const db = dbService.getDb();
    if (!db) return null;
    const id = uuidv4();
    const now = Date.now();
    const query = 'INSERT INTO tenants (id, full_name, national_id, phone_number, emergency_contact, next_of_kin, occupation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [id, data.full_name, data.national_id || '', data.phone_number, data.emergency_contact || '', data.next_of_kin || '', data.occupation || '', now];
    try {
      await db.run(query, values);
      return { id, ...data, created_at: now };
    } catch (error) {
      console.error('Error adding tenant:', error);
      return null;
    }
  },

  async allocateTenant(data: CreateTenantAllocationInput): Promise<TenantAllocation | null> {
    const db = dbService.getDb();
    if (!db) return null;
    const id = uuidv4();
    const now = Date.now();
    const query = 'INSERT INTO tenant_allocations (id, tenant_id, unit_id, move_in_date, move_out_date, deposit_paid, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [id, data.tenant_id, data.unit_id, data.move_in_date, data.move_out_date, data.deposit_paid, data.status, data.notes || '', now];
    try {
      await db.run(query, values);
      await db.run('UPDATE units SET status = ? WHERE id = ?', ['Occupied', data.unit_id]);
      return { id, ...data, created_at: now };
    } catch (error) {
      console.error('Error allocating tenant:', error);
      return null;
    }
  },

  async updateTenant(id: string, data: Partial<CreateTenantInput>): Promise<Tenant | null> {
    const db = dbService.getDb();
    if (!db) return null;
    const query = 'UPDATE tenants SET full_name = ?, national_id = ?, phone_number = ?, emergency_contact = ?, next_of_kin = ?, occupation = ? WHERE id = ?';
    const values = [data.full_name, data.national_id || '', data.phone_number, data.emergency_contact || '', data.next_of_kin || '', data.occupation || '', id];
    try {
      await db.run(query, values);
      const updated = await db.query('SELECT * FROM tenants WHERE id = ?', [id]);
      return updated.values?.[0] || null;
    } catch (error) {
      console.error('Error updating tenant:', error);
      return null;
    }
  },

  async deleteTenant(id: string): Promise<boolean> {
    const db = dbService.getDb();
    if (!db) return false;
    try {
      await db.run('DELETE FROM tenants WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting tenant:', error);
      return false;
    }
  }
};
