import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { createCustomer } from "@/server/actions/customers";
import type { Customer } from "@/types/customer";

type CustomerFormProps = {
  customer?: Customer;
  action?: (formData: FormData) => void | Promise<void>;
};

export function CustomerForm({ customer, action = createCustomer }: CustomerFormProps) {
  return (
    <form action={action} className="grid gap-4">
      <Field label="Name">
        <Input name="name" placeholder="Anna Schmidt" defaultValue={customer?.name ?? ""} required />
      </Field>
      <Field label="Firma optional">
        <Input name="business_name" placeholder="Schmidt Immobilien GmbH" defaultValue={customer?.business_name ?? ""} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="E-Mail">
          <Input name="email" type="email" placeholder="kunde@example.de" defaultValue={customer?.email ?? ""} required />
        </Field>
        <Field label="Telefon">
          <Input name="phone" placeholder="+49 ..." defaultValue={customer?.phone ?? ""} />
        </Field>
      </div>
      <Field label="Straße">
        <Input name="street" defaultValue={customer?.street ?? ""} required />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="PLZ">
          <Input name="postal_code" defaultValue={customer?.postal_code ?? ""} required />
        </Field>
        <Field label="Ort">
          <Input name="city" defaultValue={customer?.city ?? ""} required />
        </Field>
      </div>
      <Field label="Notizen">
        <Textarea name="notes" placeholder="Zugang, Ansprechpartner, Besonderheiten" defaultValue={customer?.notes ?? ""} />
      </Field>
      <input type="hidden" name="country" value={customer?.country ?? "Deutschland"} />
      <Button type="submit">{customer ? "Kunde aktualisieren" : "Kunde speichern"}</Button>
    </form>
  );
}
