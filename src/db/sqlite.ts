import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import type { CapacitorSQLitePlugin } from "@capacitor-community/sqlite";;
import { Capacitor } from '@capacitor/core';
import { databaseSchema } from './schema';

export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: any = null;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite as CapacitorSQLitePlugin);
  }

  async initializeDatabase() {
    try {
      if (Capacitor.getPlatform() === 'web') {
        const jeepSqlite = document.createElement('jeep-sqlite');
        document.body.appendChild(jeepSqlite);
        await customElements.whenDefined('jeep-sqlite');
        await this.sqlite.initWebStore();
      }

      const ret = await this.sqlite.checkConnectionsConsistency();
      const isConn = (await this.sqlite.isConnection('rental_db', false)).result;

      if (ret.result && isConn) {
        this.db = await this.sqlite.retrieveConnection('rental_db', false);
      } else {
        this.db = await this.sqlite.createConnection('rental_db', false, 'no-encryption', 1, false);
      }

      await this.db.open();
      
      // Execute the schema initialization
      await this.db.execute(databaseSchema);

      if (Capacitor.getPlatform() === 'web') {
        await this.sqlite.saveToStore('rental_db');
      }

      console.log('Database initialized successfully');
      return true;
    } catch (err) {
      console.error('Error initializing database:', err);
      return false;
    }
  }

  getDb() {
    return this.db;
  }
}

export const dbService = new DatabaseService();
