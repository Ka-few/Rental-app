export interface Property {
  id: string;
  name: string;
  property_type: string;
  location: string;
  description: string;
  notes: string;
  created_at: number;
  updated_at: number;
}

export type CreatePropertyInput = Omit<Property, 'id' | 'created_at' | 'updated_at'>;
