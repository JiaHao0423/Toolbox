import { cleanMailLocation } from './cleanLocation'
import { convertUnitCode, extractAddressFromText } from './convertUnitCode'
import { parseCustody, resolveCustodyRecipient } from './parseCustody'
import { parseMailPackage } from './parseMailPackage'
import { INVENTORY_ZONES } from './zones'
import type { OutputRow, ParseAllZonesResult, ZoneInputs, ZoneParser } from './types'

function mapMailPackageRow(row: ReturnType<typeof parseMailPackage>[number]): OutputRow {
  const unit = convertUnitCode(row.address)
  return {
    serialNo: row.serialNo,
    unitCode: unit.code,
    unitCodeConverted: unit.converted,
    recipient: row.recipient,
    registeredAt: row.registeredAt,
    location: cleanMailLocation(row.locationNote),
  }
}

function mapCustodyRow(row: ReturnType<typeof parseCustody>[number]): OutputRow {
  const addressSource =
    extractAddressFromText(row.depositor) || extractAddressFromText(row.pickup)
  const unit = convertUnitCode(addressSource)

  return {
    serialNo: row.serialNo,
    unitCode: unit.code || addressSource,
    unitCodeConverted: unit.converted,
    recipient: resolveCustodyRecipient(row),
    registeredAt: row.registeredAt,
    location: row.location,
  }
}

function parseZone(raw: string, parser: ZoneParser): OutputRow[] {
  if (!raw.trim()) {
    return []
  }

  if (parser === 'mailPackage') {
    return parseMailPackage(raw).map(mapMailPackageRow)
  }

  return parseCustody(raw).map(mapCustodyRow)
}

export function parseAllZones(inputs: ZoneInputs): ParseAllZonesResult {
  const warnings: string[] = []
  const sections = INVENTORY_ZONES.flatMap((zone) => {
    const raw = inputs[zone.id]?.trim() ?? ''
    if (!raw) {
      return []
    }

    const rows = parseZone(raw, zone.parser)
    if (rows.length === 0) {
      warnings.push(`「${zone.title}」無法解析任何資料列`)
      return []
    }

    const unconverted = rows.filter((row) => row.unitCode && !row.unitCodeConverted).length
    if (unconverted > 0) {
      warnings.push(`「${zone.title}」有 ${unconverted} 筆戶別未能轉換代號`)
    }

    return [{ id: zone.id, title: zone.title, rows }]
  })

  return { sections, warnings }
}

export function hasExportableData(inputs: ZoneInputs): boolean {
  return INVENTORY_ZONES.some((zone) => (inputs[zone.id]?.trim() ?? '') !== '')
}
