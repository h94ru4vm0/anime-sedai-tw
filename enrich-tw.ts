// 把動畫瘋台灣人氣候選 enrich 成：日文名（精準去重）＋ AniList id/縮圖。
// 流程：anime-tw.json 每年取前 N 候選 → animeRef 取 ACG s → acgDetail 取 中/日/英名
//        → 用英文(或日文)查 AniList 拿 id + coverImage。輸出 anime-tw-enriched.json。
import fs from "fs"

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const decode = (s: string) =>
  s.replace(/&#0?39;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")

type TwItem = { sn: number; title: string; views: number; year: number }
type Enriched = TwItem & {
  jp: string
  en: string
  aniListId: number | null
  image: string
}

const get = async (url: string): Promise<string> => {
  for (let a = 0; a < 4; a++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Referer: "https://ani.gamer.com.tw/" },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (e) {
      if (a === 3) return ""
      await sleep(800 * (a + 1))
    }
  }
  return ""
}

// 由動畫瘋 sn 取得 ACG 頁的 中/日/英 名
const acgNames = async (sn: number): Promise<{ jp: string; en: string } | null> => {
  const ref = await get(`https://ani.gamer.com.tw/animeRef.php?sn=${sn}`)
  const s = ref.match(/acgDetail\.php\?s=(\d+)/)?.[1]
  if (!s) return null
  await sleep(300)
  const acg = await get(`https://acg.gamer.com.tw/acgDetail.php?s=${s}`)
  const m = acg.match(/ACG-info-container">\s*<h1>([^<]*)<\/h1>\s*<h2>([^<]*)<\/h2>(?:\s*<h2>([^<]*)<\/h2>)?/)
  if (!m) return null
  return { jp: decode((m[2] ?? "").trim()), en: decode((m[3] ?? "").trim()) }
}

const aniList = async (q: string): Promise<{ id: number; image: string } | null> => {
  if (!q) return null
  const query = `query($q:String){Media(search:$q,type:ANIME){id coverImage{medium large}}}`
  for (let a = 0; a < 4; a++) {
    try {
      const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query, variables: { q } }),
        signal: AbortSignal.timeout(10000),
      })
      if (res.status === 429 || res.status >= 500) {
        await sleep(2000 * (a + 1))
        continue
      }
      const j = await res.json()
      const m = j?.data?.Media
      return m ? { id: m.id, image: m.coverImage?.medium ?? m.coverImage?.large ?? "" } : null
    } catch {
      await sleep(1000 * (a + 1))
    }
  }
  return null
}

const enrichOne = async (c: TwItem): Promise<Enriched> => {
  const names = await acgNames(c.sn)
  await sleep(300)
  const al = names ? await aniList(names.en || names.jp) : null
  await sleep(2200)
  return {
    ...c,
    title: decode(c.title),
    jp: names?.jp ?? "",
    en: names?.en ?? "",
    aniListId: al?.id ?? null,
    image: al?.image ?? "",
  }
}

// 模式 picks：只 enrich 實際被選進 data 的台灣補充（tw-picks.json），依年份合併進結果
if (process.argv[2] === "picks") {
  const picks: TwItem[] = JSON.parse(fs.readFileSync("tw-picks.json", "utf8"))
  const out: Record<string, Enriched[]> = (() => {
    try {
      return JSON.parse(fs.readFileSync("anime-tw-enriched.json", "utf8"))
    } catch {
      return {}
    }
  })()
  const have = new Map<number, Enriched>()
  for (const y of Object.keys(out)) for (const e of out[y] ?? []) have.set(e.sn, e)
  let done = 0
  for (const p of picks) {
    const y = String(p.year)
    const existing = have.get(p.sn)
    if (existing?.aniListId) continue // 已有縮圖就跳過
    const e = await enrichOne(p)
    out[y] = [...(out[y] ?? []).filter((x) => x.sn !== p.sn), e]
    have.set(p.sn, e)
    fs.writeFileSync("anime-tw-enriched.json", JSON.stringify(out, null, 2))
    done++
    if (done % 10 === 0) console.log(`  …已處理 ${done}`)
  }
  console.log(`picks 模式完成：新增 enrich ${done} 部`)
  process.exit(0)
}

const PER_YEAR = Number(process.argv[2] ?? 6)
const YEAR_FILTER = process.argv[3] // optional single year for testing
const tw: Record<string, TwItem[]> = JSON.parse(fs.readFileSync("anime-tw.json", "utf8"))

// 可續跑：載入既有結果，已完成的年份跳過
const out: Record<string, Enriched[]> = (() => {
  try {
    return JSON.parse(fs.readFileSync("anime-tw-enriched.json", "utf8"))
  } catch {
    return {}
  }
})()

const years = Object.keys(tw)
  .filter((y) => Number(y) >= 2005 && Number(y) <= 2025)
  .filter((y) => !YEAR_FILTER || y === YEAR_FILTER)
  .filter((y) => !out[y]) // 跳過已 enrich 的年份

for (const year of years) {
  const cands = tw[year]!.slice(0, PER_YEAR)
  const enriched: Enriched[] = []
  for (const c of cands) {
    const names = await acgNames(c.sn)
    await sleep(300)
    const al = names ? await aniList(names.en || names.jp) : null
    await sleep(2200) // 避開 AniList 限流（~30/min）
    enriched.push({
      ...c,
      title: decode(c.title),
      jp: names?.jp ?? "",
      en: names?.en ?? "",
      aniListId: al?.id ?? null,
      image: al?.image ?? "",
    })
  }
  out[year] = enriched
  fs.writeFileSync("anime-tw-enriched.json", JSON.stringify(out, null, 2)) // 每年存檔，可續跑
  console.log(`${year}: ${enriched.filter((e) => e.aniListId).length}/${enriched.length} 對到 AniList`)
}

console.log("完成 enrich")
