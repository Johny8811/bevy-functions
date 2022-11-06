export interface Overview {
  courier_id: number;
  orders_month: number;
  shifts_worked: number;
  shifts_planned: number;
  score_customer: number;
  delay: number;
  loading_time: string;
  tips: number;
  region_courier: number;
  region_car: number;
}

export interface Invoicing {
  courier_id: number;
  orders: number;
  tips: number;
  routes: number;
  exp_routes: number;
  shift_bonus: number;
  regions: number;
  delay: number;
  rating: number;
  driving: number;
  bonuses: number;
  penalties: number;
  manko: number;
  bottles: number;
  deducts: number;
  police: number;
  covid: number;
  invoicing: number;
  to_pay: number;
}

export interface BonusesPenalties {
  courier_id: number;
  assigned_at: string;
  category: string;
  item: string;
  note: string;
  amount: number;
}

export interface RohlikData {
  _id: string;
  overview: Overview;
  invoicing: Invoicing;
  bonusesPenalties: BonusesPenalties;
}

