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

Local development can run without Supabase values; that enables demo mode. Production requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

`RESEND_API_KEY` and `INVOICE_FROM_EMAIL` are optional until email sending is configured. If either is missing, invoice email sending is disabled in the UI and PDF download still works.

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

The reminder endpoint requires:

- `CRON_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`

If invoice email sending is not configured with Resend, due reminders are marked failed with the send error.

## Production Checklist

1. Create a Supabase project.
2. Run [lib/db/schema.sql](./lib/db/schema.sql) in the Supabase SQL editor.
3. Verify the private Storage buckets exist:
   - `job-photos`
   - `invoice-pdfs`
4. Set production environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET`
5. Optional email setup:
   - verify a sending domain in Resend
   - set `RESEND_API_KEY`
   - set `INVOICE_FROM_EMAIL`, for example `CraftFlow <rechnung@example.com>`
6. Deploy the app.
7. Smoke test production:
   - signup/login
   - company profile save
   - customer create
   - job create with photo upload
   - job completion
   - invoice generation
   - invoice PDF download
   - mark invoice paid
8. Configure a cron scheduler to call `/api/reminders/process` with `Authorization: Bearer $CRON_SECRET`.

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
