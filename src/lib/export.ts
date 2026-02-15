import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Brand colors (Rich Gold HSL 43 96% 50% → RGB)
const GOLD_PRIMARY = 'F5A623';
const GOLD_DARK = 'C4841C';
const GOLD_LIGHT = 'FEF3D6';
const WHITE = 'FFFFFF';
const DARK_TEXT = '1A1A1A';
const GRAY_TEXT = '666666';
const ROW_ALT = 'FFF8E7'; // Very light gold for alternating rows

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

interface ExportOptions {
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
  filename: string;
}

export async function exportToExcel({ title, subtitle, columns, data, filename }: ExportOptions) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Comanda';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(title, {
    properties: { defaultColWidth: 18 },
  });

  // Title row
  const titleRow = sheet.addRow([title]);
  titleRow.height = 36;
  const titleCell = titleRow.getCell(1);
  titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: WHITE } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_PRIMARY } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.mergeCells(1, 1, 1, columns.length);

  // Subtitle row
  if (subtitle) {
    const subRow = sheet.addRow([subtitle]);
    subRow.height = 24;
    const subCell = subRow.getCell(1);
    subCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: GRAY_TEXT } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_LIGHT } };
    subCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.mergeCells(2, 1, 2, columns.length);
  }

  // Empty spacer row
  sheet.addRow([]);

  // Header row
  const headerRowIndex = subtitle ? 4 : 3;
  const headerRow = sheet.addRow(columns.map(c => c.header));
  headerRow.height = 30;
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_DARK } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = {
      bottom: { style: 'medium', color: { argb: GOLD_PRIMARY } },
    };
  });

  // Data rows
  data.forEach((row, index) => {
    const dataRow = sheet.addRow(columns.map(c => row[c.key] ?? ''));
    dataRow.height = 26;
    const isAlt = index % 2 === 1;

    dataRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, color: { argb: DARK_TEXT } };
      cell.alignment = { vertical: 'middle' };
      if (isAlt) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROW_ALT } };
      }
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'E5E5E5' } },
      };
    });
  });

  // Column widths
  columns.forEach((col, i) => {
    const sheetCol = sheet.getColumn(i + 1);
    sheetCol.width = col.width || 20;
  });

  // Footer row
  const footerRow = sheet.addRow([]);
  const summaryRow = sheet.addRow([`Total: ${data.length} registros • Exportado em ${new Date().toLocaleString('pt-BR')}`]);
  const summaryCell = summaryRow.getCell(1);
  summaryCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: GRAY_TEXT } };
  sheet.mergeCells(summaryRow.number, 1, summaryRow.number, columns.length);

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, `${filename}.xlsx`);
}

export function exportToPDF({ title, subtitle, columns, data, filename }: ExportOptions) {
  const doc = new jsPDF({ orientation: data[0] && columns.length > 5 ? 'landscape' : 'portrait' });

  // Gold header bar
  doc.setFillColor(245, 166, 35); // GOLD_PRIMARY
  doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 18);

  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(subtitle, 14, 26);
  }

  // Table
  autoTable(doc, {
    startY: 36,
    head: [columns.map(c => c.header)],
    body: data.map(row => columns.map(c => String(row[c.key] ?? ''))),
    headStyles: {
      fillColor: [196, 132, 28], // GOLD_DARK
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [26, 26, 26],
    },
    alternateRowStyles: {
      fillColor: [254, 243, 214], // GOLD_LIGHT
    },
    styles: {
      cellPadding: 4,
      lineColor: [229, 229, 229],
      lineWidth: 0.3,
    },
    didDrawPage: (data) => {
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(102, 102, 102);
      doc.text(
        `Comanda • ${new Date().toLocaleString('pt-BR')} • Página ${doc.getCurrentPageInfo().pageNumber}`,
        14,
        pageHeight - 10
      );
    },
  });

  doc.save(`${filename}.pdf`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
