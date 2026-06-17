import { useMemo, useState } from 'react'
import { ToolPageShell } from '../components/layout/AppShell'
import {
  calculateParkingFee,
  formatDuration,
} from '../lib/parking/calculateParkingFee'
import './ParkingFeePage.scss'

const rules = [
  { label: '免費時段', value: '前 30 分鐘免費' },
  { label: '計費方式', value: '之後每 30 分鐘 10 元' },
  { label: '上限費率', value: '超過 6 小時或隔夜固定 500 元' },
]

function buildResultDetail(result: NonNullable<ReturnType<typeof calculateParkingFee>>): string {
  const durationText = formatDuration(result.durationMinutes)

  if (result.isFlatRate) {
    const reasons: string[] = []
    if (result.isOvernight) {
      reasons.push('隔夜停車')
    }
    if (result.isOverSixHours) {
      reasons.push('超過 6 小時')
    }
    return `停車 ${durationText}，適用固定費率（${reasons.join('、')}）`
  }

  if (result.fee === 0) {
    return `停車 ${durationText}，仍在免費時段內`
  }

  return `停車 ${durationText}，扣除免費 30 分鐘後計 ${result.chargeableHalfHours} 個半小時`
}

export default function ParkingFeePage() {
  const [startTime, setStartTime] = useState('19:37')
  const [endTime, setEndTime] = useState('01:56')

  const result = useMemo(
    () => calculateParkingFee(startTime, endTime),
    [startTime, endTime],
  )

  return (
    <ToolPageShell
      title="停車費計算"
      description="輸入進場與離場時間（僅需時分，不需日期），自動依停車時長計算費用。"
    >
      <div className="parking-page">
        <section className="parking-page__rules">
          {rules.map((rule) => (
            <div key={rule.label} className="parking-page__rule-card">
              <p className="parking-page__rule-label">{rule.label}</p>
              <p className="parking-page__rule-value">{rule.value}</p>
            </div>
          ))}
        </section>

        <section className="parking-page__calculator">
          <div className="parking-page__form">
            <label className="parking-page__field">
              <span className="parking-page__field-label">起始時間</span>
              <input
                type="time"
                className="parking-page__input"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </label>

            <label className="parking-page__field">
              <span className="parking-page__field-label">結束時間</span>
              <input
                type="time"
                className="parking-page__input"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </label>
          </div>

          {result && (
            <div className="parking-page__result">
              <p className="parking-page__result-label">應付停車費</p>
              <p className="parking-page__result-fee">NT$ {result.fee}</p>
              <p className="parking-page__result-detail">{buildResultDetail(result)}</p>
              {result.isOvernight && (
                <p className="parking-page__result-note">
                  結束時間早於起始時間時，視為隔日離場。
                </p>
              )}
            </div>
          )}
        </section>

        <p className="parking-page__example">
          範例：{' '}
          <span className="parking-page__example-code">19:37 → 01:56</span>{' '}
          為隔夜停車 6 小時 19 分鐘，適用固定費率 NT$ 500。
        </p>
      </div>
    </ToolPageShell>
  )
}
