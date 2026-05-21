import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";
import type { Company } from "@/types/company";
import type { Customer } from "@/types/customer";
import type { Invoice, InvoiceItem } from "@/types/invoice";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 700 },
  block: { marginBottom: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 8,
  },
  total: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, fontSize: 14, fontWeight: 700 },
});

export function InvoicePdfDocument({
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
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Rechnung {invoice.invoice_number}</Text>
            <Text>Rechnungsdatum: {invoice.issue_date}</Text>
            <Text>Fällig am: {invoice.due_date}</Text>
          </View>
          <View>
            <Text>{company.name}</Text>
            <Text>{company.street}</Text>
            <Text>{company.postal_code} {company.city}</Text>
            <Text>St.-Nr. {company.tax_number}</Text>
          </View>
        </View>
        <View style={styles.block}>
          <Text>{customer.business_name || customer.name}</Text>
          <Text>{customer.name}</Text>
          <Text>{customer.street}</Text>
          <Text>{customer.postal_code} {customer.city}</Text>
        </View>
        <View>
          {items.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text>{item.description} ({item.quantity} {item.unit})</Text>
              <Text>{formatCurrency(item.line_total)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.row}>
          <Text>Netto</Text>
          <Text>{formatCurrency(invoice.subtotal)}</Text>
        </View>
        <View style={styles.row}>
          <Text>USt.</Text>
          <Text>{formatCurrency(invoice.vat_total)}</Text>
        </View>
        <View style={styles.total}>
          <Text>Gesamt</Text>
          <Text>{formatCurrency(invoice.total)}</Text>
        </View>
        <View style={styles.block}>
          <Text>Bitte überweisen Sie den Betrag auf {company.iban}.</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInvoicePdfBuffer(props: Parameters<typeof InvoicePdfDocument>[0]) {
  return renderToBuffer(<InvoicePdfDocument {...props} />);
}
