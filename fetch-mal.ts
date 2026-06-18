// 階段一：用 AniList GraphQL API 抓取每年人氣前 15 名 TV 動畫
// 規則：該年度首播（seasonYear）的 TV 動畫，依 popularity（全球清單收錄人數）由高到低。
// 去重（選項 B）：同一年內、同系列（依 relations 續作/前作/母作/外傳關係分群）只留人氣最高者，
//                空出的名額由下一名遞補，最後取 15 部。
// 輸出：anime-raw.json
import fs from "fs"

type Cand = {
  aniListId: number
  titleEn: string
  titleJa: string
  titleRomaji: string
  image: string // AniList 封面圖（medium）
  popularity: number
  score: number | null
  relIds: number[] // 同為續作/前作/母作/外傳關係的對象 id
}
type RawItem = Omit<Cand, "relIds">

const years = Array.from({ length: 2025 - 2005 + 1 }, (_, i) => 2005 + i)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const QUERY = `
query ($year: Int) {
  Page(page: 1, perPage: 60) {
    media(seasonYear: $year, type: ANIME, format_in: [TV, ONA], sort: POPULARITY_DESC) {
      id
      title { romaji english native }
      coverImage { medium large }
      popularity
      averageScore
      relations { edges { relationType node { id type } } }
    }
  }
}`

// 視為「同系列」的關係類型
const SAME_FRANCHISE = new Set(["SEQUEL", "PREQUEL", "PARENT", "SIDE_STORY"])

const fetchCands = async (year: number): Promise<Cand[]> => {
  for (let attempt = 0; attempt < 6; attempt++) {
    let res: Response
    try {
      res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: QUERY, variables: { year } }),
      })
    } catch {
      console.log(`  網路錯誤，退避重試… (${attempt + 1})`)
      await sleep(2000 * (attempt + 1))
      continue
    }
    if (res.status === 429 || res.status >= 500) {
      const ra = Number(res.headers.get("retry-after")) || 2 * (attempt + 1)
      console.log(`  HTTP ${res.status}，等 ${ra}s 重試… (${attempt + 1})`)
      await sleep(ra * 1000)
      continue
    }
    if (!res.ok) throw new Error(`${year}: HTTP ${res.status}`)
    const json = await res.json()
    if (json.errors) throw new Error(`${year}: ${JSON.stringify(json.errors)}`)
    return (json.data.Page.media as any[]).map((m) => ({
      aniListId: m.id,
      titleEn: m.title.english ?? "",
      titleJa: m.title.native ?? "",
      titleRomaji: m.title.romaji ?? "",
      image: m.coverImage?.medium ?? m.coverImage?.large ?? "",
      popularity: m.popularity ?? 0,
      score: m.averageScore != null ? Math.round(m.averageScore) / 10 : null,
      relIds: (m.relations?.edges ?? [])
        .filter((e: any) => SAME_FRANCHISE.has(e.relationType) && e.node?.type === "ANIME")
        .map((e: any) => e.node.id as number),
    }))
  }
  throw new Error(`${year}: 重試多次仍失敗`)
}

// 選項 B：候選池已依人氣排序；貪婪挑選，同系列只留第一個（人氣最高）遇到的
const dedupe = (cands: Cand[], limit: number) => {
  const idSet = new Set(cands.map((c) => c.aniListId))
  const kept: Cand[] = []
  const dropped: { item: Cand; because: Cand }[] = []
  const claimedFranchise = new Map<number, Cand>() // member id -> 已保留的代表

  for (const c of cands) {
    // 此候選是否與某個已保留者同系列？
    const linked = [c.aniListId, ...c.relIds.filter((id) => idSet.has(id))]
    const rep = linked.map((id) => claimedFranchise.get(id)).find(Boolean)
    if (rep) {
      dropped.push({ item: c, because: rep })
      continue
    }
    kept.push(c)
    // 把此系列的所有相關 id 都登記到這個代表
    for (const id of linked) claimedFranchise.set(id, c)
    if (kept.length >= limit) break
  }
  return { kept, dropped }
}

const result: Record<string, RawItem[]> = {}
for (const year of years) {
  console.log(`抓取 ${year} …`)
  const cands = await fetchCands(year)
  const { kept, dropped } = dedupe(cands, 20)
  result[year] = kept.map(({ relIds, ...rest }) => rest)
  kept.forEach((it, i) =>
    console.log(
      `  ${String(i + 1).padStart(2)}. ${it.titleRomaji}  (pop=${it.popularity.toLocaleString()}, score=${it.score})`,
    ),
  )
  if (dropped.length)
    dropped.forEach((d) =>
      console.log(`     ✗ 去重: ${d.item.titleRomaji}  ← 同系列於「${d.because.titleRomaji}」`),
    )
  await sleep(800)
}

fs.writeFileSync("anime-raw.json", JSON.stringify(result, null, 2))
console.log("\n已寫出 anime-raw.json")
