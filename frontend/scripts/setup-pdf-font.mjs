import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const targetDir = join(root, 'public', 'fonts')
const target = join(targetDir, 'SimHei.ttf')

/** jsPDF 需要含 unicode cmap 的 TTF，不能用 .ttc 改名 */
const DOWNLOAD_URL =
  'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/TTF/TraditionalChinese/NotoSansTC-Regular.ttf'

function isValidTtf(filePath) {
  if (!existsSync(filePath) || !filePath.toLowerCase().endsWith('.ttf')) {
    return false
  }
  const header = readFileSync(filePath).subarray(0, 4)
  return header[0] === 0x00 && header[1] === 0x01 && header[2] === 0x00 && header[3] === 0x00
}

const sources = [
  process.env.PDF_FONT_SOURCE,
  target,
  'C:\\Windows\\Fonts\\simhei.ttf',
  '/usr/share/fonts/truetype/micro/simhei.ttf',
].filter(Boolean)

mkdirSync(targetDir, { recursive: true })

for (const source of sources) {
  if (!source || !existsSync(source)) {
    continue
  }
  if (source === target && isValidTtf(target)) {
    console.log(`PDF 字型已存在：${target}`)
    process.exit(0)
  }
  if (!isValidTtf(source)) {
    continue
  }
  copyFileSync(source, target)
  console.log(`PDF 字型已複製：${source} → ${target}`)
  process.exit(0)
}

console.log(`正在下載 PDF 字型：${DOWNLOAD_URL}`)
const response = await fetch(DOWNLOAD_URL)
if (!response.ok) {
  console.error(`PDF 字型下載失敗（HTTP ${response.status}）`)
  process.exit(1)
}

const buffer = Buffer.from(await response.arrayBuffer())
if (buffer.length < 1024 || buffer[0] !== 0x00 || buffer[1] !== 0x01) {
  console.error('PDF 字型下載內容無效（不是有效的 TTF）')
  process.exit(1)
}

writeFileSync(target, buffer)
console.log(`PDF 字型已下載：${target}（${(buffer.length / 1024 / 1024).toFixed(1)} MB）`)
