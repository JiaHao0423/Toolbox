# PDF 匯出字型

盤點表 PDF 需要支援中文的 **TTF** 字型（檔名固定為 `SimHei.ttf`）。

## 本機（Windows）

```bash
npm run setup:pdf-font
```

會從 `C:\Windows\Fonts\simhei.ttf` 複製到此目錄。

## Docker / Zeabur 建置

建置時若找不到本機 TTF，會自動下載 **Noto Sans TC Regular** 並存成 `SimHei.ttf`。

注意：不可使用 `.ttc` 字型集合檔改名為 `.ttf`，jsPDF 會報 `No unicode cmap for font`。

此檔案較大，未納入 Git。
