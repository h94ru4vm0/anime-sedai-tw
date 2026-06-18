// 用已存的 aniListId 批次查 AniList，補上 format(TV/ONA/MOVIE…) 與 isSequel(是否有 TV/ONA 前作)。
// 只打 AniList、批次每次 50 個，快又準。寫回 anime-tw-enriched.json。
import fs from "fs"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
type E = { sn: number; aniListId: number | null; format?: string; seqByRel?: boolean; [k: string]: unknown }

const data: Record<string, E[]> = JSON.parse(fs.readFileSync("anime-tw-enriched.json", "utf8"))
const ids = [...new Set(Object.values(data).flat().map((e) => e.aniListId).filter(Boolean))] as number[]

const QUERY = `query($ids:[Int]){Page(perPage:50){media(id_in:$ids){id format relations{edges{relationType node{type format}}}}}}`

const info = new Map<number, { format: string; seq: boolean }>()
for (let i = 0; i < ids.length; i += 50) {
  const chunk = ids.slice(i, i + 50)
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
      const seq = (m.relations?.edges ?? []).some(
        (e: any) =>
          e.relationType === "PREQUEL" &&
          e.node?.type === "ANIME" &&
          (e.node?.format === "TV" || e.node?.format === "ONA"),
      )
      info.set(m.id, { format: m.format, seq })
    }
    break
  }
  console.log(`  ${Math.min(i + 50, ids.length)}/${ids.length}`)
  await sleep(1500)
}

for (const y of Object.keys(data))
  for (const e of data[y]!) {
    if (e.aniListId && info.has(e.aniListId)) {
      e.format = info.get(e.aniListId)!.format
      e.seqByRel = info.get(e.aniListId)!.seq
    }
  }
fs.writeFileSync("anime-tw-enriched.json", JSON.stringify(data, null, 2))
console.log(`已補 format/seqByRel：${info.size}/${ids.length}`)
