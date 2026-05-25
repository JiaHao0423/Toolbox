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

/** 僅擷取 8號／10號／店面地址，不含管理室 */
export function extractResidentialOrShopAddress(text: string): string {
  const lines = text.split('\n').map((line) => line.trim())
  for (const line of lines) {
    if (RESIDENTIAL_PATTERN.test(line)) {
      return line.match(/^(?:8|10)號\d+樓之\d+/)?.[0] ?? line
    }

    if (SHOP_PATTERN.test(line)) {
      return line.match(/\(店\d+\)[^\t\n]*/)?.[0] ?? line
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

export function extractAddressFromText(text: string): string {
  const unitAddress = extractResidentialOrShopAddress(text)
  if (unitAddress) {
    return unitAddress
  }

  const lines = text.split('\n').map((line) => line.trim())
  for (const line of lines) {
    if (line === '管理室') {
      return line
    }
  }

  if (text.includes('管理室')) {
    return '管理室'
  }

  return ''
}
