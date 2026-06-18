# 動畫世代（台灣版）

點擊你看過的動畫，產生一張屬於你的「動畫世代」圖卡。本專案是 [egoist/anime-sedai](https://github.com/egoist/anime-sedai) 的台灣在地化版本，重做了選片標準與譯名，讓清單更客觀、更貼近台灣觀眾。

🌐 **線上看：** https://h94ru4vm0.github.io/anime-sedai-tw/

## 與原專案的差異

- **客觀選片**：每年取 [AniList](https://anilist.co) 全球人氣（popularity）前 15 名，純數據排序，不靠個人喜好（原版資料來自 bgm.tv，偏中國社群口味）。
- **台灣官方譯名**：全部改用台灣代理商／電視台的正式繁體譯名（例：死亡筆記本、流浪神差、路人超能100），而非簡體或中國大陸譯名。
- **涵蓋 2005–2025**：收錄 TV 與 ONA（含 Netflix 等網路動畫，如電馭叛客：邊緣行者）。
- **排除台灣未代理作品**：動畫瘋／MyVideo／Netflix 等都查無正版者不列入。
- **封面縮圖**：每部作品顯示封面圖（打包於本地，分享截圖不破圖）。
- **介面全繁體**，並新增功能。

## 選片規則

> 每年取 AniList 全球人氣前 15 名（含 TV 與 ONA），同年同系列續作只計一部，並排除台灣從未代理的作品；中文採台灣官方譯名。

## 功能

- 勾選看過的動畫，產生統計與可下載／複製的圖卡
- **隱藏續作**：每個系列只顯示第一季那年
- **顯示模式切換**：封面上顯示標題 / ★評分 / 🔥熱度
- 年份範圍篩選、繁中／English／日本語切換

## 開發

需要 [Bun](https://bun.sh)。

```bash
bun install   # 安裝相依套件
bun dev       # 本地開發
bun run build # 產生靜態檔（dist/）
```

### 重新產生動畫資料

資料抓取與譯名對照都是腳本化的，可重現：

```bash
bun fetch-mal.ts     # 從 AniList 抓每年人氣排名 → anime-raw.json
bun build-data.ts    # 套上台灣譯名 → anime-data.ts + covers-manifest.json
bun download-covers.ts  # 下載封面圖到 public/covers/
```

台灣譯名對照表、移除清單、遞補規則都在 [`build-data.ts`](./build-data.ts)。

## 部署

推送到 `main` 會由 GitHub Actions 自動 build 並發佈到 GitHub Pages（設定見 [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)）。

## 致謝與授權

本專案改作自 [egoist/anime-sedai](https://github.com/egoist/anime-sedai)，原作者 [EGOIST](https://github.com/egoist)。
資料來源：[AniList](https://anilist.co)。

以 [MIT License](./LICENSE) 釋出，著作權聲明保留原作者 EGOIST。
