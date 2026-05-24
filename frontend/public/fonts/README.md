# PDF 匯出字型

建置時 `npm run setup:pdf-font` 會：

1. 優先使用 **Noto Sans TC**（Docker 安裝 `fonts-noto-extra`）
2. 本機 Windows 使用 `simhei.ttf`
3. 用 **jsPDF 實際渲染**驗證字型可用
4. 將字型 **嵌入** `src/lib/inventory/pdfFontData.generated.ts`（Zeabur 不需 runtime 下載）

`public/fonts/SimHei.ttf` 與 `pdfFontData.generated.ts` 未納入 Git。
