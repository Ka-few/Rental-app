import { dbService } from '../../../db/sqlite';
import type { Settings } from '../types';

const SETTINGS_ID = 'default_settings';

export const settingsApi = {
  async getSettings(): Promise<Settings | null> {
    const db = dbService.getDb();
    if (!db) return null;
    try {
      const res = await db.query('SELECT * FROM settings WHERE id = ?', [SETTINGS_ID]);
      if (res.values && res.values.length > 0) {
        return res.values[0] as Settings;
      }
      return null;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  },

  async updateSettings(data: Settings): Promise<Settings | null> {
    const db = dbService.getDb();
    if (!db) return null;
    try {
      const existing = await this.getSettings();
      if (existing) {
        await db.run(
          'UPDATE settings SET company_name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
          [data.company_name, data.phone, data.email, data.address, SETTINGS_ID]
        );
      } else {
        await db.run(
          'INSERT INTO settings (id, company_name, phone, email, address) VALUES (?, ?, ?, ?, ?)',
          [SETTINGS_ID, data.company_name, data.phone, data.email, data.address]
        );
      }
      return data;
    } catch (error) {
      console.error('Error saving settings:', error);
      return null;
    }
  }
};
