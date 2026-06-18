# 動畫世代（台灣版）

點擊你看過的動畫，產生一張屬於你的「動畫世代」圖卡。本專案是 [egoist/anime-sedai](https://github.com/egoist/anime-sedai) 的台灣在地化版本，重做了選片標準與譯名，讓清單更客觀、更貼近台灣觀眾。

🌐 **線上看：** https://h94ru4vm0.github.io/anime-sedai-tw/

## 與原專案的差異

- **客觀選片**：以 [AniList](https://anilist.co) 全球人氣（popularity）排序，純數據、不靠個人喜好（原版資料來自 bgm.tv，偏中國社群口味）。
- **台灣在地補充**：每年另收動畫瘋（巴哈姆特）台灣觀看人氣高、但全球榜沒上的作品（標「台」）。
- **台灣官方譯名**：全部改用台灣代理商／電視台的正式繁體譯名（例：死亡筆記本、流浪神差、路人超能100），而非簡體或中國大陸譯名。
- **涵蓋 2005–2025**：收錄 TV 與 ONA（含 Netflix 等網路動畫，如電馭叛客：邊緣行者）。
- **排除台灣未代理作品**：動畫瘋／MyVideo／Netflix 等都查無正版者不列入。
- **去重以日文原名為準**（畢竟是日本動畫），輔以中文與英文名比對。
- **介面全繁體**，並新增多項功能。

## 選片規則

範圍 **2005–2025**，每年顯示 **12 部**：

- **10 部全球人氣**：AniList popularity（含 TV 與 ONA），同年同系列續作只計一部，並排除台灣從未代理的作品。
- **2 部台灣補充**：動畫瘋台灣觀看人氣最高、且不在全球榜的作品，標「台」、排在最後。
- 去重以**日文原名**為準（輔以中文／英文名）。
- 哪一邊數量不足，就用另一邊與庫存回補，湊滿 12 部。
- 中文一律採**台灣官方繁體譯名**。

## 功能

- 勾選看過的動畫，**下載／複製圖卡**（匯出為純文字緊湊版，速度快、字大好讀）
- **隱藏續作**（預設開啟）：每個系列只顯示第一季那年；空出的格子會從庫存回補
- **顯示封面圖**開關（預設關閉）：開啟顯示封面海報
- **顯示模式切換**：標題 / ★評分 / 🔥熱度
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
bun fetch-mal.ts        # 從 AniList 抓每年全球人氣 → anime-raw.json
bun fetch-tw.ts         # 從動畫瘋抓台灣觀看人氣 → anime-tw.json
bun enrich-tw.ts 6      # 補台灣作品的日文名＋AniList 縮圖 → anime-tw-enriched.json
bun build-data.ts       # 整合＋去重＋台灣譯名 → anime-data.ts、covers-manifest.json、tw-picks.json
bun enrich-tw.ts picks  # 針對實際選進清單的台灣作品再補封面（可續跑）
bun download-covers.ts  # 依 covers-manifest 下載封面圖到 public/covers/
```

台灣譯名對照表、移除清單、遞補與去重規則都在 [`build-data.ts`](./build-data.ts)。

## 部署

推送到 `main` 會由 GitHub Actions 自動 build 並發佈到 GitHub Pages（設定見 [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)）。

## 致謝與授權

本專案改作自 [egoist/anime-sedai](https://github.com/egoist/anime-sedai)，原作者 [EGOIST](https://github.com/egoist)。
資料來源：[AniList](https://anilist.co)。

以 [MIT License](./LICENSE) 釋出，著作權聲明保留原作者 EGOIST。
