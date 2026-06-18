import { useMemo, useRef, useState, useEffect } from "react"
import animeData, { getAnimeTitle } from "../anime-data"
import { domToBlob } from "modern-screenshot"
import { toast } from "sonner"
import { usePersistState } from "./hooks"
import { useI18n } from "./i18n-context"
import { LanguageToggle } from "./LanguageToggle"

type YearRange = "5" | "10" | "15" | "all"

const yearRangeOptions: YearRange[] = ["5", "10", "15", "all"]
const allYears = Object.keys(animeData).sort((a, b) => Number(a) - Number(b))

export const App = () => {
  const { t, language } = useI18n()
  const [selectedAnime, setSelectedAnime] = usePersistState<string[]>(
    "selectedAnime",
    []
  )
  const [yearRange, setYearRange] = usePersistState<YearRange>(
    "yearRange",
    "all"
  )
  const [hideSequels, setHideSequels] = usePersistState<boolean>(
    "hideSequels",
    false
  )
  const [displayMode, setDisplayMode] = usePersistState<
    "title" | "score" | "heat"
  >("displayMode", "title")
  // 匯出（下載/複製圖片）時暫時隱藏封面，純文字輸出 → 快很多、檔案也小
  const [exporting, setExporting] = useState(false)

  const visibleYears = useMemo(() => {
    if (yearRange === "all") {
      return allYears
    }

    return allYears.slice(-Number(yearRange))
  }, [yearRange])

  const itemsForYear = (year: string) => {
    const items = animeData[year] || []
    return hideSequels ? items.filter((item) => !item.isSequel) : items
  }

  const visibleAnimeKeys = useMemo(() => {
    return visibleYears.flatMap((year) =>
      itemsForYear(year).map((item) => getAnimeTitle(item, "zh"))
    )
  }, [visibleYears, hideSequels])

  const visibleAnimeKeySet = useMemo(() => {
    return new Set(visibleAnimeKeys)
  }, [visibleAnimeKeys])

  const selectedVisibleAnimeCount = selectedAnime.filter((title) => {
    return visibleAnimeKeySet.has(title)
  }).length

  const getYearRangeLabel = (option: YearRange) => {
    switch (option) {
      case "5":
        return t("last5Years")
      case "10":
        return t("last10Years")
      case "15":
        return t("last15Years")
      case "all":
        return t("allYears")
    }
  }

  const wrapper = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = t("title")
  }, [language, t])

  const imageToBlob = async () => {
    if (!wrapper.current) return

    setExporting(true)
    // 等 React 重新渲染成「無封面」版本後再截圖
    await new Promise((r) => setTimeout(r, 60))

    try {
      return await domToBlob(wrapper.current, {
        scale: 2,
        filter(el) {
          if (el instanceof HTMLElement && el.classList.contains("remove")) {
            return false
          }
          return true
        },
      })
    } finally {
      setExporting(false)
    }
  }

  const copyImage = async () => {
    const blob = await imageToBlob()

    if (!blob) return

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ])
  }

  const downloadImage = async () => {
    if (!wrapper.current) return

    const blob = await imageToBlob()

    if (!blob) return

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "anime-sedai.png"
    a.click()

    URL.revokeObjectURL(url)
  }

  const totalAnime = visibleAnimeKeys.length

  const formatHeat = (n: number) =>
    n >= 1_000_000
      ? (n / 1_000_000).toFixed(1) + "M"
      : n >= 1_000
        ? Math.round(n / 1_000) + "K"
        : String(n)

  return (
    <>
      <div className="flex flex-col gap-4 pb-10">
        <div className="p-4 flex flex-col md:items-center">
          <p className="mb-3 max-w-screen-md text-center text-sm text-gray-600">
            {t("rules")}
          </p>
          <div className="flex w-full flex-col gap-2 mb-4 md:flex-row md:items-center md:justify-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t("yearRange")}:</span>
              <select
                className="border rounded px-2 py-1 text-sm bg-white"
                value={yearRange}
                onChange={(e) => {
                  setYearRange(e.currentTarget.value as YearRange)
                }}
              >
                {yearRangeOptions.map((option) => (
                  <option key={option} value={option}>
                    {getYearRangeLabel(option)}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-1.5 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={hideSequels}
                onChange={(e) => setHideSequels(e.currentTarget.checked)}
              />
              {t("hideSequels")}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t("display")}:</span>
              <div className="inline-flex rounded border overflow-hidden text-sm">
                {(
                  [
                    ["title", "byTitle"],
                    ["score", "byScore"],
                    ["heat", "byHeat"],
                  ] as const
                ).map(([mode, key]) => (
                  <button
                    key={mode}
                    type="button"
                    className={`px-2 py-1 ${
                      displayMode === mode
                        ? "bg-zinc-800 text-white"
                        : "bg-white hover:bg-zinc-100"
                    }`}
                    onClick={() => setDisplayMode(mode)}
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>
            <LanguageToggle />
          </div>
          <div className="w-full overflow-x-auto">
            <div
              className="flex flex-col border border-b-0 bg-white w-fit mx-auto"
              ref={wrapper}
            >
              <div className="border-b justify-between p-2 text-lg  font-bold flex">
                <h1>
                  {t("title")}
                  <span className="remove"> - {t("subtitle")}</span>
                </h1>
                <span className="shrink-0 whitespace-nowrap">
                  {t("watchedCount", {
                    count: selectedVisibleAnimeCount,
                    total: totalAnime,
                  })}
                </span>
              </div>
              {visibleYears.map((year) => {
                const items = itemsForYear(year)
                return (
                  <div key={year} className="flex border-b">
                    <div
                      className={`bg-red-500 shrink-0 text-white flex items-center font-bold justify-center p-1 border-black w-16 md:w-20 ${
                        exporting ? "" : "h-[142px]"
                      }`}
                    >
                      <span
                        className={`${
                          language === "en"
                            ? "text-sm md:text-base"
                            : "text-base"
                        } text-center`}
                      >
                        {year}
                      </span>
                    </div>
                    <div className="flex shrink-0">
                      {items.slice(0, 15).map((item) => {
                        const animeKey = getAnimeTitle(item, "zh")
                        const displayTitle = getAnimeTitle(item, language)
                        const isSelected = selectedAnime.includes(animeKey)
                        return (
                          <button
                            key={animeKey}
                            className={`relative w-[100px] border-l shrink-0 overflow-hidden cursor-pointer transition-colors duration-200 ${
                              exporting ? "min-h-[52px]" : "h-[142px]"
                            }`}
                            title={displayTitle}
                            onClick={() => {
                              setSelectedAnime((prev) => {
                                if (isSelected) {
                                  return prev.filter(
                                    (title) => title !== animeKey
                                  )
                                }
                                return [...prev, animeKey]
                              })
                            }}
                          >
                            {exporting ? (
                              <div
                                className={`flex h-full min-h-[52px] items-center justify-center p-1 text-center leading-snug text-black text-sm font-medium ${
                                  isSelected ? "bg-green-200" : "bg-white"
                                }`}
                              >
                                {displayTitle}
                              </div>
                            ) : (
                              <>
                                {item.image && (
                                  <img
                                    src={import.meta.env.BASE_URL + item.image}
                                    alt=""
                                    loading="lazy"
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                )}
                                {displayMode === "title" ? (
                                  <span
                                    className={`absolute inset-x-0 bottom-0 flex items-end justify-center p-1 pt-6 text-center text-white bg-gradient-to-t from-black/85 via-black/55 to-transparent ${
                                      language === "en" ? "text-[10px]" : "text-xs"
                                    }`}
                                  >
                                    <span
                                      className={`leading-tight w-full ${
                                        language === "en"
                                          ? "line-clamp-5"
                                          : "line-clamp-4"
                                      }`}
                                    >
                                      {displayTitle}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold bg-black/55">
                                    {displayMode === "score"
                                      ? `★ ${item.score}`
                                      : `🔥 ${formatHeat(item.popularity)}`}
                                  </span>
                                )}
                                {isSelected && (
                                  <span className="absolute inset-0 flex items-center justify-center bg-green-500/60 text-white text-2xl font-bold">
                                    ✓
                                  </span>
                                )}
                              </>
                            )}
                          </button>
                        )
                      })}
                      <div
                        className={`w-0 border-r ${exporting ? "" : "h-[142px]"}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <button
            type="button"
            className="border rounded-md px-4 py-2 inline-flex"
            onClick={() => {
              setSelectedAnime((prev) => {
                const hiddenSelectedAnime = prev.filter((title) => {
                  return !visibleAnimeKeySet.has(title)
                })

                return [...hiddenSelectedAnime, ...visibleAnimeKeys]
              })
            }}
          >
            {t("selectAll")}
          </button>

          {selectedVisibleAnimeCount > 0 && (
            <button
              type="button"
              className="border rounded-md px-4 py-2 inline-flex"
              onClick={() => {
                setSelectedAnime((prev) => {
                  return prev.filter((title) => !visibleAnimeKeySet.has(title))
                })
              }}
            >
              {t("clear")}
            </button>
          )}

          <button
            type="button"
            className="border rounded-md px-4 py-2 inline-flex"
            onClick={() => {
              toast.promise(copyImage(), {
                success: t("copySuccess"),
                loading: t("copying"),
                error(error) {
                  return t("copyFailed", {
                    error:
                      error instanceof Error
                        ? error.message
                        : t("unknownError"),
                  })
                },
              })
            }}
          >
            {t("copyImage")}
          </button>

          <button
            type="button"
            className="border rounded-md px-4 py-2 inline-flex"
            onClick={() => {
              toast.promise(downloadImage(), {
                success: t("downloadSuccess"),
                loading: t("downloading"),
                error(error) {
                  return t("downloadFailed", {
                    error:
                      error instanceof Error
                        ? error.message
                        : t("unknownError"),
                  })
                },
              })
            }}
          >
            {t("downloadImage")}
          </button>
        </div>

        {language === "en" && (
          <div className="text-center text-sm text-gray-600">
            English version is translated by{" "}
            <a
              href="https://mhh0318.github.io/"
              target="_blank"
              className="underline"
            >
              h1t
            </a>
          </div>
        )}
      </div>
    </>
  )
}
