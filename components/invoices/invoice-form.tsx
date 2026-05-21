import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { updateInvoice } from "@/server/actions/invoices";
import type { Invoice, InvoiceItem } from "@/types/invoice";

const maxRows = 5;

export function InvoiceForm({ invoice, items }: { invoice: Invoice; items: InvoiceItem[] }) {
  const rows = Array.from({ length: maxRows }, (_, index) => items[index]);

  return (
    <form action={updateInvoice} className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4">
      <input type="hidden" name="invoice_id" value={invoice.id} />
      <input type="hidden" name="item_count" value={maxRows} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Rechnungsdatum">
          <Input name="issue_date" type="date" defaultValue={invoice.issue_date} />
        </Field>
        <Field label="Fällig am">
          <Input name="due_date" type="date" defaultValue={invoice.due_date} />
        </Field>
      </div>
      <div className="grid gap-3">
        <h2 className="text-sm font-bold">Positionen</h2>
        {rows.map((item, index) => (
          <div key={item?.id ?? index} className="grid gap-2 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
            <Input name={`description_${index}`} placeholder="Leistung oder Material" defaultValue={item?.description ?? ""} />
            <div className="grid grid-cols-[1fr_88px] gap-2">
              <Input name={`quantity_${index}`} type="number" min="0" step="0.01" placeholder="Menge" defaultValue={item?.quantity ?? ""} />
              <Input name={`unit_${index}`} placeholder="Einheit" defaultValue={item?.unit ?? "Std."} />
            </div>
            <div className="grid grid-cols-[1fr_104px] gap-2">
              <Input
                name={`unit_price_${index}`}
                type="number"
                min="0"
                step="0.01"
                placeholder="Preis EUR"
                defaultValue={item ? item.unit_price / 100 : ""}
              />
              <Select name={`vat_rate_${index}`} defaultValue={String(item?.vat_rate ?? 0.19)}>
                <option value="0.19">19%</option>
                <option value="0.07">7%</option>
                <option value="0">0%</option>
              </Select>
            </div>
          </div>
        ))}
      </div>
      <Button type="submit" variant="secondary">Entwurf aktualisieren</Button>
    </form>
  );
}
