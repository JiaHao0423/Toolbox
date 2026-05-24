import { useMemo, useState } from 'react'
import { FileDown, RotateCcw, Sparkles } from 'lucide-react'
import { ToolPageShell } from '../components/layout/AppShell'
import { buildPdfFilename, exportInventoryPdf } from '../lib/inventory/exportInventoryPdf'
import { hasExportableData, parseAllZones } from '../lib/inventory/parseAllZones'
import { OUTPUT_HEADERS } from '../lib/inventory/types'
import type { ZoneId, ZoneInputs } from '../lib/inventory/types'
import { INVENTORY_ZONES, createEmptyZoneInputs } from '../lib/inventory/zones'
import './InventoryAutomationPage.scss'

const workflowSteps = [
  { step: '1', title: '分類複製', detail: '在智生活依類別複製表格' },
  { step: '2', title: '分區貼上', detail: '貼入對應區塊並解析整理' },
  { step: '3', title: '匯出 PDF', detail: '確認預覽後下載盤點表' },
]

export default function InventoryAutomationPage() {
  const [zoneInputs, setZoneInputs] = useState<ZoneInputs>(createEmptyZoneInputs)
  const [reportTitle, setReportTitle] = useState('盤點表')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape')
  const [parsed, setParsed] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportPhase, setExportPhase] = useState<'idle' | 'font' | 'pdf'>('idle')

  const parseResult = useMemo(
    () => (parsed ? parseAllZones(zoneInputs) : { sections: [], warnings: [] }),
    [zoneInputs, parsed],
  )
  const canExport = parsed && parseResult.sections.length > 0

  const updateZone = (zoneId: ZoneId, value: string) => {
    setZoneInputs((current) => ({ ...current, [zoneId]: value }))
    setParsed(false)
  }

  const clearZone = (zoneId: ZoneId) => {
    updateZone(zoneId, '')
  }

  const clearAll = () => {
    setZoneInputs(createEmptyZoneInputs())
    setParsed(false)
  }

  const handleParseAll = () => {
    setParsed(true)
  }

  const handleExport = async () => {
    if (!canExport) {
      return
    }

    setExporting(true)
    setExportError(null)
    setExportPhase('font')

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 0)
    })

    try {
      setExportPhase('pdf')
      await exportInventoryPdf(parseResult.sections, {
        title: reportTitle,
        orientation,
        filename: buildPdfFilename(reportTitle),
      })
    } catch (error) {
      console.error(error)
      const message =
        error instanceof Error && error.message.includes('字型')
          ? error.message
          : 'PDF 匯出失敗，請稍後再試'
      setExportError(message)
    } finally {
      setExporting(false)
      setExportPhase('idle')
    }
  }

  return (
    <ToolPageShell
      title="盤點表自動化工具"
      description="依類別分區貼上智生活資料，自動整理戶別代號並匯出 PDF。空區塊不會出現在輸出結果中。"
    >
      <div className="inventory-page">
        <section className="inventory-page__intro">
          {workflowSteps.map((item) => (
            <div key={item.step} className="inventory-page__intro-card">
              <div className="inventory-page__intro-step">{item.step}</div>
              <h3 className="mb-1 font-medium">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </section>

        <section className="inventory-page__settings">
          <h2 className="mb-4 text-lg font-medium">匯出設定</h2>
          <div className="inventory-page__settings-grid">
            <label className="inventory-page__field">
              <span className="inventory-page__field-label">報表標題</span>
              <input
                className="inventory-page__input"
                value={reportTitle}
                onChange={(event) => setReportTitle(event.target.value)}
              />
            </label>
            <label className="inventory-page__field">
              <span className="inventory-page__field-label">PDF 方向</span>
              <select
                className="inventory-page__select"
                value={orientation}
                onChange={(event) =>
                  setOrientation(event.target.value as 'portrait' | 'landscape')
                }
              >
                <option value="landscape">橫向（建議）</option>
                <option value="portrait">直向</option>
              </select>
            </label>
          </div>
        </section>

        <section className="inventory-page__actions">
          <div>
            <h2 className="font-medium">解析資料</h2>
            <p className="text-sm text-muted-foreground">貼上各區資料後，按「全部解析」更新預覽</p>
          </div>
          <div className="inventory-page__button-row">
            <button
              type="button"
              className="inventory-page__btn inventory-page__btn--primary"
              onClick={handleParseAll}
              disabled={!hasExportableData(zoneInputs)}
            >
              <Sparkles className="h-4 w-4" />
              全部解析
            </button>
            <button
              type="button"
              className="inventory-page__btn inventory-page__btn--secondary"
              onClick={clearAll}
            >
              <RotateCcw className="h-4 w-4" />
              全部清除
            </button>
          </div>
        </section>

        {parsed && parseResult.warnings.length > 0 && (
          <section className="inventory-page__warnings">
            {parseResult.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </section>
        )}

        <section className="inventory-page__zones">
          {INVENTORY_ZONES.map((zone) => {
            const section = parseResult.sections.find((item) => item.id === zone.id)
            const rowCount = section?.rows.length ?? 0

            return (
              <article key={zone.id} className="inventory-page__zone">
                <div className="inventory-page__zone-header">
                  <div className="inventory-page__zone-title-wrap">
                    <h3 className="inventory-page__zone-title">{zone.title}</h3>
                    {parsed && rowCount > 0 && (
                      <span className="inventory-page__zone-badge">{rowCount} 列</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="inventory-page__zone-clear"
                    onClick={() => clearZone(zone.id)}
                  >
                    清除
                  </button>
                </div>

                <div className="inventory-page__zone-body">
                  <textarea
                    className="inventory-page__textarea"
                    value={zoneInputs[zone.id]}
                    placeholder={zone.placeholder}
                    onChange={(event) => updateZone(zone.id, event.target.value)}
                  />

                  {parsed && rowCount > 0 && section && (
                    <div className="inventory-page__preview">
                      <table className="inventory-page__table">
                        <thead>
                          <tr>
                            {OUTPUT_HEADERS.map((header) => (
                              <th key={header}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.rows.map((row, index) => (
                            <tr key={`${row.serialNo}-${index}`}>
                              <td>□</td>
                              <td>{row.serialNo}</td>
                              <td
                                className={
                                  row.unitCode && !row.unitCodeConverted
                                    ? 'inventory-page__unit--warn'
                                    : undefined
                                }
                              >
                                {row.unitCode}
                              </td>
                              <td>{row.recipient}</td>
                              <td>{row.registeredAt}</td>
                              <td>{row.location}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {parsed && rowCount === 0 && zoneInputs[zone.id].trim() && (
                    <div className="inventory-page__empty">無法解析資料，請確認貼上格式</div>
                  )}

                  {parsed && !zoneInputs[zone.id].trim() && (
                    <div className="inventory-page__empty">尚未貼上資料，匯出時將略過</div>
                  )}
                </div>
              </article>
            )
          })}
        </section>

        <section className="inventory-page__export">
          <div>
            <h2 className="font-medium">輸出 PDF</h2>
            <p className="text-sm text-muted-foreground">
              僅輸出有資料的區塊；匯出中請稍候，勿關閉頁面
            </p>
            {exportError && <p className="inventory-page__export-error">{exportError}</p>}
          </div>
          <button
            type="button"
            className="inventory-page__btn inventory-page__btn--primary"
            disabled={!canExport || exporting}
            onClick={handleExport}
          >
            <FileDown className="h-4 w-4" />
            {exporting
              ? exportPhase === 'font'
                ? '載入字型…'
                : '產生 PDF…'
              : '下載 PDF'}
          </button>
        </section>
      </div>
    </ToolPageShell>
  )
}
