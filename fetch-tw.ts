// 抓動畫瘋（ani.gamer.com.tw）動畫列表，解析 標題 / 觀看數 / 年份，
// 依年份分組、依台灣觀看數排序，輸出 anime-tw.json。
// 用途：每年補進「動畫瘋人氣前幾名」但不在 AniList 全球榜上的台灣遺珠。
import fs from "fs"

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type TwItem = { sn: number; title: string; views: number; year: number; image: string }

const parseViews = (s: string): number => {
  s = s.trim()
  const m = s.match(/([\d.]+)\s*萬/)
  if (m) return Math.round(parseFloat(m[1] ?? "0") * 10000)
  const n = s.match(/[\d,]+/)
  return n ? parseInt(n[0].replace(/,/g, ""), 10) : 0
}

const parsePage = (html: string): TwItem[] => {
  const items: TwItem[] = []
  // 以每個 animeRef 連結為單位切塊
  const blocks = html.split("animeRef.php?sn=").slice(1)
  for (const b of blocks) {
    const sn = parseInt(b.match(/^(\d+)/)?.[1] ?? "0", 10)
    const views = parseViews(b.match(/show-view-number[\s\S]*?<p>([^<]*)<\/p>/)?.[1] ?? "")
    const title = (b.match(/theme-name'>([^<]*)</)?.[1] ?? "").trim()
    const year = parseInt(b.match(/年份：(\d{4})/)?.[1] ?? "0", 10)
    const image =
      b.match(/<img[^>]*\sdata-src='([^']+)'/)?.[1] ??
      b.match(/<img[^>]*\ssrc='([^']+)'/)?.[1] ??
      ""
    if (sn && title && year) items.push({ sn, title, views, year, image })
  }
  return items
}

const fetchPage = async (page: number): Promise<TwItem[]> => {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(`https://ani.gamer.com.tw/animeList.php?page=${page}&sort=1`, {
        headers: { "User-Agent": UA },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return parsePage(await res.text())
    } catch (e) {
      if (attempt === 3) {
        console.log(`  page ${page} 失敗: ${e}`)
        return []
      }
      await sleep(1000 * (attempt + 1))
    }
  }
  return []
}

const LAST_PAGE = Number(process.argv[2] ?? 66)
const all: TwItem[] = []
for (let p = 1; p <= LAST_PAGE; p++) {
  const items = await fetchPage(p)
  all.push(...items)
  if (p % 10 === 0 || p === LAST_PAGE) console.log(`  抓到第 ${p} 頁，累計 ${all.length} 部`)
  await sleep(350)
}

// 去重（同 sn 取一次），依年份分組、年內依觀看數排序
const seen = new Set<number>()
const byYear: Record<string, TwItem[]> = {}
for (const it of all) {
  if (seen.has(it.sn)) continue
  seen.add(it.sn)
  ;(byYear[it.year] ??= []).push(it)
}
for (const y of Object.keys(byYear)) byYear[y]!.sort((a, b) => b.views - a.views)

fs.writeFileSync("anime-tw.json", JSON.stringify(byYear, null, 2))
console.log(`\n已寫出 anime-tw.json（${seen.size} 部，${Object.keys(byYear).length} 個年份）`)
