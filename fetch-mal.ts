// 階段一：用 AniList GraphQL API 抓取每年人氣前 15 名 TV 動畫
// 規則：該年度首播（seasonYear）的 TV 動畫，依 popularity（全球清單收錄人數）由高到低，取前 15。
// （原計畫用 Jikan/MAL，但其搜尋端點目前持續 504；AniList popularity 為等價的全球人氣指標。）
// 輸出：anime-raw.json

import fs from "fs"

type RawItem = {
  aniListId: number
  titleEn: string
  titleJa: string
  titleRomaji: string
  popularity: number
  score: number | null // 0-10，由 AniList averageScore(0-100) 換算
}

const years = Array.from({ length: 2025 - 2006 + 1 }, (_, i) => 2006 + i)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const QUERY = `
query ($year: Int) {
  Page(page: 1, perPage: 15) {
    media(seasonYear: $year, type: ANIME, format: TV, sort: POPULARITY_DESC) {
      id
      title { romaji english native }
      popularity
      averageScore
    }
  }
}`

const fetchYear = async (year: number): Promise<RawItem[]> => {
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
      const retryAfter = Number(res.headers.get("retry-after")) || 2 * (attempt + 1)
      console.log(`  HTTP ${res.status}，等 ${retryAfter}s 重試… (${attempt + 1})`)
      await sleep(retryAfter * 1000)
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
      popularity: m.popularity ?? 0,
      score: m.averageScore != null ? Math.round((m.averageScore / 10) * 10) / 10 : null,
    }))
  }
  throw new Error(`${year}: 重試多次仍失敗`)
}

const result: Record<string, RawItem[]> = {}
for (const year of years) {
  console.log(`抓取 ${year} …`)
  result[year] = await fetchYear(year)
  result[year].forEach((it, i) =>
    console.log(
      `  ${String(i + 1).padStart(2)}. ${it.titleRomaji}  (pop=${it.popularity.toLocaleString()}, score=${it.score})`,
    ),
  )
  await sleep(800)
}

fs.writeFileSync("anime-raw.json", JSON.stringify(result, null, 2))
console.log("\n已寫出 anime-raw.json")
