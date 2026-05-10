export interface Service {
  id: number;
  name: string;
  unit: string;
  warranty: boolean;
  category_id: number;
  is_active: boolean;
}

export interface ServiceCreateBody {
  name: string;
  description: string;
  category: number;
  unit: string;
  warranty: boolean;
}
