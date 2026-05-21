import type { InvoiceItemInput } from "@/lib/validators/invoice";

export type CalculatedInvoiceItem = InvoiceItemInput & {
  line_total: number;
};

export function calculateInvoice(items: InvoiceItemInput[]) {
  const calculatedItems: CalculatedInvoiceItem[] = items.map((item) => ({
    ...item,
    line_total: Math.round(item.quantity * item.unit_price),
  }));

  const subtotal = calculatedItems.reduce((sum, item) => sum + item.line_total, 0);
  const vat_total = calculatedItems.reduce(
    (sum, item) => sum + Math.round(item.line_total * item.vat_rate),
    0,
  );

  return {
    items: calculatedItems,
    subtotal,
    vat_total,
    total: subtotal + vat_total,
  };
}

export function dueDateFromTerms(issueDate: Date, paymentTermsDays: number) {
  const dueDate = new Date(issueDate);
  dueDate.setDate(issueDate.getDate() + paymentTermsDays);
  return dueDate.toISOString().slice(0, 10);
}

export function buildInvoiceNumber(year: number, sequence: number) {
  return `${year}-${String(sequence).padStart(4, "0")}`;
}
