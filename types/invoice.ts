export type InvoiceStatus = "draft" | "sent" | "overdue" | "paid" | "cancelled";
export type ReminderStatus = "scheduled" | "sent" | "failed" | "cancelled";

export type InvoiceItem = {
  id: string;
  company_id?: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
  line_total: number;
  sort_order?: number;
  created_at: string;
};

export type Invoice = {
  id: string;
  company_id: string;
  customer_id: string;
  job_id?: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  subtotal: number;
  vat_total: number;
  total: number;
  pdf_url?: string | null;
  sent_at?: string | null;
  paid_at?: string | null;
  cancelled_at?: string | null;
  created_at: string;
};

export type Reminder = {
  id: string;
  company_id?: string;
  invoice_id: string;
  reminder_number: number;
  scheduled_for: string;
  sent_at?: string | null;
  status: ReminderStatus;
  created_at: string;
};
