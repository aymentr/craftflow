import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(2),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  unit_price: z.coerce.number().int().min(0),
  vat_rate: z.coerce.number().min(0).max(1),
});

export const invoiceSchema = z.object({
  customer_id: z.string().uuid(),
  job_id: z.string().uuid().optional(),
  issue_date: z.string(),
  due_date: z.string(),
  items: z.array(invoiceItemSchema).min(1),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
