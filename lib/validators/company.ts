import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(2, "Firmenname fehlt"),
  owner_name: z.string().min(2, "Inhaber fehlt"),
  street: z.string().min(3, "Straße fehlt"),
  postal_code: z.string().min(4, "PLZ fehlt"),
  city: z.string().min(2, "Ort fehlt"),
  country: z.string().default("Deutschland"),
  tax_number: z.string().min(3, "Steuernummer fehlt"),
  vat_id: z.string().optional(),
  default_vat_rate: z.coerce.number().min(0).max(1),
  iban: z.string().min(12, "IBAN fehlt"),
  payment_terms_days: z.coerce.number().int().min(0).max(90),
  logo_url: z.string().url().optional().or(z.literal("")),
});

export type CompanyInput = z.infer<typeof companySchema>;
