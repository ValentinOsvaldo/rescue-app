export interface Contract {
  id: number;
  client_id: number;
  notes: string;
  is_active: boolean;
}

export interface ContractItemCreateBody {
  service: number;
  price: string;
  price_multiplier?: string;
  percentaje?: string;
  notes?: string;
}

export interface ContractCreateBody {
  client: number;
  notes: string;
  items: ContractItemCreateBody[];
}
