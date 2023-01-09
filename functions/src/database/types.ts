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

export interface CourierReport {
  courier_id: number;
  name: string;
  route_id: number;
  warehouse_id: number;
  prvni_prihlaseni_kuryra_dnes: string;
  cas_prihlaseni_do_fronty: string;
  cas_prirazeni_routy: string;
  skutecny_odjezd_ze_skladu: string;
  posledni_dorucena_objednavka_v_route: string;
}

export interface Report {
  created: number;
  data: CourierReport[];
}
