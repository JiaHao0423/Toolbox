import { classifyBuildingFromAddress, classifyBuildingFromText } from './classifyBuilding'
import { cleanMailLocation } from './cleanLocation'
import { convertUnitCode } from './convertUnitCode'
import {
  extractCashAmount,
  extractNonCashCategory,
  isCashCustodyType,
  isNonCashCustodyType,
  parseCustody,
  resolveCustodyRecipient,
  resolveCustodyUnitAddress,
} from './parseCustody'
import { parseMailPackage } from './parseMailPackage'
import { sortRowsBySerialNo } from './sortRows'
import type { InputZoneInputs, OutputRow, ParseAllZonesResult, ZoneId } from './types'
import { cashZoneForBuilding, OUTPUT_ZONES, packageZoneForBuilding } from './zones'

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
  const addressSource = resolveCustodyUnitAddress(row)
  const unit = convertUnitCode(addressSource)

  return {
    serialNo: row.serialNo,
    unitCode: unit.code || addressSource,
    unitCodeConverted: unit.converted,
    recipient: resolveCustodyRecipient(row),
    registeredAt: row.registeredAt,
    location: row.location,
    amount: extractCashAmount(row.custodyType),
    itemCategory: extractNonCashCategory(row.custodyType),
  }
}

function appendRows(bucket: Map<ZoneId, OutputRow[]>, zoneId: ZoneId, rows: OutputRow[]) {
  if (rows.length === 0) {
    return
  }

  const existing = bucket.get(zoneId) ?? []
  bucket.set(zoneId, [...existing, ...rows])
}

function countUnconverted(rows: OutputRow[]): number {
  return rows.filter((row) => row.unitCode && !row.unitCodeConverted).length
}

export function parseAllZones(inputs: InputZoneInputs): ParseAllZonesResult {
  const warnings: string[] = []
  const bucket = new Map<ZoneId, OutputRow[]>()

  const mailRaw = inputs.mail?.trim() ?? ''
  if (mailRaw) {
    const rows = sortRowsBySerialNo(parseMailPackage(mailRaw).map(mapMailPackageRow))
    if (rows.length === 0) {
      warnings.push('「一般掛號」無法解析任何資料列')
    } else {
      appendRows(bucket, 'mail', rows)
      const unconverted = countUnconverted(rows)
      if (unconverted > 0) {
        warnings.push(`「一般掛號」有 ${unconverted} 筆戶別未能轉換代號`)
      }
    }
  }

  const packageRaw = inputs.package?.trim() ?? ''
  if (packageRaw) {
    const parsed = parseMailPackage(packageRaw)
    if (parsed.length === 0) {
      warnings.push('「包裹」無法解析任何資料列')
    }

    for (const rawRow of parsed) {
      const building = classifyBuildingFromAddress(rawRow.address)
      if (!building) {
        warnings.push(`包裹編號 ${rawRow.serialNo || '（空白）'} 無法辨識 A棟／B棟／店面`)
        continue
      }

      appendRows(bucket, packageZoneForBuilding(building), [mapMailPackageRow(rawRow)])
    }

    for (const zone of OUTPUT_ZONES.filter((item) => item.id.startsWith('pkg-'))) {
      const rows = bucket.get(zone.id)
      if (!rows) {
        continue
      }

      bucket.set(zone.id, sortRowsBySerialNo(rows))
      const unconverted = countUnconverted(rows)
      if (unconverted > 0) {
        warnings.push(`「${zone.title}」有 ${unconverted} 筆戶別未能轉換代號`)
      }
    }
  }

  const cashRaw = inputs.cash?.trim() ?? ''
  if (cashRaw) {
    const parsed = parseCustody(cashRaw)
    if (parsed.length === 0) {
      warnings.push('「現金」無法解析任何資料列')
    }

    let cashRowCount = 0
    for (const rawRow of parsed) {
      if (!isCashCustodyType(rawRow.custodyType)) {
        continue
      }

      cashRowCount += 1
      const building = classifyBuildingFromText(rawRow.depositor) ?? classifyBuildingFromText(rawRow.pickup)
      if (!building) {
        warnings.push(`現金編號 ${rawRow.serialNo || '（空白）'} 無法辨識 A棟／B棟／店面`)
        continue
      }

      appendRows(bucket, cashZoneForBuilding(building), [mapCustodyRow(rawRow)])
    }

    if (parsed.length > 0 && cashRowCount === 0) {
      warnings.push('「現金」貼上內容中沒有現金類型資料列')
    }

    for (const zone of OUTPUT_ZONES.filter((item) => item.id.startsWith('cash-'))) {
      const rows = bucket.get(zone.id)
      if (!rows) {
        continue
      }

      bucket.set(zone.id, sortRowsBySerialNo(rows))
      const unconverted = countUnconverted(rows)
      if (unconverted > 0) {
        warnings.push(`「${zone.title}」有 ${unconverted} 筆戶別未能轉換代號`)
      }
    }
  }

  const nonCashRaw = inputs['non-cash']?.trim() ?? ''
  if (nonCashRaw) {
    const parsed = parseCustody(nonCashRaw)
    const rows = sortRowsBySerialNo(
      parsed.filter((row) => isNonCashCustodyType(row.custodyType)).map(mapCustodyRow),
    )

    if (parsed.length === 0) {
      warnings.push('「非現金」無法解析任何資料列')
    } else if (rows.length === 0) {
      warnings.push('「非現金」貼上內容中沒有非現金類型資料列')
    } else {
      appendRows(bucket, 'custody-other', rows)
      const unconverted = countUnconverted(rows)
      if (unconverted > 0) {
        warnings.push(`「寄放非現金」有 ${unconverted} 筆戶別未能轉換代號`)
      }
    }
  }

  const sections = OUTPUT_ZONES.flatMap((zone) => {
    const rows = bucket.get(zone.id)
    if (!rows?.length) {
      return []
    }

    return [{ id: zone.id, title: zone.title, rows }]
  })

  return { sections, warnings }
}

export function hasExportableData(inputs: InputZoneInputs): boolean {
  return Object.values(inputs).some((value) => value.trim() !== '')
}
