import type { ZoneDefinition, ZoneId } from './types'

export const INVENTORY_ZONES: ZoneDefinition[] = [
  {
    id: 'mail',
    title: '一般掛號',
    parser: 'mailPackage',
    placeholder: '貼上一般掛號資料（含標題列亦可）…',
  },
  {
    id: 'pkg-a',
    title: 'A棟包裹',
    parser: 'mailPackage',
    placeholder: '貼上 8號 包裹資料…',
  },
  {
    id: 'pkg-b',
    title: 'B棟包裹',
    parser: 'mailPackage',
    placeholder: '貼上 10號 包裹資料…',
  },
  {
    id: 'pkg-shop',
    title: '店面包裹',
    parser: 'mailPackage',
    placeholder: '貼上店面包裹資料…',
  },
  {
    id: 'cash-a',
    title: 'A棟現金',
    parser: 'custody',
    placeholder: '貼上 A棟寄放現金資料…',
  },
  {
    id: 'cash-b',
    title: 'B棟現金',
    parser: 'custody',
    placeholder: '貼上 B棟寄放現金資料…',
  },
  {
    id: 'cash-shop',
    title: '店面現金',
    parser: 'custody',
    placeholder: '貼上店面寄放現金資料…',
  },
  {
    id: 'custody-other',
    title: '寄放非現金',
    parser: 'custody',
    placeholder: '貼上寄放非現金資料…',
  },
]

export function createEmptyZoneInputs(): Record<ZoneId, string> {
  return INVENTORY_ZONES.reduce(
    (acc, zone) => {
      acc[zone.id] = ''
      return acc
    },
    {} as Record<ZoneId, string>,
  )
}
