export type ServiceUnit = 'service' | 'hour' | 'piece' | 'km' | 'day' | 'other';

export interface Service {
  id: number;
  name: string;
  unit: ServiceUnit;
  warranty: boolean;
  category_id: number;
  is_active: boolean;
}

export interface ServiceCreateBody {
  name: string;
  description: string;
  category: number;
  unit: ServiceUnit;
  warranty: boolean;
}
