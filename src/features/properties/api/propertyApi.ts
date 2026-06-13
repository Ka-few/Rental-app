import { dbService } from '../../../db/sqlite';
import type {  Property, CreatePropertyInput  } from "../types";
import { v4 as uuidv4 } from 'uuid';

export const propertyApi = {
  async getProperties(): Promise<Property[]> {
    const db = dbService.getDb();
    if (!db) return [];
    try {
      const res = await db.query('SELECT * FROM properties ORDER BY created_at DESC');
      return res.values || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  },

  async addProperty(data: CreatePropertyInput): Promise<Property | null> {
    const db = dbService.getDb();
    if (!db) return null;
    const id = uuidv4();
    const now = Date.now();
    const query = 'INSERT INTO properties (id, name, property_type, location, description, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [id, data.name, data.property_type, data.location || '', data.description || '', data.notes || '', now, now];
    try {
      await db.run(query, values);
      return { id, ...data, created_at: now, updated_at: now };
    } catch (error) {
      console.error('Error adding property:', error);
      return null;
    }
  },

  async updateProperty(id: string, data: Partial<CreatePropertyInput>): Promise<Property | null> {
    const db = dbService.getDb();
    if (!db) return null;
    const now = Date.now();
    const query = 'UPDATE properties SET name = ?, property_type = ?, location = ?, description = ?, notes = ?, updated_at = ? WHERE id = ?';
    const values = [data.name, data.property_type, data.location || '', data.description || '', data.notes || '', now, id];
    try {
      await db.run(query, values);
      const updated = await db.query('SELECT * FROM properties WHERE id = ?', [id]);
      return updated.values?.[0] || null;
    } catch (error) {
      console.error('Error updating property:', error);
      return null;
    }
  },

  async deleteProperty(id: string): Promise<boolean> {
    const db = dbService.getDb();
    if (!db) return false;
    try {
      await db.run('DELETE FROM properties WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      return false;
    }
  }
};
