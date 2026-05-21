# CraftFlow

Mobile-first job capture, invoice generation, email sending, and payment reminders for small craft businesses in Germany.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Without Supabase environment variables, the app runs in demo mode with local seed data. With Supabase configured, authenticated routes are protected and data is loaded through RLS-scoped Supabase queries.

## Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
INVOICE_FROM_EMAIL=
CRON_SECRET=
```

`SUPABASE_SERVICE_ROLE_KEY` is only used by the reminder processing route. Never expose it to the browser.

## Supabase Setup

Run [lib/db/schema.sql](./lib/db/schema.sql) in the Supabase SQL editor. It creates:

- company-scoped tables for customers, jobs, invoices, invoice items, reminders, and activity logs
- invoice number sequencing with `YYYY-0001` numbers per company
- invoice total recalculation triggers
- row-level security policies for company-owned data
- private Storage buckets for job photos and invoice PDFs

## Reminder Processing

Call the reminder endpoint from a cron scheduler:

```bash
curl -X POST https://your-app.example.com/api/reminders/process \
  -H "Authorization: Bearer $CRON_SECRET"
```

The route sends due reminders, marks reminder status, and updates sent invoices to overdue when appropriate.

## Current MVP Surface

- Supabase Auth login/signup/logout
- company profile
- customer create/update/delete
- job create/update/delete/complete
- invoice draft generation from completed jobs
- structured invoice item editing with cent-based totals
- PDF generation and authenticated PDF download
- invoice email sending with PDF attachment through Resend
- invoice status tracking
- payment reminder scheduling and processing
