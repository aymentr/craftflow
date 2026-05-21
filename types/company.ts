export type Company = {
  id: string;
  owner_user_id: string;
  name: string;
  owner_name: string;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  tax_number: string;
  vat_id?: string | null;
  default_vat_rate: number;
  iban: string;
  payment_terms_days: number;
  logo_url?: string | null;
  created_at: string;
};
