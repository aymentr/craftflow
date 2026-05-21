import { z } from "zod";

export const jobSchema = z.object({
  customer_id: z.string().uuid("Kunde fehlt"),
  title: z.string().min(2, "Titel fehlt"),
  description: z.string().min(3, "Beschreibung fehlt"),
  location: z.string().min(3, "Einsatzort fehlt"),
  labor_hours: z.coerce.number().min(0),
  status: z.enum(["draft", "active", "completed", "invoiced"]).default("draft"),
  internal_notes: z.string().optional(),
});

export type JobInput = z.infer<typeof jobSchema>;
