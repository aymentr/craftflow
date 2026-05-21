export type Customer = {
  id: string;
  company_id: string;
  name: string;
  business_name?: string | null;
  email: string;
  phone?: string | null;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  notes?: string | null;
  created_at: string;
};
