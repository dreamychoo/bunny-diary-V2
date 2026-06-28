import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Trash2 } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { GardenNav } from "../components/GardenNav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useI18n } from "../i18n";
import { deleteEntry, DiaryEntry, emotionKeys, getAllEntries, weatherKeys, WeatherKey, EmotionKey } from "../lib/storage";
import { routes } from "../routes";

function formatDate(timestamp: string, language: string) {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(timestamp));
}

function optionLabel(value: string, prefix: string, knownValues: readonly string[], t: (key: string) => string) {
  return knownValues.includes(value) ? t(`${prefix}.${value}`) : value;
}

function entryBody(entry: DiaryEntry) {
  if (entry.type === "emotion") return entry.whatHappened || entry.childhood || "";
  return entry.gratitude || "";
}

function entryTitle(entry: DiaryEntry, t: (key: string) => string) {
  if (entry.type === "emotion") {
    const emotions = entry.emotions.map((emotion) => optionLabel(emotion, "emotionKey", emotionKeys, t));
    if (emotions.length) return emotions.join(", ");
    return t("common.emotionRescue");
  }
  return t("common.dailyWarmth");
}

const emotionIcons: Record<string, string> = {
  sadness: "💧", anger: "🌶️", anxiety: "⚡", disappointed: "🌧️",
  drained: "🌙", frustrated: "🐝", numbness: "◌", loneliness: "🍂",
  hurt: "🫧", overwhelm: "🪨", shame: "🌫️", confused: "❔",
  rejected: "🚪", stressed: "📦", jealous: "🌵", hopeless: "🌑",
  guilty: "🧵", fear: "🐾", empty: "☁️", sensitive: "🌼",
  on_edge: "🌊", avoidant: "🍃", unseen: "📭", ignored: "👁️",
  lost: "🧭", tenderness: "🫶", moved: "✨", calm: "🕊️",
  grateful: "☀️", hopeful: "🌱"
};

function getWeatherEmoji(key: WeatherKey): string {
  const map: Record<WeatherKey, string> = { sunny: "☀️", cloudy: "⛅", rainy: "🌧️", foggy: "🌫️", windy: "💨", moonlit: "🌙", thunder: "⛈️", starry: "✨" };
  return map[key] ?? "";
}

function entryDot(entry: DiaryEntry) {
  return entry.type === "emotion" ? "memory-dot memory-dot--emotion" : "memory-dot memory-dot--warm";
}

export default function PastJournalList() {
  const { language, t } = useI18n();
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState(() => getAllEntries());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "emotion" | "warmth">("all");

  useEffect(() => {
    setEntries(getAllEntries());
  }, []);

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (filterType === "emotion") result = result.filter((e) => e.type === "emotion");
    if (filterType === "warmth") result = result.filter((e) => e.type === "warmth");

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return result;

    return result.filter((entry) => {
      const searchText = entryBody(entry).toLowerCase();
      if (entry.type === "emotion") {
        const emotionText = entry.emotions.map((em) => optionLabel(em, "emotionKey", emotionKeys, t)).join(" ");
        return `${emotionText} ${searchText}`.includes(normalizedQuery);
      }
      return searchText.includes(normalizedQuery);
    });
  }, [entries, query, t, filterType]);

  function handleDelete(id: string) {
    deleteEntry(id);
    setPendingDeleteId(null);
    setEntries(getAllEntries());
  }

  const emotionCount = entries.filter((e) => e.type === "emotion").length;
  const warmthCount = entries.filter((e) => e.type === "warmth").length;
  const filterLabels = [
    { key: "all", label: language === "zh" ? `全部 (${entries.length})` : `All (${entries.length})` },
    { key: "emotion", label: language === "zh" ? `💧 ${emotionCount}` : `💧 ${emotionCount}` },
    { key: "warmth", label: language === "zh" ? `☀️ ${warmthCount}` : `☀️ ${warmthCount}` }
  ] as const;

  return (
    <AppShell title={t("past.title")} subtitle={t("past.subtitle")} headerMascotVariant="memory" wide>
      <section className="memory-book-layout">
        <div className="memory-list-panel">
          <div className="relative memory-search">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718ba5]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("past.search")}
              className="pl-11"
            />
          </div>
          <div className="flex gap-1 border-b border-[#e8ded2] px-3 py-2">
            {filterLabels.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilterType(key)}
                className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                  filterType === key
                    ? "bg-[#4a3b34] text-white"
                    : "bg-[#f0ece7] text-[#7f746e] hover:bg-[#e8e2db]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="memory-timeline">
            {filteredEntries.length ? (
              filteredEntries.map((entry) => {
                const body = entryBody(entry);

                return (
                  <article key={entry.id} className="memory-row">
                    <span className={entryDot(entry)} />
                    <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <Link to={routes.journalEntry(entry.id)} className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <time className="text-xs font-semibold text-[#7f746e]">{formatDate(entry.timestamp, language)}</time>
                          <span className="text-[13px]">{entry.type === "emotion" ? (entry.emotions.length ? (emotionIcons[entry.emotions[0]] || "💧") : "💧") : (weatherKeys.includes(entry.weather as WeatherKey) ? getWeatherEmoji(entry.weather as WeatherKey) : "☀️")}</span>
                        </div>
                        <h2 className="mt-1 text-base font-bold leading-tight line-clamp-1">{body ? (body.length > 40 ? body.slice(0, 40) + "…" : body) : entryTitle(entry, t)}</h2>
                        {body && <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#7f6b62]">{body}</p>}
                      </Link>
                      {pendingDeleteId === entry.id ? (
                        <div className="flex flex-wrap gap-2 rounded-3xl bg-[#fff3f1] p-2 sm:justify-end">
                          <Button type="button" variant="danger" onClick={() => handleDelete(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                            {t("common.deleteForever")}
                          </Button>
                          <Button type="button" variant="ghost" onClick={() => setPendingDeleteId(null)}>
                            {t("common.cancel")}
                          </Button>
                        </div>
                      ) : (
                        <Button type="button" variant="ghost" onClick={() => setPendingDeleteId(entry.id)} aria-label={t("past.deleteEntry")}>
                          <Trash2 className="h-4 w-4" />
                          {t("common.delete")}
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="collection-empty py-12">
                <div className="text-4xl opacity-40">{entries.length ? "🔍" : "📝"}</div>
                <p className="mt-3 text-lg font-bold">{t("past.noEntries")}</p>
                <p className="mt-1 text-sm text-[#7f746e]">
                  {entries.length ? t("past.tryDifferentSearch") : t("past.createFirst")}
                </p>
              </div>
            )}
          </div>
        </div>
        <aside className="memory-quiet-panel" aria-hidden="true">
          <img src="/mascot/poses/memory.png" alt="" />
          {query ? (
            <p className="font-display mt-2 text-sm">
              {language === "zh"
                ? `找到 ${filteredEntries.length} 条`
                : `Found ${filteredEntries.length} entries`}
            </p>
          ) : (
            <p className="font-display">{t("past.quietLine")}</p>
          )}
          {filteredEntries.length > 0 && !query && (
            <p className="mt-4 text-xs text-[#a89e97]">
              {language === "zh" ? `共 ${filteredEntries.length} 条记录` : `${filteredEntries.length} entries total`}
            </p>
          )}
        </aside>
      </section>
      <GardenNav />
    </AppShell>
  );
}
