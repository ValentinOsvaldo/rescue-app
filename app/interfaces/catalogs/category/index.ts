export interface Category {
  id: number;
  catalogue_type: string;
  name: string;
  is_active: boolean;
}

export interface CategoryCreateBody {
  catalogue_type: 'service_category';
  name: string;
}

export interface CategoryUpdateBody {
  name: string;
}
