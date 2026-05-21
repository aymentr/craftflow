import { notFound } from "next/navigation";
import { getInvoiceBundle } from "@/lib/db/queries";
import { generateInvoicePdfBuffer } from "@/lib/pdf/invoice-pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { company, customer, invoice, items } = await getInvoiceBundle(id);

  if (!company || !customer || !invoice || items.length === 0) {
    notFound();
  }

  const buffer = await generateInvoicePdfBuffer({ company, customer, invoice, items });
  const filename = `Rechnung-${invoice.invoice_number ?? invoice.id}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
