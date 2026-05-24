import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const targetDir = join(root, 'public', 'fonts')
const target = join(targetDir, 'SimHei.ttf')

const sources = [
  process.env.PDF_FONT_SOURCE,
  join(root, 'public', 'fonts', 'SimHei.ttf'),
  'C:\\Windows\\Fonts\\simhei.ttf',
  '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc',
  '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc',
  '/usr/share/fonts/truetype/arphic/ukai.ttc',
].filter(Boolean)

mkdirSync(targetDir, { recursive: true })

for (const source of sources) {
  if (!existsSync(source)) {
    continue
  }
  if (source === target) {
    console.log(`PDF 字型已存在：${target}`)
    process.exit(0)
  }
  copyFileSync(source, target)
  console.log(`PDF 字型已複製：${source} → ${target}`)
  process.exit(0)
}

console.error(
  '找不到 PDF 字型。Windows 請執行 npm run setup:pdf-font；Docker 建置時需安裝 fonts-wqy-microhei',
)
process.exit(1)
