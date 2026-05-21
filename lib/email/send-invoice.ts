import { Resend } from "resend";

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
  if (!process.env.RESEND_API_KEY) {
    return { skipped: true, reason: "RESEND_API_KEY is not configured." };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: process.env.INVOICE_FROM_EMAIL ?? "CraftFlow <invoices@example.com>",
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
