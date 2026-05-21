import { formatCurrency, formatDate } from "@/lib/utils";
import type { Company } from "@/types/company";
import type { Customer } from "@/types/customer";
import type { Invoice, InvoiceItem } from "@/types/invoice";

export function InvoicePreview({
  company,
  customer,
  invoice,
  items,
}: {
  company: Company;
  customer: Customer;
  invoice: Invoice;
  items: InvoiceItem[];
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-500">Rechnung</p>
          <h2 className="text-2xl font-bold">{invoice.invoice_number}</h2>
        </div>
        <div className="text-right text-sm text-zinc-600">
          <p>{formatDate(invoice.issue_date)}</p>
          <p>Fällig {formatDate(invoice.due_date)}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="font-semibold">{company.name}</p>
          <p>{company.street}</p>
          <p>{company.postal_code} {company.city}</p>
          <p>St.-Nr. {company.tax_number}</p>
        </div>
        <div>
          <p className="font-semibold">{customer.business_name || customer.name}</p>
          <p>{customer.name}</p>
          <p>{customer.street}</p>
          <p>{customer.postal_code} {customer.city}</p>
        </div>
      </div>
      <div className="mt-6 divide-y divide-zinc-100">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 py-3 text-sm">
            <div>
              <p className="font-medium">{item.description}</p>
              <p className="text-zinc-500">{item.quantity} {item.unit} x {formatCurrency(item.unit_price)}</p>
            </div>
            <p className="font-semibold">{formatCurrency(item.line_total)}</p>
          </div>
        ))}
      </div>
      <dl className="mt-4 grid gap-2 border-t border-zinc-200 pt-4 text-sm">
        <div className="flex justify-between">
          <dt>Netto</dt>
          <dd>{formatCurrency(invoice.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>USt.</dt>
          <dd>{formatCurrency(invoice.vat_total)}</dd>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <dt>Gesamt</dt>
          <dd>{formatCurrency(invoice.total)}</dd>
        </div>
      </dl>
    </section>
  );
}
