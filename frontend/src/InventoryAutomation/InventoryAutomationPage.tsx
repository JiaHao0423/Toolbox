import { useMemo, useState } from 'react'
import { FileDown, RotateCcw, Sparkles } from 'lucide-react'
import { ToolPageShell } from '../components/layout/AppShell'
import { buildPdfFilename, exportInventoryPdf } from '../lib/inventory/exportInventoryPdf'
import { hasExportableData, parseAllZones } from '../lib/inventory/parseAllZones'
import { getSectionHeaders, rowToDisplayCells } from '../lib/inventory/types'
import type { InputZoneId, InputZoneInputs } from '../lib/inventory/types'
import { INPUT_ZONES, OUTPUT_ZONES, createEmptyInputZoneInputs } from '../lib/inventory/zones'
import './InventoryAutomationPage.scss'

const workflowSteps = [
  { step: '1', title: '分類複製', detail: '在智生活依類別複製表格' },
  { step: '2', title: '貼上資料', detail: '貼入四大類區塊，包裹與現金自動分棟' },
  { step: '3', title: '匯出 PDF', detail: '確認預覽後下載盤點表（直向 A4）' },
]

export default function InventoryAutomationPage() {
  const [inputZones, setInputZones] = useState<InputZoneInputs>(createEmptyInputZoneInputs)
  const [reportTitle, setReportTitle] = useState('盤點表')
  const [parsed, setParsed] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportPhase, setExportPhase] = useState<'idle' | 'font' | 'pdf'>('idle')

  const parseResult = useMemo(
    () => (parsed ? parseAllZones(inputZones) : { sections: [], warnings: [] }),
    [inputZones, parsed],
  )
  const canExport = parsed && parseResult.sections.length > 0

  const updateInputZone = (zoneId: InputZoneId, value: string) => {
    setInputZones((current) => ({ ...current, [zoneId]: value }))
    setParsed(false)
  }

  const clearInputZone = (zoneId: InputZoneId) => {
    updateInputZone(zoneId, '')
  }

  const clearAll = () => {
    setInputZones(createEmptyInputZoneInputs())
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
      description="依類別貼上智生活資料，包裹與現金會依地址自動分至 A棟／B棟／店面，整理戶別代號並匯出直向 PDF。空區塊不會出現在輸出結果中。"
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
          <label className="inventory-page__field">
            <span className="inventory-page__field-label">報表標題</span>
            <input
              className="inventory-page__input"
              value={reportTitle}
              onChange={(event) => setReportTitle(event.target.value)}
            />
          </label>
        </section>

        <section className="inventory-page__actions">
          <div>
            <h2 className="font-medium">解析資料</h2>
            <p className="text-sm text-muted-foreground">貼上各類資料後，按「全部解析」更新預覽</p>
          </div>
          <div className="inventory-page__button-row">
            <button
              type="button"
              className="inventory-page__btn inventory-page__btn--primary"
              onClick={handleParseAll}
              disabled={!hasExportableData(inputZones)}
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

        <section className="inventory-page__zones inventory-page__zones--inputs">
          <h2 className="inventory-page__section-title">貼上資料</h2>
          {INPUT_ZONES.map((zone) => (
            <article key={zone.id} className="inventory-page__zone">
              <div className="inventory-page__zone-header">
                <div className="inventory-page__zone-title-wrap">
                  <h3 className="inventory-page__zone-title">{zone.title}</h3>
                </div>
                <button
                  type="button"
                  className="inventory-page__zone-clear"
                  onClick={() => clearInputZone(zone.id)}
                >
                  清除
                </button>
              </div>

              <div className="inventory-page__zone-body">
                {zone.hint && <p className="inventory-page__zone-hint">{zone.hint}</p>}
                <textarea
                  className="inventory-page__textarea"
                  value={inputZones[zone.id]}
                  placeholder={zone.placeholder}
                  onChange={(event) => updateInputZone(zone.id, event.target.value)}
                />
              </div>
            </article>
          ))}
        </section>

        {parsed && (
          <section className="inventory-page__zones inventory-page__zones--preview">
            <h2 className="inventory-page__section-title">輸出預覽</h2>
            {parseResult.sections.length === 0 ? (
              <div className="inventory-page__empty inventory-page__empty--standalone">
                沒有可輸出的資料，請確認貼上格式後重新解析
              </div>
            ) : (
              parseResult.sections.map((section) => (
                <article key={section.id} className="inventory-page__zone">
                  <div className="inventory-page__zone-header">
                    <div className="inventory-page__zone-title-wrap">
                      <h3 className="inventory-page__zone-title">{section.title}</h3>
                      <span className="inventory-page__zone-badge">{section.rows.length} 列</span>
                    </div>
                  </div>

                  <div className="inventory-page__zone-body">
                    <div className="inventory-page__preview">
                      <table className="inventory-page__table">
                        <thead>
                          <tr>
                            {getSectionHeaders(section.id).map((header) => (
                              <th key={header}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.rows.map((row, index) => {
                            const cells = rowToDisplayCells(section.id, row)
                            return (
                              <tr key={`${row.serialNo}-${index}`}>
                                {cells.map((cell, cellIndex) => (
                                  <td
                                    key={`${row.serialNo}-${cellIndex}`}
                                    className={
                                      cellIndex === 2 &&
                                      row.unitCode &&
                                      !row.unitCodeConverted
                                        ? 'inventory-page__unit--warn'
                                        : undefined
                                    }
                                  >
                                    {cellIndex === 0 ? '□' : cell}
                                  </td>
                                ))}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </article>
              ))
            )}

            {OUTPUT_ZONES.filter(
              (zone) => !parseResult.sections.some((section) => section.id === zone.id),
            ).map((zone) => {
              const hasInput =
                (zone.id === 'mail' && inputZones.mail.trim()) ||
                (zone.id.startsWith('pkg-') && inputZones.package.trim()) ||
                (zone.id.startsWith('cash-') && inputZones.cash.trim()) ||
                (zone.id === 'custody-other' && inputZones['non-cash'].trim())

              if (!hasInput) {
                return null
              }

              return (
                <div key={zone.id} className="inventory-page__empty inventory-page__empty--standalone">
                  「{zone.title}」解析後無資料（可能地址無法分棟或類型不符）
                </div>
              )
            })}
          </section>
        )}

        <section className="inventory-page__export">
          <div>
            <h2 className="font-medium">輸出 PDF</h2>
            <p className="text-sm text-muted-foreground">
              僅輸出有資料的區塊；直向 A4；匯出中請稍候，勿關閉頁面
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
