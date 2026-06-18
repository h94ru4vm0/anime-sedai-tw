// 依 covers-manifest.json 把封面圖下載到 public/covers/（同源，供顯示與截圖使用）
import fs from "fs"

type Cover = { id: number; url: string; file: string }
const covers: Cover[] = JSON.parse(fs.readFileSync("covers-manifest.json", "utf8"))

fs.mkdirSync("public/covers", { recursive: true })
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

let done = 0
let skipped = 0
for (const c of covers) {
  if (fs.existsSync(c.file)) {
    skipped++
    continue
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(c.url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      fs.writeFileSync(c.file, buf)
      done++
      break
    } catch (e) {
      if (attempt === 3) console.log(`✗ ${c.id} 下載失敗: ${e}`)
      else await sleep(500 * (attempt + 1))
    }
  }
  if (done % 25 === 0 && done) console.log(`  …已下載 ${done}`)
}
console.log(`完成：新下載 ${done}、已存在略過 ${skipped}、總計 ${covers.length}`)

// 清掉 anime-data.ts（covers-manifest）沒用到的封面，只保留有引用的
const used = new Set(covers.map((c) => c.file.replace(/^public\//, "")))
let pruned = 0
for (const f of fs.readdirSync("public/covers")) {
  if (!used.has("covers/" + f)) {
    fs.unlinkSync("public/covers/" + f)
    pruned++
  }
}
console.log(`清理未使用封面：刪除 ${pruned}、現存 ${fs.readdirSync("public/covers").length}`)
