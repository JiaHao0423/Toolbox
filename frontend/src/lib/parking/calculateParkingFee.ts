export type ParkingFeeResult = {
  fee: number
  durationMinutes: number
  isOvernight: boolean
  isOverSixHours: boolean
  isFlatRate: boolean
  chargeableHalfHours: number
}

const MINUTES_PER_DAY = 24 * 60
const FREE_MINUTES = 30
const HALF_HOUR_RATE = 10
const MAX_REGULAR_MINUTES = 6 * 60
const FLAT_RATE = 500

export function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (!match) {
    return null
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (hours > 23 || minutes > 59) {
    return null
  }

  return hours * 60 + minutes
}

export function calculateDurationMinutes(startMinutes: number, endMinutes: number): {
  durationMinutes: number
  isOvernight: boolean
} {
  if (endMinutes > startMinutes) {
    return {
      durationMinutes: endMinutes - startMinutes,
      isOvernight: false,
    }
  }

  if (endMinutes === startMinutes) {
    return {
      durationMinutes: 0,
      isOvernight: false,
    }
  }

  return {
    durationMinutes: MINUTES_PER_DAY - startMinutes + endMinutes,
    isOvernight: true,
  }
}

export function calculateParkingFee(startTime: string, endTime: string): ParkingFeeResult | null {
  const startMinutes = parseTimeToMinutes(startTime)
  const endMinutes = parseTimeToMinutes(endTime)

  if (startMinutes === null || endMinutes === null) {
    return null
  }

  const { durationMinutes, isOvernight } = calculateDurationMinutes(startMinutes, endMinutes)
  const isOverSixHours = durationMinutes > MAX_REGULAR_MINUTES
  const isFlatRate = isOvernight || isOverSixHours

  if (isFlatRate) {
    return {
      fee: FLAT_RATE,
      durationMinutes,
      isOvernight,
      isOverSixHours,
      isFlatRate: true,
      chargeableHalfHours: 0,
    }
  }

  if (durationMinutes <= FREE_MINUTES) {
    return {
      fee: 0,
      durationMinutes,
      isOvernight,
      isOverSixHours,
      isFlatRate: false,
      chargeableHalfHours: 0,
    }
  }

  const chargeableMinutes = durationMinutes - FREE_MINUTES
  const chargeableHalfHours = Math.ceil(chargeableMinutes / 30)

  return {
    fee: chargeableHalfHours * HALF_HOUR_RATE,
    durationMinutes,
    isOvernight,
    isOverSixHours,
    isFlatRate: false,
    chargeableHalfHours,
  }
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes} 分鐘`
  }

  if (remainingMinutes === 0) {
    return `${hours} 小時`
  }

  return `${hours} 小時 ${remainingMinutes} 分鐘`
}
