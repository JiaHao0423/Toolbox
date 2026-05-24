# Toolbox

個人工具箱：前端（React + Vite）+ 後端（Spring Boot）+ Docker / Zeabur 部署。

## 專案結構

```
Toolbox/
├── frontend/          # React 前端
├── backend/           # Spring Boot 後端
├── docker/            # Dockerfile 與 Nginx 設定
├── docker-compose.yml # 本機多容器
├── Dockerfile         # Zeabur 全棧單容器
├── pom.xml            # Maven 聚合（IntelliJ 根模組）
└── zbpack.json        # Zeabur Docker 建置
```

## 本機開發

```bash
# 前端
cd frontend && npm install && npm run dev

# 後端（dev profile，不需 MySQL）
# 在 IntelliJ 執行 BackendApplication，profile: dev

# Docker 全棧
docker compose up --build
```

## Zeabur

- **Root Directory**：留空（repo 根目錄）
- 環境變數見 `zeabur.env.example`

## PDF 字型

```bash
cd frontend && npm run setup:pdf-font
```
