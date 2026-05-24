export const OUTPUT_HEADERS = ['☐', '編號', '收件戶別', '收件人', '登記時間', '位置'] as const

export type OutputRow = {
  serialNo: string
  unitCode: string
  unitCodeConverted: boolean
  recipient: string
  registeredAt: string
  location: string
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

export type ZoneParser = 'mailPackage' | 'custody'

export type ZoneDefinition = {
  id: ZoneId
  title: string
  parser: ZoneParser
  placeholder: string
}

export type ZoneInputs = Record<ZoneId, string>

export type ParseAllZonesResult = {
  sections: PdfSection[]
  warnings: string[]
}
