import { isCustodyHeaderLine } from './parseMailPackage'

export type CustodyRow = {
  serialNo: string
  depositor: string
  pickup: string
  custodyType: string
  registeredAt: string
  location: string
}

export function extractCashAmount(custodyType: string): string {
  const match = custodyType.match(/^現金\(([^)]+)\)/)
  return match?.[1]?.trim() ?? ''
}

export function extractNonCashCategory(custodyType: string): string {
  const match = custodyType.match(/^非現金\(([^)]+)\)/)
  return match?.[1]?.trim() ?? ''
}

export function isCashCustodyType(custodyType: string): boolean {
  return custodyType.startsWith('現金(')
}

export function isNonCashCustodyType(custodyType: string): boolean {
  return custodyType.startsWith('非現金(')
}

const TIME_PATTERN = /\d{4}\/\d{2}\/\d{2}\s+\d{1,2}:\d{2}/

function normalizeRaw(raw: string): string {
  return raw.replace(/\uFEFF/g, '').replace(/\r\n/g, '\n').trim()
}

function isRecordStart(line: string): boolean {
  const id = line.split('\t')[0]?.trim() ?? ''
  return /^B\d+$/.test(id)
}

export function splitCustodyRecords(raw: string): string[] {
  const lines = normalizeRaw(raw)
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== '' && !isCustodyHeaderLine(line))

  const records: string[] = []
  let buffer: string[] = []

  for (const line of lines) {
    if (isRecordStart(line)) {
      if (buffer.length > 0) {
        records.push(buffer.join('\n'))
      }
      buffer = [line]
      continue
    }

    if (buffer.length > 0) {
      buffer.push(line)
    }
  }

  if (buffer.length > 0) {
    records.push(buffer.join('\n'))
  }

  return records
}

function extractBracketName(text: string): string {
  const match = text.match(/【([^】]+)】/)
  return match?.[1]?.trim() ?? text.replace(/[【】]/g, '').trim()
}

function extractAllBracketNames(text: string): string[] {
  return [...text.matchAll(/【([^】]+)】/g)].map((match) => match[1]?.trim() ?? '').filter(Boolean)
}

export function parseCustodyRecord(record: string): CustodyRow {
  const lines = record.split('\n').map((line) => line.trimEnd())
  const serialNo = lines[0]?.split('\t')[0]?.trim() ?? ''

  const timeMatch = record.match(TIME_PATTERN)
  const registeredAt = timeMatch?.[0] ?? ''

  const [, afterTime = ''] = registeredAt ? record.split(registeredAt) : [record, '']

  const location =
    afterTime
      .split('\t')
      .map((part) => part.trim())
      .find((part) => part !== '' && !part.startsWith('【')) ?? ''

  const depositorParts: string[] = []
  const pickupParts: string[] = []
  let foundType = false
  let custodyType = ''

  for (const line of lines) {
    const cells = line.split('\t').map((cell) => cell.trim())
    const startIndex = line === lines[0] ? 1 : 0

    for (let index = startIndex; index < cells.length; index += 1) {
      const cell = cells[index] ?? ''
      if (!cell) {
        continue
      }

      if (cell === registeredAt || TIME_PATTERN.test(cell)) {
        continue
      }

      if (/^(現金|非現金)\(/.test(cell)) {
        custodyType = cell
        foundType = true
        continue
      }

      if (cell === location) {
        continue
      }

      if (!foundType) {
        depositorParts.push(cell)
      } else {
        pickupParts.push(cell)
      }
    }
  }

  const depositorText = depositorParts.join('\n')
  let pickupText = pickupParts.join('\n')

  if (!extractAddressFromDepositor(depositorText) && pickupText) {
    const pickupAddress = extractAddressFromDepositor(pickupText)
    if (pickupAddress) {
      if (!depositorParts.length) {
        depositorParts.push(pickupAddress)
      }
    }
  }

  return {
    serialNo,
    depositor: depositorText,
    pickup: pickupText,
    custodyType,
    registeredAt,
    location,
  }
}

function extractAddressFromDepositor(text: string): string {
  const lines = text.split('\n').map((line) => line.trim())
  for (const line of lines) {
    if (/^(?:8|10)號\d+樓之\d+/.test(line) || /\(店\d+\)/.test(line) || line === '管理室') {
      return line.match(/^(?:8|10)號\d+樓之\d+|\(店\d+\)[^\t\n]*|管理室/)?.[0] ?? line
    }
  }
  return ''
}

export function resolveCustodyRecipient(row: CustodyRow): string {
  const depositorNames = extractAllBracketNames(row.depositor)
  if (depositorNames.length > 0) {
    return depositorNames[0] ?? ''
  }

  const pickupNames = extractAllBracketNames(row.pickup)
  if (pickupNames.length > 0) {
    return pickupNames[0] ?? ''
  }

  const pickupPlain = row.pickup.replace(/^(?:8|10)號\d+樓之\d+.*$/m, '').trim()
  if (pickupPlain && !/^(現金|非現金)\(/.test(pickupPlain)) {
    return extractBracketName(pickupPlain)
  }

  return ''
}

export function parseCustody(raw: string): CustodyRow[] {
  return splitCustodyRecords(raw).map(parseCustodyRecord)
}
