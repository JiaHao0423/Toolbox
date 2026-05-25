export const OUTPUT_HEADERS = ['☐', '編號', '收件戶別', '收件人', '登記時間', '位置'] as const

export const CASH_OUTPUT_HEADERS = [
  '☐',
  '編號',
  '收件戶別',
  '金額',
  '收件人',
  '登記時間',
  '位置',
] as const

export const NON_CASH_OUTPUT_HEADERS = [
  '☐',
  '編號',
  '收件戶別',
  '收件人',
  '物品分類',
  '登記時間',
  '位置',
] as const

export type OutputRow = {
  serialNo: string
  unitCode: string
  unitCodeConverted: boolean
  recipient: string
  registeredAt: string
  location: string
  amount?: string
  itemCategory?: string
}

export type PdfSection = {
  id: ZoneId
  title: string
  rows: OutputRow[]
}

export type ZoneId =
  | 'mail'
  | 'pkg-a'
  | 'pkg-b'
  | 'pkg-shop'
  | 'cash-a'
  | 'cash-b'
  | 'cash-shop'
  | 'custody-other'

export type InputZoneId = 'mail' | 'package' | 'cash' | 'non-cash'

export type ZoneParser = 'mailPackage' | 'custody'

export type OutputZoneDefinition = {
  id: ZoneId
  title: string
}

export type InputZoneDefinition = {
  id: InputZoneId
  title: string
  parser: ZoneParser
  placeholder: string
  hint?: string
}

export type InputZoneInputs = Record<InputZoneId, string>

export type ParseAllZonesResult = {
  sections: PdfSection[]
  warnings: string[]
}

export function getSectionHeaders(zoneId: ZoneId): readonly string[] {
  if (zoneId.startsWith('cash-')) {
    return CASH_OUTPUT_HEADERS
  }

  if (zoneId === 'custody-other') {
    return NON_CASH_OUTPUT_HEADERS
  }

  return OUTPUT_HEADERS
}

export function rowToDisplayCells(zoneId: ZoneId, row: OutputRow): string[] {
  if (zoneId.startsWith('cash-')) {
    return [
      '□',
      row.serialNo,
      row.unitCode,
      row.amount ?? '',
      row.recipient,
      row.registeredAt,
      row.location,
    ]
  }

  if (zoneId === 'custody-other') {
    return [
      '□',
      row.serialNo,
      row.unitCode,
      row.recipient,
      row.itemCategory ?? '',
      row.registeredAt,
      row.location,
    ]
  }

  return ['□', row.serialNo, row.unitCode, row.recipient, row.registeredAt, row.location]
}
