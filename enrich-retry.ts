// 針對 anime-tw-enriched.json 裡「還沒對到 AniList（無 aniListId/縮圖）」的台灣補充，
// 重試：優先用日文原名、再用英文名 去 AniList 搜尋抓 id + 縮圖。可續跑。
import fs from "fs"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
type E = { sn: number; jp: string; en: string; title: string; aniListId: number | null; image: string; [k: string]: unknown }

const search = async (q: string): Promise<{ id: number; image: string } | null> => {
  if (!q) return null
  const query = `query($q:String){Media(search:$q,type:ANIME){id coverImage{medium large}}}`
  for (let a = 0; a < 4; a++) {
    try {
      const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query, variables: { q } }),
        signal: AbortSignal.timeout(12000),
      })
      if (res.status === 429 || res.status >= 500) {
        await sleep(2500 * (a + 1))
        continue
      }
      const j = await res.json()
      const m = j?.data?.Media
      return m ? { id: m.id, image: m.coverImage?.medium ?? m.coverImage?.large ?? "" } : null
    } catch {
      await sleep(1500 * (a + 1))
    }
  }
  return null
}

const data: Record<string, E[]> = JSON.parse(fs.readFileSync("anime-tw-enriched.json", "utf8"))
const todo = Object.values(data)
  .flat()
  .filter((e) => !e.aniListId && (e.jp || e.en))
console.log(`待重試：${todo.length} 部`)

let hit = 0
for (const e of todo) {
  // 先日文原名，再英文名
  const r = (await search(e.jp)) ?? (await sleep(2200), await search(e.en))
  await sleep(2200)
  if (r) {
    e.aniListId = r.id
    e.image = r.image
    hit++
    fs.writeFileSync("anime-tw-enriched.json", JSON.stringify(data, null, 2))
    console.log(`  ✓ ${e.title} → ${r.id}`)
  }
}
console.log(`完成：補到 ${hit}/${todo.length}`)
