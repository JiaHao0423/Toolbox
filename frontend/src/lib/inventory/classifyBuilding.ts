import { extractAddressFromText } from './convertUnitCode'

const SHOP_PATTERN = /\(店\d+\)/

export type BuildingKind = 'a' | 'b' | 'shop'

export function classifyBuildingFromAddress(address: string): BuildingKind | null {
  const trimmed = address.trim()
  if (!trimmed) {
    return null
  }

  if (SHOP_PATTERN.test(trimmed)) {
    return 'shop'
  }

  if (trimmed.startsWith('8號')) {
    return 'a'
  }

  if (trimmed.startsWith('10號')) {
    return 'b'
  }

  return null
}

export function classifyBuildingFromText(text: string): BuildingKind | null {
  return classifyBuildingFromAddress(extractAddressFromText(text))
}
