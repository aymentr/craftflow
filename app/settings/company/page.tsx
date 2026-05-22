import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { getCurrentCompany } from "@/lib/db/queries";
import { upsertCompany } from "@/server/actions/company";

export default async function CompanySettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; error?: string }>;
}) {
  const company = await getCurrentCompany();
  const params = searchParams ? await searchParams : {};

  return (
    <AppShell title="Firma">
      <h1 className="mb-5 text-2xl font-bold">Firmenprofil</h1>
      {params.saved ? (
        <Notice>Firmenprofil gespeichert.</Notice>
      ) : null}
      {params.error === "company-required" ? (
        <Notice variant="warning">Lege zuerst dein Firmenprofil an. Danach kannst du Kunden und Jobs speichern.</Notice>
      ) : null}
      <form action={upsertCompany} className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5">
        <Field label="Firmenname">
          <Input name="name" defaultValue={company?.name ?? ""} required />
        </Field>
        <Field label="Inhaber">
          <Input name="owner_name" defaultValue={company?.owner_name ?? ""} required />
        </Field>
        <Field label="Straße">
          <Input name="street" defaultValue={company?.street ?? ""} required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="PLZ">
            <Input name="postal_code" defaultValue={company?.postal_code ?? ""} required />
          </Field>
          <Field label="Ort">
            <Input name="city" defaultValue={company?.city ?? ""} required />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Steuernummer">
            <Input name="tax_number" defaultValue={company?.tax_number ?? ""} required />
          </Field>
          <Field label="USt-Id optional">
            <Input name="vat_id" defaultValue={company?.vat_id ?? ""} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Standard USt.">
            <Input name="default_vat_rate" type="number" step="0.01" min="0" max="1" defaultValue={company?.default_vat_rate ?? 0.19} required />
          </Field>
          <Field label="Zahlungsziel Tage">
            <Input name="payment_terms_days" type="number" min="0" max="90" defaultValue={company?.payment_terms_days ?? 14} required />
          </Field>
        </div>
        <Field label="IBAN">
          <Input name="iban" defaultValue={company?.iban ?? ""} required />
        </Field>
        <input type="hidden" name="country" value={company?.country ?? "Deutschland"} />
        <input type="hidden" name="logo_url" value={company?.logo_url ?? ""} />
        <Button type="submit">Firmenprofil speichern</Button>
      </form>
    </AppShell>
  );
}
