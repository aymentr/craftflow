import { createClient } from "@/lib/supabase/server";
import { demoCompany, demoCustomers, demoInvoiceItems, demoInvoices, demoJobs, demoReminders } from "@/lib/demo-data";
import type { Company } from "@/types/company";
import type { Customer } from "@/types/customer";
import type { Invoice, InvoiceItem, Reminder } from "@/types/invoice";
import type { Job } from "@/types/job";

export type JobWithCustomer = Job & {
  customers?: Pick<Customer, "name" | "business_name"> | null;
};

export type InvoiceWithCustomer = Invoice & {
  customers?: Pick<Customer, "name" | "business_name"> | null;
};

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getCurrentCompany(): Promise<Company | null> {
  if (!hasSupabaseEnv()) {
    return demoCompany;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getCustomers(): Promise<Customer[]> {
  if (!hasSupabaseEnv()) {
    return demoCustomers;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
  if (error) {
    throw new Error(`Customers could not be loaded: ${error.message}`);
  }
  return data ?? [];
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  if (!hasSupabaseEnv()) {
    return demoCustomers.find((customer) => customer.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function getJobs(): Promise<JobWithCustomer[]> {
  if (!hasSupabaseEnv()) {
    return demoJobs.map((job) => ({
      ...job,
      customers: demoCustomers.find((customer) => customer.id === job.customer_id) ?? null,
    }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("*, customers(name, business_name)")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getJobById(id: string): Promise<JobWithCustomer | null> {
  if (!hasSupabaseEnv()) {
    const job = demoJobs.find((item) => item.id === id);
    if (!job) return null;
    return {
      ...job,
      customers: demoCustomers.find((customer) => customer.id === job.customer_id) ?? null,
    };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("*, customers(name, business_name)")
    .eq("id", id)
    .maybeSingle();

  return data;
}

export async function getInvoices(): Promise<InvoiceWithCustomer[]> {
  if (!hasSupabaseEnv()) {
    return demoInvoices.map((invoice) => ({
      ...invoice,
      customers: demoCustomers.find((customer) => customer.id === invoice.customer_id) ?? null,
    }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("*, customers(name, business_name)")
    .order("issue_date", { ascending: false });

  return data ?? [];
}

export async function getCustomerBundle(id: string) {
  if (!hasSupabaseEnv()) {
    const customer = demoCustomers.find((item) => item.id === id) ?? null;
    return {
      customer,
      jobs: demoJobs.filter((job) => job.customer_id === id),
      invoices: demoInvoices.filter((invoice) => invoice.customer_id === id),
    };
  }

  const supabase = await createClient();
  const [{ data: customer }, { data: jobs }, { data: invoices }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).maybeSingle(),
    supabase.from("jobs").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").eq("customer_id", id).order("issue_date", { ascending: false }),
  ]);

  return { customer, jobs: jobs ?? [], invoices: invoices ?? [] };
}

export async function getInvoiceBundle(id: string): Promise<{
  company: Company | null;
  customer: Customer | null;
  invoice: Invoice | null;
  items: InvoiceItem[];
  reminders: Reminder[];
}> {
  if (!hasSupabaseEnv()) {
    const invoice = demoInvoices.find((item) => item.id === id) ?? null;
    return {
      company: demoCompany,
      customer: invoice ? demoCustomers.find((item) => item.id === invoice.customer_id) ?? null : null,
      invoice,
      items: demoInvoiceItems.filter((item) => item.invoice_id === id),
      reminders: demoReminders.filter((item) => item.invoice_id === id),
    };
  }

  const supabase = await createClient();
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();

  if (!invoice) {
    return { company: null, customer: null, invoice: null, items: [], reminders: [] };
  }

  const [{ data: company }, { data: customer }, { data: items }, { data: reminders }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", invoice.company_id).maybeSingle(),
    supabase.from("customers").select("*").eq("id", invoice.customer_id).maybeSingle(),
    supabase.from("invoice_items").select("*").eq("invoice_id", invoice.id).order("sort_order"),
    supabase.from("reminders").select("*").eq("invoice_id", invoice.id).order("reminder_number"),
  ]);

  return {
    company,
    customer,
    invoice,
    items: items ?? [],
    reminders: reminders ?? [],
  };
}

export function customerDisplayName(customer?: Pick<Customer, "name" | "business_name"> | null) {
  return customer?.business_name || customer?.name || "Unbekannter Kunde";
}
