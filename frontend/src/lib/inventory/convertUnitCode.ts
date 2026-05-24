const RESIDENTIAL_PATTERN = /^(8|10)號(\d+)樓之(\d+)/
const SHOP_PATTERN = /\(店(\d+)\)/

export function convertUnitCode(address: string): { code: string; converted: boolean } {
  const trimmed = address.trim()
  if (!trimmed) {
    return { code: '', converted: false }
  }

  const shopMatch = trimmed.match(SHOP_PATTERN)
  if (shopMatch) {
    return { code: `店${shopMatch[1]}`, converted: true }
  }

  const residentialMatch = trimmed.match(RESIDENTIAL_PATTERN)
  if (residentialMatch) {
    const building = residentialMatch[1]
    const floor = residentialMatch[2]
    const unit = residentialMatch[3]
    const letter = building === '8' ? 'A' : 'B'
    return { code: `${floor}${letter}${unit}`, converted: true }
  }

  if (trimmed === '管理室') {
    return { code: '管理室', converted: true }
  }

  return { code: trimmed, converted: false }
}

export function extractAddressFromText(text: string): string {
  const lines = text.split('\n').map((line) => line.trim())
  for (const line of lines) {
    if (RESIDENTIAL_PATTERN.test(line) || SHOP_PATTERN.test(line) || line === '管理室') {
      return line
    }
  }

  const inlineResidential = text.match(/(?:8|10)號\d+樓之\d+/)
  if (inlineResidential) {
    return inlineResidential[0]
  }

  const inlineShop = text.match(/\(店\d+\)[^\t\n]*/)
  if (inlineShop) {
    return inlineShop[0]
  }

  return ''
}
