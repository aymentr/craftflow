import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Name fehlt"),
  business_name: z.string().optional(),
  email: z.string().email("E-Mail ist ungültig"),
  phone: z.string().optional(),
  street: z.string().min(3, "Straße fehlt"),
  postal_code: z.string().min(4, "PLZ fehlt"),
  city: z.string().min(2, "Ort fehlt"),
  country: z.string().default("Deutschland"),
  notes: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
