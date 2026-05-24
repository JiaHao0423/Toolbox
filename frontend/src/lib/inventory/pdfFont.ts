const FONT_VFS_NAME = 'PdfChinese.ttf'
const FONT_FAMILY = 'PdfChinese'

let cachedBase64: string | null = null

function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      if (typeof dataUrl !== 'string') {
        reject(new Error('字型轉換失敗'))
        return
      }
      const base64 = dataUrl.split(',')[1]
      if (!base64) {
        reject(new Error('字型轉換失敗'))
        return
      }
      resolve(base64)
    }
    reader.onerror = () => reject(reader.error ?? new Error('字型讀取失敗'))
    reader.readAsDataURL(new Blob([buffer]))
  })
}

async function loadEmbeddedFontBase64(): Promise<string | null> {
  const { PDF_FONT_BASE64 } = await import('./pdfFontData.generated')
  if (PDF_FONT_BASE64.length > 1024) {
    return PDF_FONT_BASE64
  }
  return null
}

async function loadFontBase64FromFetch(): Promise<string> {
  const response = await fetch('/fonts/SimHei.ttf')
  if (!response.ok) {
    throw new Error('無法載入 PDF 字型。請執行 npm run setup:pdf-font 後重新建置。')
  }

  const buffer = await response.arrayBuffer()
  if (buffer.byteLength < 1024) {
    throw new Error('PDF 字型檔案無效，請重新建置前端。')
  }

  const header = new Uint8Array(buffer, 0, 4)
  if (header[0] !== 0x00 || header[1] !== 0x01) {
    throw new Error('PDF 字型格式無效，需要有效的 TTF。')
  }

  return arrayBufferToBase64(buffer)
}

export async function loadPdfChineseFontBase64(): Promise<string> {
  if (cachedBase64) {
    return cachedBase64
  }

  const embedded = await loadEmbeddedFontBase64()
  if (embedded) {
    cachedBase64 = embedded
    return cachedBase64
  }

  cachedBase64 = await loadFontBase64FromFetch()
  return cachedBase64
}

export function registerPdfChineseFont(doc: import('jspdf').jsPDF, base64: string): void {
  doc.addFileToVFS(FONT_VFS_NAME, base64)

  for (const style of ['normal', 'bold', 'italic', 'bolditalic'] as const) {
    doc.addFont(FONT_VFS_NAME, FONT_FAMILY, style)
  }

  doc.setFont(FONT_FAMILY, 'normal')

  const fonts = doc.getFontList() as Record<string, unknown>
  if (!fonts[FONT_FAMILY]) {
    throw new Error('PDF 中文字型註冊失敗')
  }

  doc.getTextWidth('測試')
}

export const PDF_FONT_FAMILY = FONT_FAMILY
