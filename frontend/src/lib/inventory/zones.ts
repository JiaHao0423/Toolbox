import type { InputZoneDefinition, InputZoneId, OutputZoneDefinition, ZoneId } from './types'

export const INPUT_ZONES: InputZoneDefinition[] = [
  {
    id: 'mail',
    title: '一般掛號',
    parser: 'mailPackage',
    placeholder: '貼上一般掛號資料（含標題列亦可）…',
  },
  {
    id: 'package',
    title: '包裹',
    parser: 'mailPackage',
    placeholder: '貼上包裹資料（8號／10號／店面混合皆可）…',
    hint: '依戶別地址自動分類至 A棟／B棟／店面',
  },
  {
    id: 'cash',
    title: '現金',
    parser: 'custody',
    placeholder: '貼上寄放現金資料（含標題列亦可）…',
    hint: '依寄放人地址自動分類至 A棟／B棟／店面',
  },
  {
    id: 'non-cash',
    title: '非現金',
    parser: 'custody',
    placeholder: '貼上寄放非現金資料（含標題列亦可）…',
  },
]

export const OUTPUT_ZONES: OutputZoneDefinition[] = [
  { id: 'mail', title: '一般掛號' },
  { id: 'pkg-a', title: 'A棟包裹' },
  { id: 'pkg-b', title: 'B棟包裹' },
  { id: 'pkg-shop', title: '店面包裹' },
  { id: 'cash-a', title: 'A棟現金' },
  { id: 'cash-b', title: 'B棟現金' },
  { id: 'cash-shop', title: '店面現金' },
  { id: 'custody-other', title: '寄放非現金' },
]

const PACKAGE_ZONE_BY_BUILDING = {
  a: 'pkg-a',
  b: 'pkg-b',
  shop: 'pkg-shop',
} as const satisfies Record<'a' | 'b' | 'shop', ZoneId>

const CASH_ZONE_BY_BUILDING = {
  a: 'cash-a',
  b: 'cash-b',
  shop: 'cash-shop',
} as const satisfies Record<'a' | 'b' | 'shop', ZoneId>

export function packageZoneForBuilding(building: 'a' | 'b' | 'shop'): ZoneId {
  return PACKAGE_ZONE_BY_BUILDING[building]
}

export function cashZoneForBuilding(building: 'a' | 'b' | 'shop'): ZoneId {
  return CASH_ZONE_BY_BUILDING[building]
}

export function createEmptyInputZoneInputs(): Record<InputZoneId, string> {
  return INPUT_ZONES.reduce(
    (acc, zone) => {
      acc[zone.id] = ''
      return acc
    },
    {} as Record<InputZoneId, string>,
  )
}
