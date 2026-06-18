// 用 AniList 的 relations（續作/前作/母作/外傳）把作品分成「系列群組」（union-find）。
// 輸出 franchise-map.json: { [aniListId]: rootId }，供 build-data 標記每部所屬系列、
// 讓畫面端「每個系列只顯示首次出現」能精準去重（解決鬼滅各篇章等用劇名當子標題的情況）。
import fs from "fs"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// 收集所有要查的 aniListId：全球候選（anime-raw）+ 台灣補充（enriched）
const raw: Record<string, { aniListId: number }[]> = JSON.parse(fs.readFileSync("anime-raw.json", "utf8"))
const enriched: Record<string, { aniListId: number | null }[]> = JSON.parse(
  fs.readFileSync("anime-tw-enriched.json", "utf8"),
)
const ids = new Set<number>()
for (const y of Object.keys(raw)) for (const r of raw[y]!) ids.add(r.aniListId)
for (const y of Object.keys(enriched))
  for (const e of enriched[y]!) if (e.aniListId) ids.add(e.aniListId)
const idList = [...ids]

// union-find
const parent: Record<number, number> = {}
const find = (x: number): number => {
  if (parent[x] === undefined) parent[x] = x
  if (parent[x] !== x) parent[x] = find(parent[x]!)
  return parent[x]!
}
const union = (a: number, b: number) => {
  parent[find(a)] = find(b)
}

const REL = new Set(["SEQUEL", "PREQUEL", "PARENT", "SIDE_STORY", "ALTERNATIVE"])
const QUERY = `query($ids:[Int]){Page(perPage:50){media(id_in:$ids){id relations{edges{relationType node{id type}}}}}}`

for (let i = 0; i < idList.length; i += 50) {
  const chunk = idList.slice(i, i + 50)
  for (let a = 0; a < 4; a++) {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { ids: chunk } }),
      signal: AbortSignal.timeout(15000),
    })
    if (res.status === 429 || res.status >= 500) {
      await sleep(2500 * (a + 1))
      continue
    }
    const j = await res.json()
    for (const m of j?.data?.Page?.media ?? []) {
      find(m.id)
      for (const e of m.relations?.edges ?? []) {
        if (REL.has(e.relationType) && e.node?.type === "ANIME") union(m.id, e.node.id)
      }
    }
    break
  }
  console.log(`  ${Math.min(i + 50, idList.length)}/${idList.length}`)
  await sleep(1500)
}

const map: Record<number, number> = {}
for (const id of Object.keys(parent).map(Number)) map[id] = find(id)
fs.writeFileSync("franchise-map.json", JSON.stringify(map))
const roots = new Set(Object.values(map))
console.log(`已寫出 franchise-map.json：${Object.keys(map).length} 部 → ${roots.size} 個系列群`)
