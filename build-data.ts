// 階段二：把 anime-raw.json 套上台灣繁體官方譯名，產生 anime-data.ts
// TW: aniListId -> 台灣譯名（字串＝官方譯名；{ zh, fan:true }＝無官方代理、暫用宅圈通用繁體譯名）
import fs from "fs"

type Raw = { aniListId: number; titleEn: string; titleJa: string; titleRomaji: string; image: string; popularity: number; isSequel: boolean; score: number | null }
type TwVal = string | { zh: string; fan: true }

const TW: Record<number, TwVal> = {
  // 2005
  457: "蟲師",
  355: "灼眼的夏娜",
  237: "交響詩篇 EUREKA SEVEN",
  228: "地獄少女",
  150: "BLOOD+",
  322: "天國之吻",
  16: "蜂蜜幸運草",
  477: "ARIA The ANIMATION",
  101: "AIR",
  68: "黑貓 BLACK CAT",
  73: "驚爆危機！The Second Raid",
  177: "Tsubasa翼·年代記",
  488: "草莓棉花糖",
  15: "光速蒙面俠21",
  67: "甲賀忍法帖 BASILISK", // 遞補（原 SHUFFLE! 台灣無代理）
  // 2006
  1535: "死亡筆記本",
  1575: "Code Geass 反叛的魯路修",
  918: "銀魂",
  853: "櫻蘭高校男公關部",
  889: "BLACK LAGOON 黑礁",
  877: "NANA",
  849: "涼宮春日的憂鬱",
  1210: "歡迎加入N.H.K.！",
  356: "Fate/stay night",
  934: "暮蟬悲鳴時",
  790: "死亡代理人",
  1195: "零之使魔",
  1482: "驅魔少年 D.Gray-man",
  1604: "家庭教師HITMAN REBORN!",
  861: "×××HOLiC",
  // 2007
  1735: "火影忍者 疾風傳",
  2001: "天元突破 紅蓮螺巖",
  2167: "CLANNAD",
  2251: "BACCANO! 大騷動！",
  2025: "DARKER THAN BLACK 黑之契約者",
  1887: "幸運☆星",
  2034: "戀愛情結",
  2476: "School Days",
  1818: "大劍 CLAYMORE",
  3002: "賭博默示錄",
  2246: "物怪",
  1889: "暮蟬悲鳴時 解",
  1840: "零之使魔～雙月騎士～",
  1292: "爆炸頭武士",
  2605: "再見、絕望老師",
  // 2008
  4224: "龍與虎 TIGER×DRAGON！",
  5231: "閃電十一人", // 遞補（原 Michiko & Hatchin 台灣無代理）
  3588: "Soul Eater 噬魂者",
  2904: "Code Geass 反叛的魯路修 R2",
  4898: "黑執事",
  4181: "CLANNAD ～AFTER STORY～",
  4654: "魔法禁書目錄",
  2966: "狼與辛香料",
  3455: "出包王女",
  4081: "夏目友人帳",
  2993: "十字架與吸血姬",
  3457: "吸血鬼騎士",
  3712: "零之使魔～三美姬的輪舞～",
  4063: "鶺鴒女神",
  3470: "S.A 特優生",
  // 2009
  5114: "鋼之鍊金術師 FULLMETAL ALCHEMIST",
  6702: "魔導少年 FAIRY TAIL",
  5081: "化物語",
  5680: "K-ON！輕音部",
  6045: "好想告訴你",
  6213: "科學超電磁砲",
  4382: "涼宮春日的憂鬱（2009）",
  5630: "東之伊甸",
  5341: "狼與辛香料II",
  6033: "七龍珠改",
  5958: "天降之物",
  5530: "潘朵拉之心",
  6211: "東京地震8.0",
  6573: "DARKER THAN BLACK 流星的雙子",
  5682: "幻靈鎮魂曲",
  // 2010
  6547: "Angel Beats!",
  6746: "無頭騎士異聞錄 DuRaRaRa!!",
  7054: "會長是女僕大人！",
  8074: "學園默示錄 HIGHSCHOOL OF THE DEAD",
  7791: "K-ON！！輕音部",
  8769: "我的妹妹哪有這麼可愛！",
  6594: "刀語",
  8525: "只有神知道的世界",
  7724: "屍鬼",
  7674: "爆漫王。",
  6347: "笨蛋、測驗、召喚獸",
  8675: "妄想學生會",
  6707: "黑執事II", // 遞補
  8937: "魔法禁書目錄II", // 遞補
  6956: "WORKING!!迷糊餐廳", // 遞補
  // 2011
  11061: "HUNTER×HUNTER 獵人（2011）",
  9253: "命運石之門",
  9919: "青之驅魔師",
  10620: "未來日記",
  9989: "我們仍未知道那天所看見的花的名字。",
  10087: "Fate/Zero",
  9756: "魔法少女小圓",
  6880: "死囚樂園",
  10793: "罪惡王冠",
  10165: "日常",
  10719: "我的朋友很少",
  9041: "IS〈Infinite Stratos〉",
  8425: "GOSICK",
  10800: "花牌情緣",
  9656: "好想告訴你 2ND SEASON",
  // 2012
  11757: "Sword Art Online 刀劍神域",
  14719: "JoJo的奇妙冒險（TV）",
  11111: "Another 替身",
  13601: "PSYCHO-PASS 心靈判官",
  12189: "冰菓",
  14741: "中二病也想談戀愛！",
  11617: "惡魔高校D×D",
  11771: "影子籃球員",
  13759: "櫻花莊的寵物女孩",
  14227: "鄰家的怪同學",
  11741: "Fate/Zero 第二季",
  14513: "魔奇少年 MAGI",
  11843: "男子高中生的日常",
  11887: "Kokoro Connect 心靈連結",
  11597: "偽物語",
  // 2013
  16498: "進擊的巨人",
  18679: "KILL la KILL",
  15809: "打工吧！魔王大人",
  14813: "果然我的青春戀愛喜劇搞錯了。",
  18153: "境界的彼方",
  17895: "Golden Time",
  15583: "約會大作戰 DATE A LIVE",
  17265: "記錄的地平線",
  16592: "槍彈辯駁 希望的學園與絕望的高中生 The Animation",
  15451: "惡魔高校D×D NEW",
  18507: "Free！男子游泳部",
  16894: "影子籃球員 第二季",
  17074: "物語系列 第二季",
  18115: "魔奇少年 MAGI 王國",
  16742: "我不受歡迎，怎麼想都是你們的錯！",
  // 2014
  20605: "東京喰種",
  20665: "四月是你的謊言",
  20464: "排球少年!!",
  19815: "NO GAME NO LIFE 遊戲人生",
  20447: "流浪神差",
  20613: "斬！赤紅之瞳",
  20789: "七大罪",
  20623: "寄生獸 生命的準則",
  20594: "Sword Art Online 刀劍神域 II",
  20474: "JoJo的奇妙冒險 星塵鬥士",
  20661: "殘響的恐怖",
  18897: "偽戀",
  19603: "Fate/stay night [Unlimited Blade Works]",
  20458: "魔法科高中的劣等生",
  20596: "青春之旅",
  // 2015
  21087: "ONE PUNCH MAN 一拳超人",
  20755: "暗殺教室",
  20931: "死亡遊行",
  20997: "Charlotte",
  20850: "東京喰種√A",
  20923: "食戟之靈",
  20832: "OVERLORD",
  20992: "排球少年!! 第二季",
  20920: "在地下城尋求邂逅是否搞錯了什麼",
  20829: "終結的熾天使",
  21128: "流浪神差 ARAGOTO",
  20799: "JoJo的奇妙冒險 星塵鬥士 埃及篇",
  20698: "果然我的青春戀愛喜劇搞錯了。續",
  20872: "可塑性記憶",
  20807: "監獄學園",
  // 2016
  21459: "我的英雄學院",
  21507: "路人超能100",
  21355: "Re:從零開始的異世界生活",
  21234: "只有我不存在的城市",
  21202: "為美好的世界獻上祝福！",
  21311: "文豪Stray Dogs",
  21170: "暗殺教室 第二季",
  21698: "排球少年!! 烏野高中 VS 白鳥澤學園高中",
  21450: "JoJo的奇妙冒險 不滅鑽石",
  21518: "食戟之靈 貳之皿",
  21647: "orange",
  21709: "Yuri!!! on ICE",
  21366: "3月的獅子",
  21421: "羈絆者 KIZNAIVER",
  21711: "91Days",
  // 2017
  20958: "進擊的巨人 第二季",
  21856: "我的英雄學院 第二季",
  97940: "黑色五葉草",
  98314: "狂賭之淵",
  98659: "歡迎來到實力至上主義的教室",
  97986: "來自深淵",
  21699: "為美好的世界獻上祝福！2",
  21776: "小林家的龍女僕",
  21613: "幼女戰記",
  98436: "魔法使的新娘",
  21857: "政宗君的復仇",
  99255: "食戟之靈 餐之皿",
  97938: "BORUTO-火影新世代-",
  21700: "不正經的魔術講師與禁忌教典",
  21685: "情色漫畫老師",
  // 2018
  99147: "進擊的巨人 第三季",
  100166: "我的英雄學院 第三季",
  101291: "青春豬頭少年不會夢到兔女郎學姊",
  21827: "紫羅蘭永恆花園",
  99423: "DARLING in the FRANXX",
  101280: "關於我轉生變成史萊姆這檔事",
  99578: "阿宅的戀愛太難",
  100388: "BANANA FISH",
  100240: "東京喰種:re",
  101165: "哥布林殺手",
  102883: "JoJo的奇妙冒險 黃金之風",
  100182: "Sword Art Online 刀劍神域 Alicization",
  99539: "七大罪 戒律的復活",
  98437: "OVERLORD II",
  100922: "GRAND BLUE 碧藍之海",
  // 2019
  101922: "鬼滅之刃",
  101759: "約定的夢幻島",
  104578: "進擊的巨人 第三季 Part.2",
  101921: "輝夜姬想讓人告白～天才們的戀愛頭腦戰～",
  105333: "Dr.STONE 新石紀",
  101348: "海盜戰記 VINLAND SAGA",
  104276: "我的英雄學院 第四季",
  105310: "炎炎消防隊",
  97668: "一拳超人 第二季",
  99263: "盾之勇者成名錄",
  101338: "路人超能100 II",
  101347: "多羅羅",
  103572: "五等分的新娘",
  105334: "Fruits Basket 幻影天使",
  107660: "BEASTARS",
  // 2020
  113415: "咒術迴戰",
  112641: "輝夜姬想讓人告白？～天才們的戀愛頭腦戰～",
  108632: "Re:從零開始的異世界生活 第二季",
  115230: "神之塔 Tower of God",
  113813: "租借女友",
  114236: "炎炎消防隊 貳之章",
  116006: "高校之神",
  106625: "排球少年!! TO THE TOP",
  112301: "魔王學院的不適任者～史上最強的魔王始祖、轉生就讀子孫們的學校～",
  116267: "總之就是非常可愛",
  108463: "地縛少年花子君",
  108489: "果然我的青春戀愛喜劇搞錯了。完",
  112124: "在地下城尋求邂逅是否搞錯了什麼 III",
  114308: "Sword Art Online 刀劍神域 Alicization War of Underworld 最終章",
  105228: "異獸魔都",
  // 2021
  110277: "進擊的巨人 最終季",
  124080: "堀與宮村",
  120120: "東京復仇者",
  108465: "無職轉生～到了異世界就拿出真本事～",
  117193: "我的英雄學院 第五季",
  129874: "鬼滅之刃 無限列車篇",
  113936: "Dr.STONE 新石紀 STONE WARS",
  108725: "約定的夢幻島 第二季",
  133965: "古見同學是溝通魯蛇。",
  114535: "致不滅的你",
  108511: "關於我轉生變成史萊姆這檔事 第二季",
  116589: "86 -不存在的戰區-",
  119661: "Re:從零開始的異世界生活 第二季 後半",
  124845: "WONDER EGG PRIORITY",
  120697: "別逗我了，長瀞同學",
  // 2022
  127230: "鏈鋸人",
  140960: "SPY×FAMILY 間諜家家酒",
  142329: "鬼滅之刃 遊郭篇",
  131681: "進擊的巨人 最終季 Part 2",
  132405: "戀上換裝娃娃",
  137822: "BLUE LOCK 藍色監獄",
  130298: "我想成為影之強者！",
  125367: "輝夜姬想讓人告白 -Ultra Romantic-",
  141391: "徹夜之歌",
  139630: "我的英雄學院 第六季",
  140439: "路人超能100 III",
  130003: "孤獨搖滾！",
  145545: "歡迎來到實力至上主義的教室 第二季",
  111321: "盾之勇者成名錄 第二季",
  129201: "夏日重現",
  // 2023
  145064: "咒術迴戰 第二季",
  154587: "葬送的芙莉蓮",
  145139: "鬼滅之刃 刀匠村篇",
  128893: "地獄樂",
  150672: "【我推的孩子】",
  161645: "藥師少女的獨語",
  151801: "MASHLE 魔法少年",
  136430: "海盜戰記 VINLAND SAGA 第二季",
  146065: "無職轉生 II ～到了異世界就拿出真本事～",
  159831: "殭屍100～在成為殭屍前要做的100件事～",
  158927: "SPY×FAMILY 間諜家家酒 第二季",
  155783: "天國大魔境",
  131518: "Dr.STONE 新石紀 NEW WORLD",
  154965: "和山田談場Lv999的戀愛",
  161964: "我想成為影之強者！ 第二季",
  // 2024
  151807: "我獨自升級",
  171018: "膽大黨",
  153288: "怪獸8號",
  166240: "鬼滅之刃 柱訓練篇",
  153518: "迷宮飯",
  166873: "無職轉生 II ～到了異世界就拿出真本事～ 第2部分",
  162804: "不時輕聲地以俄語遮羞的鄰座艾莉同學",
  163270: "WIND BREAKER 防風少年",
  163134: "Re:從零開始的異世界生活 第三季",
  146066: "歡迎來到實力至上主義的教室 第三季",
  156822: "關於我轉生變成史萊姆這檔事 第三季",
  166610: "MASHLE 魔法少年 神覺者候補選拔考試篇",
  163139: "我的英雄學院 第七季",
  136804: "為美好的世界獻上祝福！3",
  166531: "【我推的孩子】第二季",
  // 2025
  176496: "我獨自升級 第二季 -Arise from the Shadow-",
  178025: "Gachiakuta",
  185660: "膽大黨 第二季",
  181444: "薰香花朵凜然綻放",
  176301: "藥師少女的獨語 第二季",
  154768: "戀上換裝娃娃 第二季",
  153800: "一拳超人 第三季",
  178754: "怪獸8號 第二季",
  177689: "光逝去的夏天",
  149118: "炎炎消防隊 參之章",
  177937: "SPY×FAMILY 間諜家家酒 第三季",
  182896: "我的英雄學院 最終季",
  167336: "LAZARUS 拉撒路",
  172019: "Dr.STONE 新石紀 SCIENCE FUTURE",
  178680: "WIND BREAKER 防風少年 第二季",
  // ONA（Netflix 等網路動畫，納入 TV+ONA 後新進榜）
  21049: "ReLIFE 重返17歲", // 2016
  98460: "惡魔人 crybaby", // 2018
  110349: "大欺詐師 GREAT PRETENDER", // 2020
  120377: "電馭叛客：邊緣行者", // 2022
  177709: "SAKAMOTO DAYS 坂本日常", // 2025
  185407: "章魚嗶的原罪", // 2025
}

// 台灣從未代理（僅盜版站／查無正版）→ 從清單剔除，由候選池下一名遞補
const REMOVE = new Set<number>([
  79, // SHUFFLE! (2005)
  4087, // Michiko & Hatchin (2008)
  7785, // 四疊半神話大系 The Tatami Galaxy (2010)
  8795, // 弔帶襪天使 Panty & Stocking (2010)
  7593, // kiss×sis (2010)
  8861, // 緣之空 Yosuga no Sora (2010 遞補時跳過)
  7088, // 最後大魔王 Ichiban Ushiro no Daimaou (2010 遞補時跳過)
])

const LIMIT = 12

const raw: Record<string, Raw[]> = JSON.parse(fs.readFileSync("anime-raw.json", "utf8"))

const missing: Raw[] = []
const fanList: { year: string; zh: string; en: string }[] = []
const covers: { id: number; url: string; file: string }[] = []

// 把遠端封面圖轉成本地相對路徑（不含開頭斜線，UI 端會接上 BASE_URL，
// 才能同時在本機根路徑與 GitHub Pages 子路徑下正確載入；同源截圖也不破圖）
const localImage = (r: Raw): string => {
  if (!r.image) return ""
  const ext = (r.image.match(/\.(\w+)(?:\?|$)/)?.[1] ?? "jpg").toLowerCase()
  const path = `covers/${r.aniListId}.${ext}`
  covers.push({ id: r.aniListId, url: r.image, file: `public/${path}` })
  return path
}

const header = `import type { Language } from "./src/i18n"

type AnimeItem = {
  titleZh: string
  titleEn: string
  titleJa: string
  image: string
  popularity: number
  isSequel: boolean
  score: number
}

type Data = {
  [key: string]: AnimeItem[]
}

const data: Data = {`

const blocks: string[] = []
for (const year of Object.keys(raw)) {
  const picked = (raw[year] ?? []).filter((r) => !REMOVE.has(r.aniListId)).slice(0, LIMIT)
  if (picked.length < LIMIT) console.log(`⚠️ ${year} 剔除後只剩 ${picked.length} 部（候選池不足）`)
  const lines = picked.map((r) => {
    const v = TW[r.aniListId]
    let zh: string
    if (v === undefined) {
      missing.push(r)
      zh = r.titleEn || r.titleRomaji
    } else if (typeof v === "string") {
      zh = v
    } else {
      zh = v.zh
      fanList.push({ year, zh: v.zh, en: r.titleEn || r.titleRomaji })
    }
    const titleEn = r.titleEn || r.titleRomaji
    const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
    return `    { titleZh: "${esc(zh)}", titleEn: "${esc(titleEn)}", titleJa: "${esc(r.titleJa)}", image: "${esc(localImage(r))}", popularity: ${r.popularity ?? 0}, isSequel: ${r.isSequel ?? false}, score: ${r.score ?? 0} },`
  })
  blocks.push(`  "${year}": [\n${lines.join("\n")}\n  ],`)
}

const footer = `}

export default data

export const getAnimeTitle = (anime: AnimeItem, language: Language): string => {
  if (language === "en") return anime.titleEn
  if (language === "ja") return anime.titleJa
  return anime.titleZh
}
`

fs.writeFileSync("anime-data.ts", `${header}\n${blocks.join("\n")}\n${footer}`)
fs.writeFileSync("covers-manifest.json", JSON.stringify(covers, null, 2))

console.log(`已產生 anime-data.ts（封面 ${covers.length} 筆 → covers-manifest.json）\n`)
if (missing.length) {
  console.log(`⚠️ 有 ${missing.length} 筆找不到對照（用英文名暫代）：`)
  missing.forEach((m) => console.log(`  - [${m.aniListId}] ${m.titleRomaji}`))
  console.log("")
}
console.log(`【無台灣官方譯名、暫用通用譯名的清單】共 ${fanList.length} 部：`)
fanList.forEach((f) => console.log(`  ${f.year}  ${f.zh}   (${f.en})`))
