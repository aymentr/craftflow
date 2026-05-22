import { Resend } from "resend";
import { hasInvoiceEmailConfig } from "@/lib/env";

export { hasInvoiceEmailConfig };

export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  pdfUrl,
  pdfBuffer,
}: {
  to: string;
  invoiceNumber: string;
  pdfUrl?: string | null;
  pdfBuffer?: Buffer | null;
}) {
  if (!hasInvoiceEmailConfig()) {
    throw new Error("E-Mail Versand ist noch nicht eingerichtet.");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: process.env.INVOICE_FROM_EMAIL!,
    to,
    subject: `Rechnung ${invoiceNumber}`,
    html: `<p>Guten Tag,</p><p>anbei erhalten Sie Rechnung ${invoiceNumber}.</p>${
      pdfUrl ? `<p><a href="${pdfUrl}">PDF herunterladen</a></p>` : ""
    }<p>Vielen Dank.</p>`,
    attachments: pdfBuffer
      ? [
          {
            filename: `Rechnung-${invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ]
      : undefined,
  });
}
