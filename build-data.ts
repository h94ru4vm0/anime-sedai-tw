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
  // 庫存補充（全球榜 rank 11–20，隱藏續作時會回補顯示）
  658: "鬥牌傳說",
  27: "聖魔之血",
  157: "魔法老師",
  469: "Karin 吸血少女",
  857: "飛輪少年",
  1530: "Kanon",
  1559: "史上最強弟子兼一",
  1565: "神奇寶貝 鑽石＆珍珠",
  1571: "靈異獵人",
  1691: "風之聖痕",
  1726: "Devil May Cry 惡魔獵人",
  2104: "瀨戶的花嫁",
  1698: "交響情人夢",
  2787: "灼眼的夏娜 II",
  5040: "ONE OUTS",
  4975: "ChäoS;HEAd",
  3701: "Kaiba",
  3503: "狐仙的誘惑",
  5258: "第一神拳 New Challenger",
  6205: "Kämpfer 戰鬥少女",
  6811: "犬夜叉 完結篇",
  5300: "續 夏目友人帳",
  7193: "青色文學",
  8841: "這個是殭屍嗎？",
  9969: "銀魂'",
  9513: "惡魔奶爸",
  10161: "NO.6",
  10162: "白兔玩偶",
  13125: "來自新世界",
  14467: "K",
  14713: "元氣少女緣結神",
  14345: "BTOOOM!",
  14289: "好想大聲說喜歡你",
  11633: "Blood Lad 鮮血高校",
  16067: "來自風平浪靜的明天",
  14749: "我女友與青梅竹馬的修羅場",
  16417: "玉子市場",
  18277: "噬血狂襲",
  20668: "月刊少女野崎君",
  20770: "拂曉的尤娜",
  20457: "黑色子彈",
  20631: "Trinity Seven 七人魔法使",
  20626: "魔導少年 FAIRY TAIL（2014）",
  21092: "落第騎士英雄譚",
  20727: "血界戰線",
  21175: "七龍珠 超",
  20910: "下流梗不存在的灰暗世界",
  20792: "Fate/stay night [UBW] 第二季",
  21196: "甲鐵城的卡巴內里",
  21595: "在下坂本，有何貴幹？",
  21428: "灰與幻想的格林姆迦爾",
  21385: "七大罪 聖戰的印記",
  97994: "調教咖啡廳",
  21701: "人渣的本願",
  21861: "青之驅魔師 京都不淨王篇",
  97766: "GAMERS！電玩咖",
  97922: "一個人的最終兵器",
  21127: "命運石之門 0",
  99629: "殺戮天使",
  101004: "異世界魔王與召喚少女的奴隸魔術",
  100977: "工作細胞",
  101167: "在地下城尋求邂逅是否搞錯了什麼 II",
  100876: "狂賭之淵 ××",
  100668: "平凡職業造就世界最強",
  103139: "家有女友",
  108759: "Sword Art Online 刀劍神域 Alicization War of Underworld",
  111762: "Fruits Basket 第二季",
  106479: "怕痛的我，把防禦力點滿就對了",
  105190: "達爾文遊戲",
  114888: "富豪刑警 Balance:UNLIMITED",
  124153: "SK8 的無限滑闆",
  109261: "五等分的新娘 ∬",
  113717: "國王排名",
  131646: "凡尼塔斯的手記",
  129898: "世界頂尖的暗殺者 轉生為異世界貴族",
  127911: "式守同學不只可愛而已",
  143270: "莉可麗絲 Lycoris Recoil",
  116674: "BLEACH 死神 千年血戰篇",
  133844: "OVERLORD IV",
  151970: "香格里拉・開拓異境～糞作獵手挑戰神作～",
  151806: "智子同學是女生！",
  143338: "關於鄰居的天使大人不知不覺把我寵廢這件事",
  163132: "堀與宮村 補遺",
  153152: "我內心的糟糕念頭",
  174576: "魔杖與利劍的魔法使",
  170942: "藍箱",
  163146: "BLUE LOCK 藍色監獄 第二季",
  166794: "向你訴說愛意",
  171457: "敗北女角太多了！",
  175914: "徹夜之歌 第二季",
  180367: "WITCH WATCH 魔女守護者",
  183161: "我轉生成超凡入聖的國王",
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

const LIMIT = 20 // 每年存進資料庫的全球榜數量（畫面顯示 10，多存的供回補/續作篩選）

type TwBase = { sn: number; title: string; views: number; year: number; image: string }
type TwEnr = {
  jp: string
  en: string
  aniListId: number | null
  image: string
  format?: string
  seqByRel?: boolean
}

const raw: Record<string, Raw[]> = JSON.parse(fs.readFileSync("anime-raw.json", "utf8"))
const twData: Record<string, TwBase[]> = JSON.parse(fs.readFileSync("anime-tw.json", "utf8"))

// enrich 結果（日文名 + AniList 縮圖）依 sn 疊加；尚未 enrich 的年份自動退回中文/英文去重、無封面
const enrichedMap = new Map<number, TwEnr>()
try {
  const e: Record<string, (TwBase & TwEnr)[]> = JSON.parse(
    fs.readFileSync("anime-tw-enriched.json", "utf8"),
  )
  for (const y of Object.keys(e))
    for (const it of e[y] ?? [])
      enrichedMap.set(it.sn, {
        jp: it.jp,
        en: it.en,
        aniListId: it.aniListId,
        image: it.image,
        format: (it as TwEnr).format,
        seqByRel: (it as TwEnr).seqByRel,
      })
} catch {
  // 沒有 enrich 檔也能跑
}

const TW_ADD = 6 // 每年存進資料庫的台灣補充數量（畫面顯示 2，多存的供回補）

// 系列分群（由 AniList 關係算出的 union-find 根 id），供畫面端「每系列只顯示首次出現」精準去重
const franchiseMap: Record<number, number> = (() => {
  try {
    return JSON.parse(fs.readFileSync("franchise-map.json", "utf8"))
  } catch {
    return {}
  }
})()
const frOf = (id: number | null | undefined) => (id ? `g${franchiseMap[id] ?? id}` : "")

const missing: Raw[] = []
const fanList: { year: string; zh: string; en: string }[] = []
const covers: { id: number; url: string; file: string }[] = []

const decode = (s: string) =>
  s
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')

// 標題正規化（用於和全球榜去重）：去季數、空白、標點、英數尾綴
const norm = (s: string) =>
  decode(s)
    .toLowerCase()
    .replace(/第[0-9０-９一二三四五六七八九十]{1,3}[季期章部]/g, "")
    .replace(/\b(season|part|cour|final)\b\s*[0-9]*/g, "")
    .replace(/[\s・！!？?:：~～\-‐‑–—―－.,。、〜【】[\]()（）♥☆★]/g, "")
    .replace(/\b(ii|iii|iv|vi{0,3})\b/g, "") // 羅馬數字季數（II/III…）
    .replace(/[ivx]+$/, "")

const isSeq = (t: string) =>
  /第[2-9２-９二三四五六七八九]|season\s*[2-9]|part\s*[2-9]|\bs[2-9]\b|\s[2-9]$|續|2nd|3rd|4th|最終|完結|final|ファイナル|[ⅡⅢⅣ]|∬|series\s*[2-9]/i.test(t)

// 動畫瘋對電影版命名一致（劇場版／電影／THE MOVIE／總集篇）→ 排除，與全球榜「只收 TV+ONA」一致
const isMovie = (t: string) =>
  /劇場版|劇場|電影|\bmovie\b|映画|総集[編篇]|總集篇|特別[篇編]|蠟筆小新[：:]|クレヨンしんちゃん/i.test(t)

// 日文標題正規化（最準的去重依據：同為日文動漫原名）
const normJa = (s: string) =>
  decode(s)
    .toLowerCase()
    .replace(/第[0-9０-９一二三四五六七八九十]+[期季章部]/g, "")
    .replace(/[ⅡⅢⅣⅤ]/g, "")
    .replace(/[\s　・！!？?:：~〜～\-‐‑–—―－.,。、'’"]/g, "")

// 抽出標題裡的英文/羅馬字 token（≥4 字），用於跨譯名去重（如「肌肉魔法使-MASHLE-」↔「MASHLE 魔法少年」）
const LATIN_STOP = new Set([
  "season", "part", "final", "cour", "movie", "special", "the", "anime",
])
const latin = (s: string) =>
  (decode(s).toLowerCase().match(/[a-z0-9]{4,}/g) ?? []).filter((w) => !LATIN_STOP.has(w))

// 把遠端封面圖轉成本地相對路徑（不含開頭斜線，UI 端會接上 BASE_URL，
// 才能同時在本機根路徑與 GitHub Pages 子路徑下正確載入；同源截圖也不破圖）
const localImage = (r: Raw): string => {
  if (!r.image) return ""
  const ext = (r.image.match(/\.(\w+)(?:\?|$)/)?.[1] ?? "jpg").toLowerCase()
  const path = `covers/${r.aniListId}.${ext}`
  covers.push({ id: r.aniListId, url: r.image, file: `public/${path}` })
  return path
}

// 台灣補充用 AniList 縮圖（依英文名查到的）；無則回空字串
const twCover = (enr?: TwEnr): string => {
  if (!enr?.image || !enr.aniListId) return ""
  const ext = (enr.image.match(/\.(\w+)(?:\?|$)/)?.[1] ?? "jpg").toLowerCase()
  const path = `covers/tw-${enr.aniListId}.${ext}`
  covers.push({ id: enr.aniListId, url: enr.image, file: `public/${path}` })
  return path
}

const resolveZh = (r: Raw, year: string): string => {
  const v = TW[r.aniListId]
  if (v === undefined) {
    missing.push(r)
    return r.titleEn || r.titleRomaji
  }
  if (typeof v === "string") return v
  fanList.push({ year, zh: v.zh, en: r.titleEn || r.titleRomaji })
  return v.zh
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
  tw: boolean
  franchise: string
}

type Data = {
  [key: string]: AnimeItem[]
}

const data: Data = {`

const blocks: string[] = []
const twPicksOut: { sn: number; title: string; views: number; year: number }[] = []
let twAddedTotal = 0
for (const year of Object.keys(raw)) {
  const picked = (raw[year] ?? []).filter((r) => !REMOVE.has(r.aniListId)).slice(0, LIMIT)
  if (picked.length < LIMIT) console.log(`⚠️ ${year} 剔除後只剩 ${picked.length} 部（候選池不足）`)

  // 全球榜（存 LIMIT 部）
  const globalZh = picked.map((r) => resolveZh(r, year))
  const globalNorm = globalZh.map(norm).filter(Boolean)
  const globalJa = picked.map((r) => normJa(r.titleJa)).filter(Boolean) // 日文去重依據
  const globalLatin = new Set(
    picked.flatMap((r, i) => [
      ...latin(globalZh[i] ?? ""),
      ...latin(r.titleEn || ""),
      ...latin(r.titleRomaji || ""),
    ]),
  )
  const globalLines = picked.map((r, i) => {
    const titleEn = r.titleEn || r.titleRomaji
    return `    { titleZh: "${esc(globalZh[i] ?? "")}", titleEn: "${esc(titleEn)}", titleJa: "${esc(r.titleJa)}", image: "${esc(localImage(r))}", popularity: ${r.popularity ?? 0}, isSequel: ${r.isSequel ?? false}, score: ${r.score ?? 0}, tw: false, franchise: "${frOf(r.aniListId)}" },`
  })

  // 動畫瘋台灣人氣補充：取該年觀看數最高、且不在全球榜裡的前 TW_ADD 部
  // 去重優先用日文原名（最準，需 enrich 過），輔以中文與英文 token
  const twPicks: TwBase[] = []
  const jaDup = (jn: string, list: string[]) =>
    !!jn && list.some((g) => g === jn || (g.length >= 3 && (jn.includes(g) || g.includes(jn))))
  const normDup = (tn: string, list: string[]) =>
    list.some((g) => g === tn || (g.length >= 4 && (tn.includes(g) || g.includes(tn))))
  for (const t of twData[year] ?? []) {
    if (twPicks.length >= TW_ADD) break
    const enr = enrichedMap.get(t.sn)
    // 只收 TV/ONA：有 AniList format 就以它為準（排除電影/OVA/特別篇）；沒有則退回標題判斷
    if (
      enr?.format
        ? !["TV", "ONA"].includes(enr.format)
        : isMovie(`${t.title} ${enr?.en ?? ""} ${enr?.jp ?? ""}`)
    )
      continue
    const tn = norm(t.title)
    if (!tn) continue
    const jn = normJa(enr?.jp ?? "")
    const tl = latin(t.title)
    if (jaDup(jn, globalJa)) continue // 日文去重（最準）
    if (normDup(tn, globalNorm)) continue // 中文去重
    if (tl.some((w) => globalLatin.has(w))) continue // 英文 token 去重
    if (jaDup(jn, twPicks.map((p) => normJa(enrichedMap.get(p.sn)?.jp ?? "")))) continue
    if (normDup(tn, twPicks.map((p) => norm(p.title)))) continue
    twPicks.push(t)
  }
  const twLines = twPicks.map((t) => {
    const enr = enrichedMap.get(t.sn)
    const zh = decode(t.title)
    const en = enr?.en || zh
    const ja = enr?.jp || zh
    const seq = enr?.seqByRel ?? (isSeq(zh) || isSeq(ja))
    const fr = enr?.aniListId ? frOf(enr.aniListId) : `t${normJa(ja)}`
    return `    { titleZh: "${esc(zh)}", titleEn: "${esc(en)}", titleJa: "${esc(ja)}", image: "${esc(twCover(enr))}", popularity: ${t.views}, isSequel: ${seq}, score: 0, tw: true, franchise: "${esc(fr)}" },`
  })
  twAddedTotal += twLines.length
  twPicksOut.push(...twPicks.map((t) => ({ sn: t.sn, title: t.title, views: t.views, year: Number(year) })))

  blocks.push(`  "${year}": [\n${[...globalLines, ...twLines].join("\n")}\n  ],`)
}

// 實際被選進 data 的台灣補充清單（供 enrich 針對性抓日文名＋封面）
fs.writeFileSync("tw-picks.json", JSON.stringify(twPicksOut, null, 2))

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

console.log(
  `已產生 anime-data.ts（封面 ${covers.length} 筆、動畫瘋台灣補充 ${twAddedTotal} 部 → covers-manifest.json）\n`,
)
if (missing.length) {
  console.log(`⚠️ 有 ${missing.length} 筆找不到對照（用英文名暫代）：`)
  missing.forEach((m) => console.log(`  - [${m.aniListId}] ${m.titleRomaji}`))
  console.log("")
}
console.log(`【無台灣官方譯名、暫用通用譯名的清單】共 ${fanList.length} 部：`)
fanList.forEach((f) => console.log(`  ${f.year}  ${f.zh}   (${f.en})`))
