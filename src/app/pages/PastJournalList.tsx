import { useEffect, useMemo, useState } from "react";
import { ImageIcon, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useI18n } from "../i18n";
import { deleteEntry, DiaryEntry, emotionIcons, emotionKeys, getAllEntries, weatherKeys, WeatherKey, EmotionKey } from "../lib/storage";
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

const weatherEmoji: Record<WeatherKey, string> = { sunny: "☀️", cloudy: "⛅", rainy: "🌧️", foggy: "🌫️", windy: "💨", moonlit: "🌙", thunder: "⛈️", starry: "✨" };

function getWeatherEmoji(key: WeatherKey): string {
  return weatherEmoji[key] ?? "";
}

function entryDot(entry: DiaryEntry) {
  return entry.type === "emotion" ? "memory-dot memory-dot--emotion" : "memory-dot memory-dot--warm";
}

export default function PastJournalList() {
  const { language, t } = useI18n();
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState(() => getAllEntries());
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
          <div className="flex gap-1 border-b border-[rgba(217,205,197,0.35)] px-3 py-2">
            {filterLabels.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilterType(key)}
                className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                  filterType === key
                    ? "bg-[var(--pink)] text-white"
                    : "bg-[rgba(255,255,255,0.6)] text-[var(--muted)] hover:bg-[rgba(255,255,255,0.9)]"
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
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <Link to={routes.journalEntry(entry.id)} className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <time className="text-xs font-semibold text-[var(--muted)]">{formatDate(entry.timestamp, language)}</time>
                          <span className="text-[13px]">{entry.type === "emotion" ? (entry.emotions.length ? (emotionIcons[entry.emotions[0]] || "💧") : "💧") : (weatherKeys.includes(entry.weather as WeatherKey) ? getWeatherEmoji(entry.weather as WeatherKey) : "☀️")}</span>
                        </div>
                        <h2 className="mt-0.5 text-sm font-bold leading-tight line-clamp-1">{body ? (body.length > 40 ? body.slice(0, 40) + "…" : body) : entryTitle(entry, t)}</h2>
                      </Link>
                      <Link
                        to={routes.diaryLayout(entry.id)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--muted)]/50 bg-[rgba(255,255,255,0.88)] text-[var(--muted)] transition hover:bg-white active:scale-[0.98]"
                        aria-label="share card"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Link>
                      </div>
                  </article>
                );
              })
            ) : (
              <div className="collection-empty py-12">
                <div className="text-4xl opacity-40">{entries.length ? "🔍" : "📝"}</div>
                <p className="mt-3 text-lg font-bold">{t("past.noEntries")}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {entries.length ? t("past.tryDifferentSearch") : t("past.createFirst")}
                </p>
              </div>
            )}
          </div>
        </div>
        <aside className="memory-quiet-panel" aria-hidden="true">
          <img src="/assets/v2/rabbits/sitting.png" alt="" />
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
    </AppShell>
  );
}
