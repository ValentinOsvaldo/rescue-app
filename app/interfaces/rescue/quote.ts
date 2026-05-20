export interface RescueQuoteServiceCreateBody {
  service: number;
  quantity: number;
  real_cost: string;
  pre_total: string;
  percenaje_apply?: string;
  amount_applied?: string;
  amount_rounded?: string;
  total: string;
}

export interface RescueQuoteCreateBody {
  rescue: number;
  technical_cost: string;
  sub_total: string;
  total: string;
  comissions_apply?: string;
  /** IVA percent: 8 or 16 */
  iva?: number;
  services: RescueQuoteServiceCreateBody[];
}

export interface RescueQuoteCreateResponse {
  id: number;
}
