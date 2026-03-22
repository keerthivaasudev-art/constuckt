import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type Profile = {
  id: string;
  organisation_id: string;
  full_name: string;
  role: string;
  created_at: string;
};

export type Client = {
  id: string;
  organisation_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstin?: string;
  category?: string;
  vendor_no?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  contact_person_1_name?: string;
  contact_person_1_designation?: string;
  contact_person_1_phone?: string;
  contact_person_1_email?: string;
  contact_person_2_name?: string;
  contact_person_2_designation?: string;
  contact_person_2_phone?: string;
  contact_person_2_email?: string;
  contact_person_3_name?: string;
  contact_person_3_designation?: string;
  contact_person_3_phone?: string;
  contact_person_3_email?: string;
  status?: string;
  created_at: string;
};

export type ProjectType = {
  id: string;
  organisation_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type ProjectStatus = 'Draft' | 'Active' | 'Execution Completed' | 'Financially Closed' | 'Closed';

export type Project = {
  id: string;
  organisation_id: string;
  client_id: string;
  name: string;
  status: ProjectStatus;
  project_type: string;
  po_value?: number;
  po_required: boolean;
  description: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

export type Communication = {
  id: string;
  organisation_id: string;
  client_id: string;
  project_id?: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  content: string;
  date: string;
  created_at: string;
};

export type ClientCall = {
  id: string;
  organisation_id: string;
  client_id: string;
  call_date: string;
  call_category: string;
  notes: string;
  received_by_staff_id: string;
  entered_by_staff_id: string;
  assigned_to_team_id: string;
  required_action: string;
  required_action_details?: string;
  created_at: string;
  updated_at: string;
};

export type SiteVisit = {
  id: string;
  organisation_id: string;
  project_id?: string;
  client_id?: string;
  visit_date: string;
  in_time?: string;
  out_time?: string;
  engineer?: string;
  visited_by?: string;
  purpose?: string;
  site_address?: string;
  location_url?: string;
  measurements?: string;
  discussion?: string;
  follow_up_date?: string;
  next_step?: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'postponed';
  postponed_reason?: string;
  photos?: string[];
  documents?: string[];
  notes?: string;
  created_by?: string;
  created_at: string;
};

export type Quotation = {
  id: string;
  organisation_id: string;
  client_id: string;
  quotation_no: string;
  date: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  created_at: string;
};

export type PurchaseOrder = {
  id: string;
  organisation_id: string;
  client_id: string;
  po_no: string;
  date: string;
  amount: number;
  status: 'pending' | 'received' | 'cancelled';
  created_at: string;
};

export type DeliveryChallan = {
  id: string;
  organisation_id: string;
  client_id: string;
  challan_no: string;
  date: string;
  status: 'shipped' | 'delivered';
  created_at: string;
};

export type Meeting = {
  id: string;
  organisation_id: string;
  client_id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
  created_at: string;
};

export type DiscountPriceList = {
  id: string;
  organisation_id: string;
  name: string;
  discount_percent: number;
  type: 'standard' | 'premium' | 'bulk' | 'special';
  created_at: string;
};

export type Material = {
  id: string;
  organisation_id: string;
  name: string; // item_name
  display_name?: string;
  item_code?: string;
  category?: string;
  sub_category?: string;
  size?: string;
  pressure_class?: string;
  schedule_type?: string;
  material?: string;
  end_connection?: string;
  unit: string;
  sale_price?: number;
  purchase_price?: number;
  gst_rate?: number;
  hsn_code?: string;
  track_inventory?: boolean;
  low_stock_level?: number;
  uses_variant?: boolean;
  tax_rate?: number;
  stock: number;
  status: 'active' | 'inactive';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  organisation_id: string;
  service_code?: string;
  service_name: string;
  description?: string;
  unit: string;
  sale_price?: number;
  purchase_price?: number;
  tax_rate?: number;
  hsn_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ItemCategory = {
  id: string;
  organisation_id: string;
  category_name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
};

export type ItemUnit = {
  id: string;
  organisation_id: string;
  unit_name: string;
  unit_code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
};

export type Organisation = {
  id: string;
  name: string;
  address?: string;
  additional_branch_address?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  tan?: string;
  msme_no?: string;
  website?: string;
  state?: string;
  logo_url?: string;
  signatures: any[];
  created_at: string;
  updated_at: string;
};

export type CompanyVariant = {
  id: string;
  organisation_id: string;
  company_id?: string;
  variant_name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ItemVariantPricing = {
  id: string;
  organisation_id: string;
  item_id: string;
  company_variant_id: string;
  make?: string;
  sale_price?: number;
  purchase_price?: number;
  tax_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Warehouse = {
  id: string;
  organisation_id: string;
  warehouse_code?: string;
  warehouse_name: string;
  location?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ItemStock = {
  id: string;
  organisation_id: string;
  item_id: string;
  company_variant_id?: string;
  warehouse_id?: string;
  current_stock: number;
  low_stock_level?: number;
  reorder_level?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
