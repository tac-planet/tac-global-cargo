"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface PdfColumn {
  header: string;
  dataKey: string;
}

interface GeneratePdfOptions {
  title: string;
  subtitle?: string;
  columns: PdfColumn[];
  rows: Record<string, string | number | null | undefined>[];
  filename?: string;
  orientation?: "portrait" | "landscape";
}

export function generateTablePdf({
  title,
  subtitle,
  columns,
  rows,
  filename,
  orientation = "portrait",
}: GeneratePdfOptions): void {
  const doc = new jsPDF({ orientation });
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = format(new Date(), "dd MMM yyyy HH:mm");

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("TAC Global Cargo", 14, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 28);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(subtitle, 14, 34);
    doc.setTextColor(0);
  }

  doc.setFontSize(8);
  doc.setTextColor(130);
  doc.text(`Generated: ${now}`, pageWidth - 14, 20, { align: "right" });
  doc.setTextColor(0);

  const head = [columns.map((c) => c.header)];
  const body = rows.map((row) =>
    columns.map((col) => {
      const val = row[col.dataKey];
      return val != null ? String(val) : "\u2014";
    })
  );

  autoTable(doc, {
    startY: subtitle ? 40 : 34,
    head,
    body,
    theme: "striped",
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    styles: { cellPadding: 3, lineColor: [220, 220, 220], lineWidth: 0.1 },
    margin: { left: 14, right: 14 },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    doc.text("TAC Global Cargo \u2014 Confidential", 14, doc.internal.pageSize.getHeight() - 10);
  }

  const safeName = filename ?? `${title.toLowerCase().replace(/\s+/g, "-")}-${format(new Date(), "yyyyMMdd")}`;
  doc.save(`${safeName}.pdf`);
}

interface ShipmentForPdf {
  cn_number: string; consignor_name: string; consignee_name: string;
  origin_hub_id: string; destination_hub_id: string; status: string;
  total_packages: number; total_weight: number; mode: string; booking_date: string | null;
}

export function generateShipmentsPdf(shipments: ShipmentForPdf[]): void {
  generateTablePdf({
    title: "Shipments Report", subtitle: `${shipments.length} shipment(s)`,
    columns: [
      { header: "CN Number", dataKey: "cn_number" }, { header: "Consignor", dataKey: "consignor_name" },
      { header: "Consignee", dataKey: "consignee_name" }, { header: "Mode", dataKey: "mode" },
      { header: "Packages", dataKey: "total_packages" }, { header: "Weight (kg)", dataKey: "total_weight" },
      { header: "Status", dataKey: "status" }, { header: "Date", dataKey: "booking_date" },
    ],
    rows: shipments.map((s) => ({ ...s, booking_date: s.booking_date ? format(new Date(s.booking_date), "dd MMM yyyy") : null })),
    orientation: "landscape",
  });
}

interface InvoiceForPdf {
  invoice_no: string; issue_date: string | null; due_date: string | null;
  subtotal: number; tax_amount: number; total: number; status: string;
}

export function generateInvoicesPdf(invoices: InvoiceForPdf[]): void {
  generateTablePdf({
    title: "Invoices Report", subtitle: `${invoices.length} invoice(s)`,
    columns: [
      { header: "Invoice #", dataKey: "invoice_no" }, { header: "Issue Date", dataKey: "issue_date" },
      { header: "Due Date", dataKey: "due_date" }, { header: "Subtotal", dataKey: "subtotal" },
      { header: "Tax", dataKey: "tax_amount" }, { header: "Total", dataKey: "total" },
      { header: "Status", dataKey: "status" },
    ],
    rows: invoices.map((inv) => ({
      ...inv,
      issue_date: inv.issue_date ? format(new Date(inv.issue_date), "dd MMM yyyy") : null,
      due_date: inv.due_date ? format(new Date(inv.due_date), "dd MMM yyyy") : null,
      subtotal: inv.subtotal?.toLocaleString("en-IN"),
      tax_amount: inv.tax_amount?.toLocaleString("en-IN"),
      total: inv.total?.toLocaleString("en-IN"),
    })),
  });
}

interface ManifestForPdf {
  manifest_no: string; transport_mode: string; vehicle_number: string | null;
  driver_name: string | null; status: string; package_count: number | null; total_weight: number | null;
}

export function generateManifestsPdf(manifests: ManifestForPdf[]): void {
  generateTablePdf({
    title: "Manifests Report", subtitle: `${manifests.length} manifest(s)`,
    columns: [
      { header: "Manifest #", dataKey: "manifest_no" }, { header: "Mode", dataKey: "transport_mode" },
      { header: "Vehicle", dataKey: "vehicle_number" }, { header: "Driver", dataKey: "driver_name" },
      { header: "Packages", dataKey: "package_count" }, { header: "Weight (kg)", dataKey: "total_weight" },
      { header: "Status", dataKey: "status" },
    ],
    rows: manifests as unknown as Record<string, string | number | null | undefined>[],
    orientation: "landscape",
  });
}
