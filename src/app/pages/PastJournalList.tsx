import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Trash2 } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { GardenNav } from "../components/GardenNav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useI18n } from "../i18n";
import { deleteEntry, DiaryEntry, emotionKeys, getAllEntries, moodKeys, symptomKeys, weatherKeys } from "../lib/storage";
import { routes } from "../routes";

function formatDate(timestamp: string, language: string) {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

function optionLabel(value: string, prefix: string, knownValues: readonly string[], t: (key: string) => string) {
  return knownValues.includes(value) ? t(`${prefix}.${value}`) : value;
}

function entryText(entry: DiaryEntry, t: (key: string) => string) {
  if (entry.type === "emotion") {
    return [
      entry.emotions.map((emotion) => optionLabel(emotion, "emotionKey", emotionKeys, t)).join(", "),
      entry.symptoms.map((symptom) => optionLabel(symptom, "symptomKey", symptomKeys, t)).join(", "),
      entry.whatHappened,
      entry.childhood,
      entry.beliefs
    ].join(" ");
  }

  return [
    optionLabel(entry.mood, "moodKey", moodKeys, t),
    optionLabel(entry.weather, "weatherKey", weatherKeys, t),
    entry.gratitude,
    entry.success
  ].join(" ");
}

function entryTitle(entry: DiaryEntry, t: (key: string) => string) {
  if (entry.type === "emotion") {
    return entry.emotions.length ? entry.emotions.map((emotion) => optionLabel(emotion, "emotionKey", emotionKeys, t)).join(", ") : t("common.emotionRescue");
  }

  return entry.mood ? optionLabel(entry.mood, "moodKey", moodKeys, t) : t("common.dailyWarmth");
}

function entryTone(entry: DiaryEntry) {
  return entry.type === "emotion"
    ? {
        card: "border-[#e5c8c4]/55 bg-[#f8efee]",
        badge: "border border-[#e5c8c4]/60 bg-[#ffffff] text-[#7f6b62]",
        date: "text-[#7f746e]"
      }
    : {
        card: "border-[#e6c779]/55 bg-[#fbf3dc]",
        badge: "border border-[#e6c779]/60 bg-[#ffffff] text-[#8a7041]",
        date: "text-[#8d7440]"
      };
}

export default function PastJournalList() {
  const { language, t } = useI18n();
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState(() => getAllEntries());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return entries;

    return entries.filter((entry) => `${entry.type} ${entryTitle(entry, t)} ${entryText(entry, t)}`.toLowerCase().includes(normalizedQuery));
  }, [entries, query, t]);

  function handleDelete(id: string) {
    deleteEntry(id);
    setPendingDeleteId(null);
    setEntries(getAllEntries());
  }

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
          <div className="memory-timeline">
        {filteredEntries.length ? (
          filteredEntries.map((entry) => {
            const tone = entryTone(entry);

            return (
              <article key={entry.id} className="memory-row">
                <span className={entry.type === "emotion" ? "memory-dot memory-dot--emotion" : "memory-dot memory-dot--warm"} />
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <Link to={routes.journalEntry(entry.id)} className="min-w-0 flex-1">
                    <time className={`text-sm font-semibold ${tone.date}`}>{formatDate(entry.timestamp, language)}</time>
                    <h2 className="mt-1 text-lg font-bold">{entryTitle(entry, t)}</h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#7f6b62]">{entryText(entry, t).trim() || t("common.noNoteText")}</p>
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
            <p className="text-lg font-bold">{t("past.noEntries")}</p>
            <p className="mt-2 text-sm text-[#7f746e]">
              {entries.length ? t("past.tryDifferentSearch") : t("past.createFirst")}
            </p>
          </div>
        )}
          </div>
        </div>
        <aside className="memory-quiet-panel" aria-hidden="true">
          <img src="/mascot/poses/memory.png" alt="" />
          <p className="font-display">{t("past.quietLine")}</p>
        </aside>
      </section>
      <GardenNav />
    </AppShell>
  );
}
