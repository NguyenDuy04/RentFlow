export type RoomStatus = "available" | "occupied" | "maintenance";
export type TenantStatus = "active" | "ended";
export type BillStatus = "unpaid" | "paid";
export type PaymentMethod = "cash" | "bank_transfer";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string;
}

export interface Room {
  id: string;
  room_code: string;
  name: string;
  floor: string | null;
  area: number | null;
  rent_price: number;
  deposit_required: number;
  max_occupants: number;
  status: RoomStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  national_id: string;
  address: string | null;
  room_id: string | null;
  lease_start_date: string;
  lease_end_date: string | null;
  deposit_amount: number;
  status: TenantStatus;
  created_at: string;
  updated_at: string;
}

export interface MeterReading {
  id: string;
  room_id: string;
  month: string;
  electricity_old: number;
  electricity_new: number;
  water_old: number;
  water_new: number;
  electricity_consumption: number;
  water_consumption: number;
  created_at: string;
}

export interface PricingConfig {
  id: string;
  electricity_price: number;
  water_price: number;
  internet_fee: number;
  parking_fee: number;
  cleaning_fee: number;
  other_fee: number;
  updated_at: string;
}

export interface Bill {
  id: string;
  bill_code: string;
  month: string;
  room_id: string;
  tenant_id: string | null;
  room_rent: number;
  electricity_consumption: number;
  electricity_amount: number;
  water_consumption: number;
  water_amount: number;
  internet_fee: number;
  parking_fee: number;
  cleaning_fee: number;
  other_fee: number;
  total_amount: number;
  status: BillStatus;
  is_overdue: boolean;
  due_date: string;
  created_at: string;
}

export interface Payment {
  id: string;
  bill_id: string;
  amount: number;
  method: PaymentMethod;
  payment_date: string;
  transaction_code: string | null;
  created_at: string;
}

export interface DashboardOverview {
  total_rooms: number;
  occupied_rooms: number;
  vacant_rooms: number;
  maintenance_rooms: number;
  occupancy_rate: number;
  current_month_revenue: number;
  unpaid_bills_count: number;
}

export interface DashboardAlerts {
  overdue_bills: (Bill & { _id: string })[];
  expiring_contracts: (Tenant & { _id: string })[];
  maintenance_rooms: (Room & { _id: string })[];
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface RecentActivity {
  type: "new_tenant" | "new_payment" | "new_bill";
  description: string;
  timestamp: string;
}
