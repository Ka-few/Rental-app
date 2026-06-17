export const databaseSchema = `
  CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    property_type TEXT NOT NULL,
    location TEXT,
    description TEXT,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY NOT NULL,
    property_id TEXT NOT NULL,
    unit_number TEXT NOT NULL,
    unit_type TEXT NOT NULL,
    monthly_rent REAL NOT NULL,
    water_charge REAL NOT NULL,
    garbage_fee REAL NOT NULL,
    status TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY NOT NULL,
    full_name TEXT NOT NULL,
    national_id TEXT,
    phone_number TEXT NOT NULL,
    emergency_contact TEXT,
    next_of_kin TEXT,
    occupation TEXT,
    status TEXT DEFAULT 'Active',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tenant_allocations (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    unit_id TEXT NOT NULL,
    move_in_date INTEGER NOT NULL,
    move_out_date INTEGER,
    deposit_paid REAL NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE RESTRICT,
    FOREIGN KEY (unit_id) REFERENCES units (id) ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY NOT NULL,
    tenant_id TEXT NOT NULL,
    unit_id TEXT NOT NULL,
    payment_type TEXT NOT NULL,
    amount_paid REAL NOT NULL,
    balance REAL NOT NULL,
    payment_method TEXT NOT NULL,
    payment_date INTEGER NOT NULL,
    notes TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE RESTRICT,
    FOREIGN KEY (unit_id) REFERENCES units (id) ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date INTEGER NOT NULL,
    is_completed INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY NOT NULL,
    company_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT
  );
`;
