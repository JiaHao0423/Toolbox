const FONT_FILE = 'SimHei.ttf'
const FONT_VFS_NAME = 'SimHei.ttf'
const FONT_FAMILY = 'SimHei'

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

export async function loadPdfChineseFontBase64(): Promise<string> {
  if (cachedBase64) {
    return cachedBase64
  }

  const response = await fetch(`/fonts/${FONT_FILE}`)
  if (!response.ok) {
    throw new Error(
      `無法載入 PDF 字型（/fonts/${FONT_FILE}）。請在 frontend 執行 npm run setup:pdf-font`,
    )
  }

  const buffer = await response.arrayBuffer()
  if (buffer.byteLength < 1024) {
    throw new Error(`PDF 字型檔案過小（/fonts/${FONT_FILE}），請重新建置前端`)
  }

  const header = new Uint8Array(buffer, 0, 4)
  if (header[0] !== 0x00 || header[1] !== 0x01) {
    throw new Error(`PDF 字型格式無效（/fonts/${FONT_FILE}），需要有效的 TTF`)
  }

  cachedBase64 = await arrayBufferToBase64(buffer)
  return cachedBase64
}

export function registerPdfChineseFont(doc: import('jspdf').jsPDF, base64: string): void {
  doc.addFileToVFS(FONT_VFS_NAME, base64)
  doc.addFont(FONT_VFS_NAME, FONT_FAMILY, 'normal')
  doc.setFont(FONT_FAMILY, 'normal')
}

export const PDF_FONT_FAMILY = FONT_FAMILY
