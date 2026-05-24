import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const targetDir = join(root, 'public', 'fonts')
const target = join(targetDir, 'SimHei.ttf')

/** jsPDF 需要含 unicode cmap 的 TTF，不能把 .ttc 直接改名 */
const DOWNLOAD_URLS = [
  'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/TTF/TraditionalChinese/NotoSansTC-Regular.ttf',
  'https://github.com/notofonts/noto-cjk/raw/main/Sans/TTF/TraditionalChinese/NotoSansTC-Regular.ttf',
]

const TTC_SOURCES = [
  '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc',
  '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc',
]

function isValidTtf(filePath) {
  if (!existsSync(filePath) || !filePath.toLowerCase().endsWith('.ttf')) {
    return false
  }
  const header = readFileSync(filePath).subarray(0, 4)
  return header[0] === 0x00 && header[1] === 0x01 && header[2] === 0x00 && header[3] === 0x00
}

function copyValidTtf(source) {
  copyFileSync(source, target)
  console.log(`PDF 字型已複製：${source} → ${target}`)
}

function extractTtcToTtf(ttcPath) {
  console.log(`正在從 TTC 提取 PDF 字型：${ttcPath}`)
  execSync(
    `python3 -c "from fontTools.ttLib import TTFont; import sys; TTFont(sys.argv[1], fontNumber=0).save(sys.argv[2])" "${ttcPath}" "${target}"`,
    { stdio: 'inherit' },
  )
  if (!isValidTtf(target)) {
    throw new Error('TTC 提取結果不是有效的 TTF')
  }
  console.log(`PDF 字型已提取：${target}`)
}

async function downloadTtf() {
  for (const url of DOWNLOAD_URLS) {
    console.log(`正在下載 PDF 字型：${url}`)
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Toolbox-pdf-font-setup/1.0',
          Accept: '*/*',
        },
        redirect: 'follow',
      })
      if (!response.ok) {
        console.warn(`下載失敗（HTTP ${response.status}）：${url}`)
        continue
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      if (buffer.length < 1024 || buffer[0] !== 0x00 || buffer[1] !== 0x01) {
        console.warn(`下載內容無效：${url}`)
        continue
      }

      writeFileSync(target, buffer)
      console.log(`PDF 字型已下載：${target}（${(buffer.length / 1024 / 1024).toFixed(1)} MB）`)
      return true
    } catch (error) {
      console.warn(`下載錯誤：${url}`, error)
    }
  }
  return false
}

mkdirSync(targetDir, { recursive: true })

const ttfSources = [
  process.env.PDF_FONT_SOURCE,
  target,
  'C:\\Windows\\Fonts\\simhei.ttf',
  '/usr/share/fonts/truetype/micro/simhei.ttf',
].filter(Boolean)

for (const source of ttfSources) {
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
  copyValidTtf(source)
  process.exit(0)
}

for (const ttcPath of TTC_SOURCES) {
  if (!existsSync(ttcPath)) {
    continue
  }
  try {
    extractTtcToTtf(ttcPath)
    process.exit(0)
  } catch (error) {
    console.warn(`TTC 提取失敗：${ttcPath}`, error)
  }
}

if (await downloadTtf()) {
  process.exit(0)
}

console.error(
  '無法準備 PDF 字型。本機 Windows 請執行 npm run setup:pdf-font；Docker 需安裝 fonts-wqy-microhei 與 python3-fonttools。',
)
process.exit(1)
