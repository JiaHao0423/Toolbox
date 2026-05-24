export type MailPackageRow = {
  serialNo: string
  address: string
  recipient: string
  registeredAt: string
  locationNote: string
}

function normalizeRaw(raw: string): string {
  return raw.replace(/\uFEFF/g, '').replace(/\r\n/g, '\n').trim()
}

export function isMailPackageHeaderLine(line: string): boolean {
  const cells = line.split('\t')
  return cells[0]?.trim() === '#' && cells[1]?.trim() === '戶別'
}

export function isCustodyHeaderLine(line: string): boolean {
  const cells = line.split('\t')
  return cells[0]?.trim() === '#' && cells[1]?.trim() === '寄放人'
}

export function parseMailPackage(raw: string): MailPackageRow[] {
  const normalized = normalizeRaw(raw)
  if (!normalized) {
    return []
  }

  return normalized
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== '')
    .filter((line) => !isMailPackageHeaderLine(line))
    .map((line) => {
      const cells = line.split('\t')
      return {
        serialNo: cells[0]?.trim() ?? '',
        address: cells[1]?.trim() ?? '',
        recipient: cells[3]?.trim() ?? '',
        registeredAt: cells[5]?.trim() ?? '',
        locationNote: cells[6]?.trim() ?? '',
      }
    })
    .filter((row) => row.serialNo !== '' || row.address !== '')
}
