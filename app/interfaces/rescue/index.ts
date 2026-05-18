export type RescueServiceType =
  | 'rescue'
  | 'loan'
  | 'proyect'
  | 'direct_budget';

export type RescueSupplierSort = 'distance' | 'ranking' | 'name';

export interface RescueSupplierNearbyRow {
  id: number;
  name: string;
  phone: string;
  is_trusted: boolean;
  score: number;
  /** Alias of score for templates */
  ranking: number;
  distance_km: number | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
}

export interface SupplierMapPin {
  lat: number;
  lng: number;
  name: string;
}

export interface RescueCreateBody {
  service_type: RescueServiceType;
  client: number;
  general_public: boolean;
  serial_number?: string;
  service_description: string;
  supplier: number | null;
  manager?: number | null;
  location_latitude: string;
  location_longitude: string;
  location_description: string;
  internal_notes: string;
}

export interface RescueCreateResponse {
  id: number;
  folio: string;
}
