import { dbService } from '../../../db/sqlite';
import type {  Unit, CreateUnitInput  } from "../types";
import { v4 as uuidv4 } from 'uuid';

export const unitApi = {
  async getUnits(propertyId?: string): Promise<Unit[]> {
    const db = dbService.getDb();
    if (!db) return [];
    try {
      let res;
      if (propertyId) {
        res = await db.query('SELECT * FROM units WHERE property_id = ? ORDER BY created_at DESC', [propertyId]);
      } else {
        res = await db.query('SELECT * FROM units ORDER BY created_at DESC');
      }
      return res.values || [];
    } catch (error) {
      console.error('Error fetching units:', error);
      return [];
    }
  },

  async addUnit(data: CreateUnitInput): Promise<Unit | null> {
    const db = dbService.getDb();
    if (!db) return null;
    const id = uuidv4();
    const now = Date.now();
    const query = 'INSERT INTO units (id, property_id, unit_number, unit_type, monthly_rent, water_charge, garbage_fee, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [id, data.property_id, data.unit_number, data.unit_type, data.monthly_rent, data.water_charge, data.garbage_fee, data.status, now];
    try {
      await db.run(query, values);
      return { id, ...data, created_at: now };
    } catch (error) {
      console.error('Error adding unit:', error);
      return null;
    }
  },

  async updateUnitStatus(id: string, status: string): Promise<boolean> {
    const db = dbService.getDb();
    if (!db) return false;
    try {
      await db.run('UPDATE units SET status = ? WHERE id = ?', [status, id]);
      return true;
    } catch (error) {
      console.error('Error updating unit status:', error);
      return false;
    }
  },

  async updateUnit(id: string, data: Partial<CreateUnitInput>): Promise<Unit | null> {
    const db = dbService.getDb();
    if (!db) return null;
    const query = 'UPDATE units SET property_id = ?, unit_number = ?, unit_type = ?, monthly_rent = ?, water_charge = ?, garbage_fee = ?, status = ? WHERE id = ?';
    const values = [data.property_id, data.unit_number, data.unit_type, data.monthly_rent, data.water_charge, data.garbage_fee, data.status, id];
    try {
      await db.run(query, values);
      const updated = await db.query('SELECT * FROM units WHERE id = ?', [id]);
      return updated.values?.[0] || null;
    } catch (error) {
      console.error('Error updating unit:', error);
      return null;
    }
  },

  async deleteUnit(id: string): Promise<boolean> {
    const db = dbService.getDb();
    if (!db) return false;
    try {
      await db.run('DELETE FROM units WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting unit:', error);
      return false;
    }
  }
};
