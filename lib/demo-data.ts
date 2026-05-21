import type { Company } from "@/types/company";
import type { Customer } from "@/types/customer";
import type { Invoice, InvoiceItem, Reminder } from "@/types/invoice";
import type { Job } from "@/types/job";

export const demoCompany: Company = {
  id: "11111111-1111-4111-8111-111111111111",
  owner_user_id: "22222222-2222-4222-8222-222222222222",
  name: "Müller Elektro",
  owner_name: "Jan Müller",
  street: "Handwerkerstraße 12",
  postal_code: "50667",
  city: "Köln",
  country: "Deutschland",
  tax_number: "215/123/45678",
  vat_id: "DE123456789",
  default_vat_rate: 0.19,
  iban: "DE89370400440532013000",
  payment_terms_days: 14,
  logo_url: null,
  created_at: "2026-05-01T08:00:00.000Z",
};

export const demoCustomers: Customer[] = [
  {
    id: "33333333-3333-4333-8333-333333333333",
    company_id: demoCompany.id,
    name: "Anna Schmidt",
    business_name: "Schmidt Immobilien GmbH",
    email: "anna.schmidt@example.de",
    phone: "+49 221 123456",
    street: "Rheinweg 8",
    postal_code: "50668",
    city: "Köln",
    country: "Deutschland",
    notes: "Bevorzugt Rechnungen per E-Mail.",
    created_at: "2026-05-12T09:00:00.000Z",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    company_id: demoCompany.id,
    name: "Lukas Becker",
    business_name: null,
    email: "lukas.becker@example.de",
    phone: "+49 221 555111",
    street: "Markt 3",
    postal_code: "50667",
    city: "Köln",
    country: "Deutschland",
    notes: null,
    created_at: "2026-05-13T10:00:00.000Z",
  },
];

export const demoJobs: Job[] = [
  {
    id: "55555555-5555-4555-8555-555555555555",
    company_id: demoCompany.id,
    customer_id: demoCustomers[0].id,
    title: "Deckenlampen installieren",
    description: "3 Deckenlampen montiert, 2 Schalter getauscht.",
    location: "Rheinweg 8, Köln",
    labor_hours: 2.5,
    status: "completed",
    internal_notes: "Material im Fahrzeug nachfüllen.",
    completed_at: "2026-05-18T15:30:00.000Z",
    created_at: "2026-05-18T08:00:00.000Z",
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    company_id: demoCompany.id,
    customer_id: demoCustomers[1].id,
    title: "Sicherung prüfen",
    description: "Fehlersuche in Unterverteilung.",
    location: "Markt 3, Köln",
    labor_hours: 1,
    status: "active",
    internal_notes: null,
    completed_at: null,
    created_at: "2026-05-19T07:45:00.000Z",
  },
];

export const demoInvoices: Invoice[] = [
  {
    id: "77777777-7777-4777-8777-777777777777",
    company_id: demoCompany.id,
    customer_id: demoCustomers[0].id,
    job_id: demoJobs[0].id,
    invoice_number: "2026-0001",
    status: "sent",
    issue_date: "2026-05-18",
    due_date: "2026-06-01",
    subtotal: 29500,
    vat_total: 5605,
    total: 35105,
    pdf_url: null,
    sent_at: "2026-05-18T16:00:00.000Z",
    paid_at: null,
    created_at: "2026-05-18T15:45:00.000Z",
  },
];

export const demoInvoiceItems: InvoiceItem[] = [
  {
    id: "88888888-8888-4888-8888-888888888888",
    invoice_id: demoInvoices[0].id,
    description: "Installation Deckenlampen",
    quantity: 3,
    unit: "Stk.",
    unit_price: 6500,
    vat_rate: 0.19,
    line_total: 19500,
    created_at: "2026-05-18T15:45:00.000Z",
  },
  {
    id: "99999999-9999-4999-8999-999999999999",
    invoice_id: demoInvoices[0].id,
    description: "Arbeitszeit",
    quantity: 2.5,
    unit: "Std.",
    unit_price: 4000,
    vat_rate: 0.19,
    line_total: 10000,
    created_at: "2026-05-18T15:45:00.000Z",
  },
];

export const demoReminders: Reminder[] = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    invoice_id: demoInvoices[0].id,
    reminder_number: 1,
    scheduled_for: "2026-06-02T08:00:00.000Z",
    sent_at: null,
    status: "scheduled",
    created_at: "2026-05-18T16:00:00.000Z",
  },
];

export function customerName(customerId: string) {
  const customer = demoCustomers.find((item) => item.id === customerId);
  return customer?.business_name || customer?.name || "Unbekannter Kunde";
}
