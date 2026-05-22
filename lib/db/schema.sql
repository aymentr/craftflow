-- CraftFlow Supabase PostgreSQL schema
-- Fresh-project schema for mobile job capture, invoices, PDFs, email status,
-- reminders, and future structured German e-invoice exports.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.job_status as enum ('draft', 'active', 'completed', 'invoiced');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.invoice_status as enum ('draft', 'sent', 'overdue', 'paid', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.reminder_status as enum ('scheduled', 'sent', 'failed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.activity_entity_type as enum ('company', 'customer', 'job', 'job_photo', 'invoice', 'invoice_item', 'reminder');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.activity_action as enum ('created', 'updated', 'deleted', 'completed', 'invoiced', 'sent', 'paid', 'cancelled', 'reminder_scheduled', 'reminder_sent', 'reminder_failed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  owner_name text not null,
  street text not null,
  postal_code text not null,
  city text not null,
  country text not null default 'Deutschland',
  tax_number text not null,
  vat_id text,
  default_vat_rate numeric(5,4) not null default 0.19,
  iban text not null,
  payment_terms_days integer not null default 14,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_default_vat_rate_check check (default_vat_rate >= 0 and default_vat_rate <= 1),
  constraint companies_payment_terms_days_check check (payment_terms_days >= 0 and payment_terms_days <= 90)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  business_name text,
  email text not null,
  phone text,
  street text not null,
  postal_code text not null,
  city text not null,
  country text not null default 'Deutschland',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, company_id)
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null,
  title text not null,
  description text not null,
  location text not null,
  labor_hours numeric(10,2) not null default 0,
  status public.job_status not null default 'draft',
  internal_notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, company_id),
  constraint jobs_customer_company_fk foreign key (customer_id, company_id)
    references public.customers(id, company_id) on delete restrict,
  constraint jobs_labor_hours_check check (labor_hours >= 0),
  constraint jobs_completed_at_check check (
    (status in ('completed', 'invoiced') and completed_at is not null)
    or (status in ('draft', 'active') and completed_at is null)
  )
);

create table if not exists public.job_photos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  job_id uuid not null,
  file_url text not null,
  storage_bucket text,
  storage_path text,
  created_at timestamptz not null default now(),
  unique (id, company_id),
  constraint job_photos_job_company_fk foreign key (job_id, company_id)
    references public.jobs(id, company_id) on delete cascade
);

-- One row per company and invoice year. The trigger below locks this row while
-- assigning invoice numbers, giving sequential YYYY-0001 numbers per company.
create table if not exists public.invoice_sequences (
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_year integer not null,
  last_number integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (company_id, invoice_year),
  constraint invoice_sequences_year_check check (invoice_year between 2000 and 2100),
  constraint invoice_sequences_last_number_check check (last_number >= 0)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null,
  job_id uuid,
  invoice_number text,
  status public.invoice_status not null default 'draft',
  issue_date date not null default current_date,
  due_date date not null,

  -- Snapshots keep sent invoices stable even if company/customer records change.
  seller_snapshot jsonb not null default '{}'::jsonb,
  buyer_snapshot jsonb not null default '{}'::jsonb,
  currency text not null default 'EUR',
  payment_terms_days integer not null default 14,

  subtotal integer not null default 0,
  vat_total integer not null default 0,
  total integer not null default 0,

  pdf_url text,
  sent_at timestamptz,
  paid_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, company_id),
  unique (company_id, invoice_number),
  constraint invoices_customer_company_fk foreign key (customer_id, company_id)
    references public.customers(id, company_id) on delete restrict,
  constraint invoices_job_company_fk foreign key (job_id, company_id)
    references public.jobs(id, company_id) on delete restrict,
  constraint invoices_due_date_check check (due_date >= issue_date),
  constraint invoices_money_check check (subtotal >= 0 and vat_total >= 0 and total >= 0),
  constraint invoices_currency_check check (currency = upper(currency) and length(currency) = 3),
  constraint invoices_payment_terms_days_check check (payment_terms_days >= 0 and payment_terms_days <= 90),
  constraint invoices_status_timestamp_check check (
    (status = 'sent' and sent_at is not null and paid_at is null and cancelled_at is null)
    or (status = 'paid' and paid_at is not null and cancelled_at is null)
    or (status = 'cancelled' and cancelled_at is not null)
    or (status in ('draft', 'overdue'))
  )
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_id uuid not null,
  description text not null,
  quantity numeric(12,2) not null,
  unit text not null,
  unit_price integer not null,
  vat_rate numeric(5,4) not null,
  line_total integer not null default 0,

  -- Clean data shape for future XRechnung/ZUGFeRD mapping.
  tax_category text not null default 'S',
  product_code text,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, company_id),
  constraint invoice_items_invoice_company_fk foreign key (invoice_id, company_id)
    references public.invoices(id, company_id) on delete cascade,
  constraint invoice_items_quantity_check check (quantity > 0),
  constraint invoice_items_unit_price_check check (unit_price >= 0),
  constraint invoice_items_vat_rate_check check (vat_rate >= 0 and vat_rate <= 1),
  constraint invoice_items_line_total_check check (line_total >= 0)
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_id uuid not null,
  reminder_number integer not null,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status public.reminder_status not null default 'scheduled',
  email_subject text,
  email_provider_id text,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, company_id),
  unique (invoice_id, reminder_number),
  constraint reminders_invoice_company_fk foreign key (invoice_id, company_id)
    references public.invoices(id, company_id) on delete cascade,
  constraint reminders_reminder_number_check check (reminder_number > 0),
  constraint reminders_status_timestamp_check check (
    (status = 'sent' and sent_at is not null)
    or (status <> 'sent')
  )
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  entity_type public.activity_entity_type not null,
  entity_id uuid not null,
  action public.activity_action not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists companies_owner_user_id_idx on public.companies(owner_user_id);

create index if not exists customers_company_id_created_at_idx on public.customers(company_id, created_at desc);
create index if not exists customers_company_id_email_idx on public.customers(company_id, lower(email));
create index if not exists customers_company_id_name_idx on public.customers(company_id, lower(coalesce(business_name, name)));

create index if not exists jobs_company_id_status_created_at_idx on public.jobs(company_id, status, created_at desc);
create index if not exists jobs_company_id_customer_id_idx on public.jobs(company_id, customer_id);
create index if not exists jobs_company_id_completed_at_idx on public.jobs(company_id, completed_at desc) where completed_at is not null;

create index if not exists job_photos_company_id_job_id_idx on public.job_photos(company_id, job_id);

create index if not exists invoices_company_id_status_due_date_idx on public.invoices(company_id, status, due_date);
create index if not exists invoices_company_id_customer_id_idx on public.invoices(company_id, customer_id);
create index if not exists invoices_company_id_job_id_idx on public.invoices(company_id, job_id) where job_id is not null;
create index if not exists invoices_company_id_issue_date_idx on public.invoices(company_id, issue_date desc);
create index if not exists invoices_overdue_lookup_idx on public.invoices(company_id, due_date)
  where status in ('sent', 'overdue');

create index if not exists invoice_items_company_id_invoice_id_sort_order_idx on public.invoice_items(company_id, invoice_id, sort_order, created_at);

create index if not exists reminders_company_id_status_scheduled_for_idx on public.reminders(company_id, status, scheduled_for);
create index if not exists reminders_company_id_invoice_id_idx on public.reminders(company_id, invoice_id);

create index if not exists activity_logs_company_id_created_at_idx on public.activity_logs(company_id, created_at desc);
create index if not exists activity_logs_entity_idx on public.activity_logs(company_id, entity_type, entity_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.company_is_owned(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.companies
    where id = target_company_id
      and owner_user_id = auth.uid()
  );
$$;

create or replace function public.set_invoice_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_year integer;
  next_number integer;
begin
  if new.invoice_number is not null and btrim(new.invoice_number) <> '' then
    return new;
  end if;

  target_year := extract(year from new.issue_date)::integer;

  insert into public.invoice_sequences (company_id, invoice_year, last_number)
  values (new.company_id, target_year, 0)
  on conflict (company_id, invoice_year) do nothing;

  update public.invoice_sequences
  set last_number = last_number + 1,
      updated_at = now()
  where company_id = new.company_id
    and invoice_year = target_year
  returning last_number into next_number;

  new.invoice_number := target_year::text || '-' || lpad(next_number::text, 4, '0');
  return new;
end;
$$;

create or replace function public.set_invoice_item_line_total()
returns trigger
language plpgsql
as $$
begin
  new.line_total := round(new.quantity * new.unit_price)::integer;
  return new;
end;
$$;

create or replace function public.recalculate_invoice_totals(target_invoice_id uuid, target_company_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  next_subtotal integer;
  next_vat_total integer;
begin
  select
    coalesce(sum(line_total), 0)::integer,
    coalesce(sum(round(line_total * vat_rate)), 0)::integer
  into next_subtotal, next_vat_total
  from public.invoice_items
  where invoice_id = target_invoice_id
    and company_id = target_company_id;

  update public.invoices
  set subtotal = next_subtotal,
      vat_total = next_vat_total,
      total = next_subtotal + next_vat_total,
      updated_at = now()
  where id = target_invoice_id
    and company_id = target_company_id;
end;
$$;

create or replace function public.recalculate_invoice_totals_trigger()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_invoice_totals(old.invoice_id, old.company_id);
    return old;
  end if;

  perform public.recalculate_invoice_totals(new.invoice_id, new.company_id);
  return new;
end;
$$;

create or replace function public.set_due_date_from_company_terms()
returns trigger
language plpgsql
as $$
declare
  terms integer;
begin
  select payment_terms_days into terms
  from public.companies
  where id = new.company_id;

  new.payment_terms_days := coalesce(new.payment_terms_days, terms, 14);

  if new.due_date is null then
    new.due_date := new.issue_date + new.payment_terms_days;
  end if;

  return new;
end;
$$;

create or replace function public.log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_company_id uuid;
  target_entity_id uuid;
  target_entity_type public.activity_entity_type;
  target_action public.activity_action;
  meta jsonb := '{}'::jsonb;
begin
  if tg_table_name = 'activity_logs' then
    return coalesce(new, old);
  end if;

  if tg_table_name = 'companies' then
    target_company_id := coalesce(new.id, old.id);
  else
    target_company_id := coalesce(new.company_id, old.company_id);
  end if;

  target_entity_id := coalesce(new.id, old.id);
  target_entity_type := case tg_table_name
    when 'companies' then 'company'::public.activity_entity_type
    when 'customers' then 'customer'::public.activity_entity_type
    when 'jobs' then 'job'::public.activity_entity_type
    when 'job_photos' then 'job_photo'::public.activity_entity_type
    when 'invoices' then 'invoice'::public.activity_entity_type
    when 'invoice_items' then 'invoice_item'::public.activity_entity_type
    when 'reminders' then 'reminder'::public.activity_entity_type
  end;

  if tg_op = 'INSERT' then
    target_action := 'created';
  elsif tg_op = 'DELETE' then
    target_action := 'deleted';
  else
    target_action := 'updated';
  end if;

  insert into public.activity_logs (company_id, entity_type, entity_id, action, metadata)
  values (target_company_id, target_entity_type, target_entity_id, target_action, meta);

  return coalesce(new, old);
end;
$$;

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at before update on public.companies
for each row execute function public.set_updated_at();

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at before update on public.jobs
for each row execute function public.set_updated_at();

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at before update on public.invoices
for each row execute function public.set_updated_at();

drop trigger if exists invoice_items_set_updated_at on public.invoice_items;
create trigger invoice_items_set_updated_at before update on public.invoice_items
for each row execute function public.set_updated_at();

drop trigger if exists reminders_set_updated_at on public.reminders;
create trigger reminders_set_updated_at before update on public.reminders
for each row execute function public.set_updated_at();

drop trigger if exists invoices_set_due_date on public.invoices;
create trigger invoices_set_due_date before insert on public.invoices
for each row execute function public.set_due_date_from_company_terms();

drop trigger if exists invoices_set_invoice_number on public.invoices;
create trigger invoices_set_invoice_number before insert on public.invoices
for each row execute function public.set_invoice_number();

drop trigger if exists invoice_items_set_line_total on public.invoice_items;
create trigger invoice_items_set_line_total before insert or update of quantity, unit_price on public.invoice_items
for each row execute function public.set_invoice_item_line_total();

drop trigger if exists invoice_items_recalculate_invoice_totals_insert on public.invoice_items;
create trigger invoice_items_recalculate_invoice_totals_insert after insert on public.invoice_items
for each row execute function public.recalculate_invoice_totals_trigger();

drop trigger if exists invoice_items_recalculate_invoice_totals_update on public.invoice_items;
create trigger invoice_items_recalculate_invoice_totals_update after update of quantity, unit_price, vat_rate, line_total on public.invoice_items
for each row execute function public.recalculate_invoice_totals_trigger();

drop trigger if exists invoice_items_recalculate_invoice_totals_delete on public.invoice_items;
create trigger invoice_items_recalculate_invoice_totals_delete after delete on public.invoice_items
for each row execute function public.recalculate_invoice_totals_trigger();

drop trigger if exists companies_log_activity on public.companies;
create trigger companies_log_activity after insert or update or delete on public.companies
for each row execute function public.log_activity();

drop trigger if exists customers_log_activity on public.customers;
create trigger customers_log_activity after insert or update or delete on public.customers
for each row execute function public.log_activity();

drop trigger if exists jobs_log_activity on public.jobs;
create trigger jobs_log_activity after insert or update or delete on public.jobs
for each row execute function public.log_activity();

drop trigger if exists job_photos_log_activity on public.job_photos;
create trigger job_photos_log_activity after insert or update or delete on public.job_photos
for each row execute function public.log_activity();

drop trigger if exists invoices_log_activity on public.invoices;
create trigger invoices_log_activity after insert or update or delete on public.invoices
for each row execute function public.log_activity();

drop trigger if exists invoice_items_log_activity on public.invoice_items;
create trigger invoice_items_log_activity after insert or update or delete on public.invoice_items
for each row execute function public.log_activity();

drop trigger if exists reminders_log_activity on public.reminders;
create trigger reminders_log_activity after insert or update or delete on public.reminders
for each row execute function public.log_activity();

alter table public.companies enable row level security;
alter table public.customers enable row level security;
alter table public.jobs enable row level security;
alter table public.job_photos enable row level security;
alter table public.invoice_sequences enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.reminders enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "owners can select their companies" on public.companies;
create policy "owners can select their companies" on public.companies
  for select using (owner_user_id = auth.uid());

drop policy if exists "owners can insert their companies" on public.companies;
create policy "owners can insert their companies" on public.companies
  for insert with check (owner_user_id = auth.uid());

drop policy if exists "owners can update their companies" on public.companies;
create policy "owners can update their companies" on public.companies
  for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

drop policy if exists "owners can delete their companies" on public.companies;
create policy "owners can delete their companies" on public.companies
  for delete using (owner_user_id = auth.uid());

drop policy if exists "owners can access customers" on public.customers;
create policy "owners can access customers" on public.customers
  for all using (public.company_is_owned(company_id))
  with check (public.company_is_owned(company_id));

drop policy if exists "owners can access jobs" on public.jobs;
create policy "owners can access jobs" on public.jobs
  for all using (public.company_is_owned(company_id))
  with check (public.company_is_owned(company_id));

drop policy if exists "owners can access job photos" on public.job_photos;
create policy "owners can access job photos" on public.job_photos
  for all using (public.company_is_owned(company_id))
  with check (public.company_is_owned(company_id));

drop policy if exists "owners can read invoice sequences" on public.invoice_sequences;
create policy "owners can read invoice sequences" on public.invoice_sequences
  for select using (public.company_is_owned(company_id));

drop policy if exists "owners can access invoices" on public.invoices;
create policy "owners can access invoices" on public.invoices
  for all using (public.company_is_owned(company_id))
  with check (public.company_is_owned(company_id));

drop policy if exists "owners can access invoice items" on public.invoice_items;
create policy "owners can access invoice items" on public.invoice_items
  for all using (public.company_is_owned(company_id))
  with check (public.company_is_owned(company_id));

drop policy if exists "owners can access reminders" on public.reminders;
create policy "owners can access reminders" on public.reminders
  for all using (public.company_is_owned(company_id))
  with check (public.company_is_owned(company_id));

drop policy if exists "owners can read activity logs" on public.activity_logs;
create policy "owners can read activity logs" on public.activity_logs
  for select using (public.company_is_owned(company_id));

drop policy if exists "owners can insert activity logs" on public.activity_logs;
create policy "owners can insert activity logs" on public.activity_logs
  for insert with check (public.company_is_owned(company_id));

-- Optional Supabase Storage policies for a private "job-photos" bucket.
-- The first path segment must be the company_id, for example:
-- job-photos/{company_id}/{job_id}/{filename}
insert into storage.buckets (id, name, public)
values ('job-photos', 'job-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('invoice-pdfs', 'invoice-pdfs', false)
on conflict (id) do nothing;

drop policy if exists "owners can read own job photos" on storage.objects;
create policy "owners can read own job photos" on storage.objects
  for select using (
    bucket_id = 'job-photos'
    and public.company_is_owned((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "owners can upload own job photos" on storage.objects;
create policy "owners can upload own job photos" on storage.objects
  for insert with check (
    bucket_id = 'job-photos'
    and public.company_is_owned((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "owners can update own job photos" on storage.objects;
create policy "owners can update own job photos" on storage.objects
  for update using (
    bucket_id = 'job-photos'
    and public.company_is_owned((storage.foldername(name))[1]::uuid)
  ) with check (
    bucket_id = 'job-photos'
    and public.company_is_owned((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "owners can delete own job photos" on storage.objects;
create policy "owners can delete own job photos" on storage.objects
  for delete using (
    bucket_id = 'job-photos'
    and public.company_is_owned((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "owners can read own invoice pdfs" on storage.objects;
create policy "owners can read own invoice pdfs" on storage.objects
  for select using (
    bucket_id = 'invoice-pdfs'
    and public.company_is_owned((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "owners can upload own invoice pdfs" on storage.objects;
create policy "owners can upload own invoice pdfs" on storage.objects
  for insert with check (
    bucket_id = 'invoice-pdfs'
    and public.company_is_owned((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "owners can update own invoice pdfs" on storage.objects;
create policy "owners can update own invoice pdfs" on storage.objects
  for update using (
    bucket_id = 'invoice-pdfs'
    and public.company_is_owned((storage.foldername(name))[1]::uuid)
  ) with check (
    bucket_id = 'invoice-pdfs'
    and public.company_is_owned((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "owners can delete own invoice pdfs" on storage.objects;
create policy "owners can delete own invoice pdfs" on storage.objects
  for delete using (
    bucket_id = 'invoice-pdfs'
    and public.company_is_owned((storage.foldername(name))[1]::uuid)
  );
