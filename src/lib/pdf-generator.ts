import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from './utils';

interface InvoiceData {
  id: string;
  number: string;
  date: Date;
  dueDate?: Date | null;
  status: string;
  description?: string | null;
  notes?: string | null;
  subtotalCents: number;
  vatRate: number;
  vatAmountCents: number;
  totalCents: number;
  currency: string;
  exchangeRate?: number | null;
  totalEurCents?: number | null;
  withholdingRate?: number | null;
  withholdingAmountCents?: number | null;
  paidDate?: Date | null;
  client: {
    name: string;
    email?: string | null;
    address?: string | null;
    country: string;
    taxId?: string | null;
    isUSClient: boolean;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
    totalCents: number;
  }>;
}

interface UserData {
  name?: string | null;
  email: string;
  address?: string | null;
  taxId?: string | null;
  retaNumber?: string | null;
}

export function generateInvoicePDF(invoice: InvoiceData, user: UserData) {
  const pdf = new jsPDF();

  // Set font
  pdf.setFont('helvetica');

  // Colors
  const primaryColor = '#0f172a';
  const grayColor = '#64748b';
  const accentColor = '#3b82f6';

  let yPosition = 20;

  // Header with company branding
  pdf.setFillColor(15, 23, 42); // primaryColor
  pdf.rect(0, 0, 210, 35, 'F');

  pdf.setFontSize(28);
  pdf.setTextColor(255, 255, 255);
  pdf.text('INVOICE', 20, 25);

  pdf.setFontSize(12);
  pdf.setTextColor(200, 200, 200);
  pdf.text(`Nº ${invoice.number}`, 150, 20);
  pdf.text(formatDate(invoice.date), 150, 28);

  // Status with colored background
  const statusColor =
    invoice.status === 'PAID'
      ? [34, 197, 94]
      : invoice.status === 'SENT'
      ? [59, 130, 246]
      : invoice.status === 'OVERDUE'
      ? [239, 68, 68]
      : [156, 163, 175];

  pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  pdf.roundedRect(150, 32, 35, 8, 2, 2, 'F');
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.text(invoice.status, 152, 37);

  yPosition = 50;

  yPosition += 25;

  // From and To sections
  pdf.setFontSize(12);
  pdf.setTextColor('#000000');
  pdf.text('From:', 20, yPosition);
  pdf.text('To:', 110, yPosition);

  yPosition += 8;

  // From details
  pdf.setFontSize(10);
  pdf.setTextColor('#000000');
  let fromY = yPosition;

  if (user.name) {
    pdf.text(user.name, 20, fromY);
    fromY += 5;
  }

  pdf.text(user.email, 20, fromY);
  fromY += 5;

  if (user.address) {
    // Split address into multiple lines if too long
    const addressLines = pdf.splitTextToSize(user.address, 80);
    pdf.text(addressLines, 20, fromY);
    fromY += addressLines.length * 5;
  }

  if (user.taxId) {
    pdf.text(`Tax ID: ${user.taxId}`, 20, fromY);
    fromY += 5;
  }

  if (user.retaNumber) {
    pdf.text(`RETA: ${user.retaNumber}`, 20, fromY);
    fromY += 5;
  }

  // To details
  let toY = yPosition;

  pdf.text(invoice.client.name, 110, toY);
  toY += 5;

  if (invoice.client.email) {
    pdf.text(invoice.client.email, 110, toY);
    toY += 5;
  }

  if (invoice.client.address) {
    const addressLines = pdf.splitTextToSize(invoice.client.address, 80);
    pdf.text(addressLines, 110, toY);
    toY += addressLines.length * 5;
  }

  pdf.text(invoice.client.country, 110, toY);
  toY += 5;

  if (invoice.client.taxId) {
    pdf.text(`Tax ID: ${invoice.client.taxId}`, 110, toY);
    toY += 5;
  }

  pdf.text(`${invoice.client.currency} Client`, 110, toY);
  toY += 5;

  yPosition = Math.max(fromY, toY) + 15;

  // Invoice details
  pdf.setFontSize(12);
  pdf.setTextColor(primaryColor);
  pdf.text('Invoice Details', 20, yPosition);

  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setTextColor('#000000');
  pdf.text(`Invoice Date: ${formatDate(invoice.date)}`, 20, yPosition);

  if (invoice.dueDate) {
    pdf.text(`Due Date: ${formatDate(invoice.dueDate)}`, 110, yPosition);
  }

  yPosition += 5;

  if (invoice.paidDate) {
    pdf.text(`Paid Date: ${formatDate(invoice.paidDate)}`, 20, yPosition);
    yPosition += 5;
  }

  yPosition += 10;

  // Items table
  pdf.setFontSize(12);
  pdf.setTextColor('#000000');
  pdf.text('CONCEPTOS:', 20, yPosition);
  
  yPosition += 10;

  // Table header with better styling
  pdf.setFillColor(59, 130, 246);
  pdf.rect(20, yPosition - 5, 170, 8, 'F');

  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text('Descripción', 22, yPosition);
  pdf.text('Cant.', 125, yPosition);
  pdf.text('Precio Unit.', 140, yPosition);
  pdf.text('Total', 175, yPosition);

  yPosition += 8;

  // Table items
  pdf.setTextColor('#000000'); // Reset to black text for table items
  pdf.setFontSize(10);
  
  if (invoice.items && invoice.items.length > 0) {
    invoice.items.forEach((item, index) => {
      
      const descriptionLines = pdf.splitTextToSize(item.description, 100);

      pdf.text(descriptionLines, 22, yPosition);
      pdf.text(item.quantity.toString(), 125, yPosition);
      pdf.text(formatCurrency(item.unitPriceCents, invoice.currency), 140, yPosition);
      pdf.text(formatCurrency(item.totalCents, invoice.currency), 175, yPosition);

      yPosition += Math.max(descriptionLines.length * 4, 6);
    });
  } else {
    // Add fallback text if no items
    pdf.text('No hay conceptos definidos', 22, yPosition);
    yPosition += 6;
  }

  yPosition += 10;

  // Totals section with Spanish labels
  const totalsX = 120;

  pdf.setTextColor('#000000');
  pdf.setFontSize(10);

  pdf.text('Subtotal:', totalsX, yPosition);
  pdf.text(formatCurrency(invoice.subtotalCents, invoice.currency), 175, yPosition);
  yPosition += 6;

  if (invoice.vatAmountCents > 0) {
    pdf.text(`IVA (${invoice.vatRate}%):`, totalsX, yPosition);
    pdf.text(formatCurrency(invoice.vatAmountCents, invoice.currency), 175, yPosition);
    yPosition += 6;
  }

  if (invoice.withholdingAmountCents) {
    pdf.setTextColor('#ea580c');
    pdf.text(`Withholding IRPF (${invoice.withholdingRate}%):`, totalsX, yPosition);
    pdf.text(`-${formatCurrency(invoice.withholdingAmountCents, invoice.currency)}`, 175, yPosition);
    yPosition += 6;
  }

  // Total line with accent color
  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(1);
  pdf.line(totalsX, yPosition, 190, yPosition);
  yPosition += 10;

  pdf.setFontSize(14);
  pdf.setTextColor('#000000');
  pdf.text('TOTAL:', totalsX, yPosition);
  pdf.text(formatCurrency(invoice.totalCents, invoice.currency), 175, yPosition);

  // EUR conversion for USD invoices
  if (invoice.currency === 'USD' && invoice.totalEurCents && invoice.exchangeRate) {
    yPosition += 8;
    pdf.setFontSize(9);
    pdf.setTextColor('#64748b');
    pdf.text('Total in EUR (tax purposes):', totalsX, yPosition);
    pdf.text(formatCurrency(invoice.totalEurCents, 'EUR'), 175, yPosition);
    yPosition += 4;
    pdf.text(`Exchange rate: ${invoice.exchangeRate.toFixed(4)} EUR/USD`, totalsX, yPosition);
  }

  yPosition += 15;

  // Legal footer with Spanish tax information
  const pageHeight = pdf.internal.pageSize.height;

  // Legal notice box
  pdf.setFillColor(248, 250, 252);
  pdf.rect(20, pageHeight - 45, 170, 25, 'F');
  pdf.setDrawColor(203, 213, 225);
  pdf.rect(20, pageHeight - 45, 170, 25);

  pdf.setFontSize(8);
  pdf.setTextColor('#475569');

  if (!invoice.client.isUSClient && invoice.withholdingAmountCents) {
    pdf.text('RETENCIÓN IRPF: Esta factura está sujeta a retención del IRPF según normativa vigente.', 22, pageHeight - 38);
  }

  if (invoice.vatAmountCents > 0) {
    pdf.text('IVA: Factura sujeta al Impuesto sobre el Valor Añadido según Ley 37/1992.', 22, pageHeight - 33);
  } else if (invoice.client.isUSClient) {
    pdf.text('IVA: Operación no sujeta al IVA por tratarse de cliente extracomunitario.', 22, pageHeight - 33);
  }

  // Page number
  pdf.setTextColor('#94a3b8');
  pdf.text('Page 1 of 1', 170, pageHeight - 10);

  return pdf;
}

export function downloadInvoicePDF(invoice: InvoiceData, user: UserData) {
  const pdf = generateInvoicePDF(invoice, user);
  const filename = `Invoice_${invoice.number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  pdf.save(filename);
}
