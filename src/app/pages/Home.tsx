import { BookOpen, ChevronRight, Heart, NotebookPen, Sparkles, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { cn } from "../components/ui/utils";
import { useI18n } from "../i18n";
import { getAllEntries, type DiaryEntry } from "../lib/storage";
import { routes } from "../routes";

type Tone = "emotion" | "warm" | "memory" | "garden" | "companion";

const toneStyles: Record<Tone, { border: string; tab: string; icon: string }> = {
  emotion: {
    border: "border-[#e5c8c4]/42",
    tab: "border-[#e5c8c4]/55 bg-[#f8efee] text-[#ad7f7b]",
    icon: "border-[#e5c8c4]/50 bg-[#f8efee] text-[#ad7f7b]"
  },
  warm: {
    border: "border-[#e6c779]/38",
    tab: "border-[#e6c779]/55 bg-[#fbf3dc] text-[#9b7d32]",
    icon: "border-[#e6c779]/55 bg-[#fbf3dc] text-[#ae8a35]"
  },
  memory: {
    border: "border-[#afc3d8]/38",
    tab: "border-[#afc3d8]/55 bg-[#eef5fb] text-[#6d88a1]",
    icon: "border-[#afc3d8]/55 bg-[#eef5fb] text-[#718ba5]"
  },
  garden: {
    border: "border-[#b3c6a4]/38",
    tab: "border-[#b3c6a4]/55 bg-[#f0f6ec] text-[#728666]",
    icon: "border-[#b3c6a4]/60 bg-[#f0f6ec] text-[#728a64]"
  },
  companion: {
    border: "border-[#cfc7e8]/42",
    tab: "border-[#cfc7e8]/60 bg-[#f3f0fb] text-[#8177a4]",
    icon: "border-[#cfc7e8]/60 bg-[#f3f0fb] text-[#8177a4]"
  }
};

function formatEntryDate(timestamp: string, language: "en" | "zh") {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
    month: "short",
    day: "numeric"
  }).format(new Date(timestamp));
}

function getEntryPreview(entry: DiaryEntry, t: (key: string) => string) {
  if (entry.type === "warmth") return entry.gratitude || entry.success || t("common.warmth");
  return entry.whatHappened || t("common.emotion");
}

export default function Home() {
  const { language, t } = useI18n();
  const entries = getAllEntries();
  const latestEntry = entries[0] ?? null;
  const recentEntries = entries.slice(0, 3);

  const emotionAction = (
    <Link
      to={routes.emotionRescue}
      className="paper-card group relative flex min-h-[72px] w-full max-w-[420px] items-center gap-3 rounded-[16px] border border-[#e5c8c4]/42 bg-white px-4 py-3 text-left shadow-[0_2px_12px_rgba(90,70,64,0.04)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(90,70,64,0.06)] active:translate-y-0"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-[#e5c8c4]/50 bg-[#f8efee] text-[#ad7f7b]">
        <Sparkles className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-ui block text-sm font-extrabold leading-tight text-[#4a3b34]">{t("home.v4.emotionTitle")}</span>
        <span className="mt-1 block text-[11px] leading-[1.3] text-[#7f746e]">{t("home.v4.emotionSubtitle")}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#9b8f88] transition-transform group-hover:translate-x-0.5" />
    </Link>
  );

  const gridCards = [
    {
      to: routes.dailyWarmth,
      title: t("home.v4.warmTitle"),
      subtitle: t("home.v4.warmSubtitle"),
      label: language === "zh" ? "写写" : "Write",
      icon: NotebookPen,
      tone: "warm" as const
    },
    {
      to: routes.pastJournals,
      title: t("home.memoryTitle"),
      subtitle: t("home.memorySubtitle"),
      label: language === "zh" ? "记忆" : "Memory",
      icon: BookOpen,
      tone: "memory" as const
    },
    {
      to: routes.bunnyGarden,
      title: t("home.gardenTitle"),
      subtitle: t("home.gardenSubtitle"),
      label: language === "zh" ? "花园" : "Garden",
      icon: Sprout,
      tone: "garden" as const
    },
    {
      to: latestEntry ? routes.journalEntry(latestEntry.id) : routes.emotionRescue,
      title: t("home.todayNoteTitle"),
      subtitle: latestEntry ? t("home.todayNoteSubtitle") : t("home.todayNoteEmpty"),
      label: language === "zh" ? "今天" : "Today",
      icon: NotebookPen,
      tone: "companion" as const
    }
  ];

  return (
    <AppShell showBrand brandAction={emotionAction}>
      <div className="mx-auto w-full max-w-[420px] pb-8 pt-5 sm:pt-6">
        <section className="grid grid-cols-2 gap-3" aria-label={t("nav.home")}>
          {gridCards.map((card) => {
            const tone = toneStyles[card.tone];
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.to}
                className={cn(
                  "paper-card group relative flex min-h-[126px] flex-col items-start rounded-[16px] border bg-white px-3.5 pb-3 pt-5 text-left shadow-[0_2px_12px_rgba(90,70,64,0.04)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(90,70,64,0.06)] active:translate-y-0",
                  tone.border
                )}
              >
                <span className={cn("absolute -top-2 left-3 inline-flex h-[22px] items-center rounded-full border px-2.5 text-[9px] font-bold", tone.tab)}>
                  {card.label}
                </span>
                <span className={cn("grid h-8 w-8 place-items-center rounded-[10px] border", tone.icon)}>
                  <Icon className={cn("h-4 w-4", card.tone === "warm" && "fill-current")} />
                </span>
                <span className="font-ui mt-2 block text-[13px] font-extrabold leading-tight text-[#4a3b34]">{card.title}</span>
                <span className="mt-1 line-clamp-2 text-[10px] leading-[1.35] text-[#7f746e]">{card.subtitle}</span>
                <ChevronRight className="absolute bottom-3 right-3 h-3.5 w-3.5 text-[#a0958f] transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </section>

        <section className="mt-7" aria-labelledby="recent-entries-title">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 id="recent-entries-title" className="font-ui text-xs font-extrabold text-[#4a3b34]">
              {t("home.recentEntries")}
            </h2>
            {entries.length > 0 && (
              <Link to={routes.pastJournals} className="text-[10px] font-semibold text-[#718ba5] hover:underline">
                {t("home.viewAllEntries")}
              </Link>
            )}
          </div>

          {recentEntries.length > 0 ? (
            <div className="overflow-hidden rounded-[16px] border border-[#afc3d8]/30 bg-white shadow-[0_2px_12px_rgba(90,70,64,0.035)]">
              {recentEntries.map((entry) => (
                <Link
                  key={entry.id}
                  to={routes.journalEntry(entry.id)}
                  className="group flex min-h-[58px] items-center gap-3 border-b border-[#d8d3cc]/35 px-3.5 py-2.5 last:border-b-0 hover:bg-[#faf9f7]"
                >
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", entry.type === "emotion" ? "bg-[#e5c8c4]" : "bg-[#e6c779]")} />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#5f5149]">{getEntryPreview(entry, t)}</span>
                  <time className="shrink-0 text-[9px] text-[#9a908a]">{formatEntryDate(entry.timestamp, language)}</time>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#aaa09a] transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          ) : (
            <Link
              to={routes.emotionRescue}
              className="flex min-h-[64px] items-center justify-center rounded-[16px] border border-dashed border-[#cfc7e8]/60 bg-[#f3f0fb]/45 px-4 text-center text-[11px] leading-5 text-[#8177a4]"
            >
              {t("home.empty")}
            </Link>
          )}
        </section>

        <p className="mt-6 text-center font-hand text-[11px] font-bold leading-4 text-[#8f9f7d]">
          {t("home.takeYourTime")} {t("home.notGoingAnywhere")}
        </p>
      </div>
    </AppShell>
  );
}
