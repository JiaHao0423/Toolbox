# PDF 匯出字型

盤點表 PDF 需要支援中文的 **TTF** 字型（檔名固定為 `SimHei.ttf`）。

## 本機（Windows）

```bash
npm run setup:pdf-font
```

會從 `C:\Windows\Fonts\simhei.ttf` 複製到此目錄。

## Docker / Zeabur 建置

建置時優先從系統字型 **wqy-microhei.ttc** 用 `fonttools` 提取成 TTF（不需外網下載）。

若提取失敗，才會嘗試從 GitHub 下載 Noto Sans TC。

注意：不可把 `.ttc` 直接改名為 `.ttf`，jsPDF 會報 `No unicode cmap for font`。

此檔案較大，未納入 Git。
