export type SupplierServiceType =
  | 'cranes'
  | 'mechanics'
  | 'road_assist'
  | 'forklifts'
  | 'flatbed'
  | 'transport'
  | 'other';

export interface Supplier {
  id: number;
  name: string;
  service_type: SupplierServiceType;
  phone: string;
  is_trusted: boolean;
  is_active: boolean;
}

export interface SupplierCreateBody {
  name: string;
  description: string;
  phone: string;
  email: string;
  service_type: SupplierServiceType;
  is_trusted: boolean;
  notes: string;
  latitude: string;
  longitude: string;
}
