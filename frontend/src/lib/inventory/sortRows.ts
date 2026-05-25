import type { OutputRow } from './types'

function serialSortKey(serialNo: string): number {
  const trimmed = serialNo.trim()
  if (/^\d+$/.test(trimmed)) {
    return Number.parseInt(trimmed, 10)
  }

  const custodyMatch = trimmed.match(/^B(\d+)$/i)
  if (custodyMatch) {
    return Number.parseInt(custodyMatch[1], 10)
  }

  return Number.MAX_SAFE_INTEGER
}

export function compareSerialNumbers(a: string, b: string): number {
  const keyDiff = serialSortKey(a) - serialSortKey(b)
  if (keyDiff !== 0) {
    return keyDiff
  }

  return a.localeCompare(b, 'zh-Hant', { numeric: true })
}

export function sortRowsBySerialNo(rows: OutputRow[]): OutputRow[] {
  return [...rows].sort((left, right) => compareSerialNumbers(left.serialNo, right.serialNo))
}
