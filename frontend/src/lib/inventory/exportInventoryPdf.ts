import type { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { OUTPUT_HEADERS } from './types'
import type { OutputRow, PdfSection } from './types'
import { loadPdfChineseFontBase64, PDF_FONT_FAMILY, registerPdfChineseFont } from './pdfFont'

export type PdfExportOptions = {
  title: string
  orientation: 'portrait' | 'landscape'
  filename?: string
}

const TABLE_FONT = PDF_FONT_FAMILY

export function formatExportDate() {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

export function buildPdfFilename(title: string) {
  const safeTitle = title.trim() || '盤點表'
  const date = new Date().toISOString().slice(0, 10)
  return `${safeTitle}-${date}.pdf`
}

async function savePdfBlob(blob: Blob, filename: string): Promise<void> {
  const savePicker = window.showSaveFilePicker
  if (savePicker) {
    try {
      const handle = await savePicker({
        suggestedName: filename,
        types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
    }
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function rowToTableCells(row: OutputRow): string[] {
  return ['□', row.serialNo, row.unitCode, row.recipient, row.registeredAt, row.location]
}

function addSectionTable(doc: jsPDF, section: PdfSection, startY: number): number {
  doc.setFont(TABLE_FONT, 'normal')
  doc.setFontSize(11)
  doc.text(`【${section.title}】`, 14, startY)

  autoTable(doc, {
    startY: startY + 4,
    head: [OUTPUT_HEADERS.slice()],
    body: section.rows.map(rowToTableCells),
    styles: {
      font: TABLE_FONT,
      fontStyle: 'normal',
      fontSize: 8,
      cellPadding: 1.5,
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      font: TABLE_FONT,
      fontStyle: 'normal',
      fillColor: [244, 244, 245],
      textColor: [24, 24, 27],
    },
    bodyStyles: {
      font: TABLE_FONT,
      fontStyle: 'normal',
    },
    willDrawCell: (data) => {
      data.doc.setFont(TABLE_FONT, 'normal')
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 14 },
      2: { cellWidth: 22 },
      4: { cellWidth: 28 },
    },
    margin: { left: 14, right: 14 },
  })

  return doc.lastAutoTable?.finalY ?? startY
}

/** 以 jsPDF 直接繪製表格，避免 html2canvas 造成頁面卡住 */
export async function exportInventoryPdf(
  sections: PdfSection[],
  options: PdfExportOptions,
): Promise<void> {
  const filename = options.filename ?? buildPdfFilename(options.title)
  const fontBase64 = await loadPdfChineseFontBase64()

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: options.orientation,
  })

  registerPdfChineseFont(doc, fontBase64)

  doc.setFont(TABLE_FONT, 'normal')
  doc.setFontSize(16)
  doc.text(options.title, 14, 16)

  doc.setFontSize(9)
  doc.setTextColor(113, 113, 122)
  doc.text(`匯出時間：${formatExportDate()}`, 14, 22)
  doc.setTextColor(24, 24, 27)

  let cursorY = 28

  for (const section of sections) {
    const pageHeight = doc.internal.pageSize.getHeight()
    if (cursorY > pageHeight - 40) {
      doc.addPage()
      cursorY = 16
    }
    cursorY = addSectionTable(doc, section, cursorY) + 10
  }

  const blob = doc.output('blob')
  await savePdfBlob(blob, filename)
}
