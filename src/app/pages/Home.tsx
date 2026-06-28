import { BookOpen, ChevronRight, NotebookPen, Sparkles, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Mascot } from "../components/Mascot";
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

function formatDate(timestamp: string, language: "en" | "zh") {
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

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[420px] pt-6">
        {/* 品牌区：缩小兔兔 + 一行小标题 */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            className="relative grid h-14 w-14 shrink-0 place-items-center outline-none"
            aria-label={t("app.title")}
          >
            <Mascot variant="reading" className="h-14 w-14 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.035)]" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-bold leading-tight text-[#4a3b34]">{t("app.title")}</p>
            <p className="mt-0.5 text-xs font-medium text-[#8d817a]">{t("home.v4.prompt")}</p>
          </div>
        </div>
        {/* 四格导航 */}
        <section className="grid grid-cols-2 gap-2.5">
          {([
            { to: routes.dailyWarmth, title: t("home.v4.warmTitle"), subtitle: t("home.v4.warmSubtitle"), label: "写写", icon: NotebookPen, tone: "warm" as Tone },
            { to: routes.emotionRescue, title: t("home.v4.emotionTitle"), subtitle: t("home.v4.emotionSubtitle"), label: "心事", icon: Sparkles, tone: "emotion" as Tone },
            { to: routes.bunnyGarden, title: t("home.gardenTitle"), subtitle: t("home.gardenSubtitle"), label: "花园", icon: Sprout, tone: "garden" as Tone },
            { to: routes.pastJournals, title: t("home.memoryTitle"), subtitle: t("home.memorySubtitle"), label: "记忆", icon: BookOpen, tone: "memory" as Tone }
          ] as const).map((card) => {
            const Icon = card.icon;
            const tone = toneStyles[card.tone];
            return (
              <Link
                key={card.title}
                to={card.to}
                className={cn("paper-card group relative flex min-h-[105px] flex-col items-start rounded-[14px] border bg-white px-3 pb-2.5 pt-4 text-left shadow-[0_2px_12px_rgba(90,70,64,0.04)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(90,70,64,0.06)] active:translate-y-0", tone.border)}
              >
                <span className={cn("absolute -top-2 left-3 inline-flex h-[20px] items-center rounded-full border px-2 text-[9px] font-bold", tone.tab)}>{card.label}</span>
                <span className={cn("grid h-7 w-7 place-items-center rounded-[9px] border", tone.icon)}><Icon className="h-3.5 w-3.5" /></span>
                <span className="mt-1.5 block text-[12px] font-extrabold leading-tight text-[#4a3b34]">{card.title}</span>
                <span className="mt-0.5 line-clamp-2 text-[10px] leading-[1.3] text-[#7f746e]">{card.subtitle}</span>
                <ChevronRight className="absolute bottom-2 right-2.5 h-3 w-3 text-[#a0958f]" />
              </Link>
            );
          })}
        </section>

        {/* 最近写下的 */}
        <section className="mt-5" aria-labelledby="recent-entries-title">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <h2 id="recent-entries-title" className="text-[11px] font-extrabold text-[#4a3b34]">
              {t("home.recentEntries")}
            </h2>
            {entries.length > 0 && (
              <Link to={routes.pastJournals} className="text-[10px] font-semibold text-[#718ba5] hover:underline">
                {t("home.viewAllEntries")}
              </Link>
            )}
          </div>

          {entries.length > 0 ? (
            <div className="overflow-hidden rounded-[14px] border border-[#afc3d8]/30 bg-white shadow-[0_2px_12px_rgba(90,70,64,0.035)]">
              {entries.slice(0, 3).map((entry) => (
                <Link
                  key={entry.id}
                  to={routes.journalEntry(entry.id)}
                  className="group flex min-h-[50px] items-center gap-2.5 border-b border-[#d8d3cc]/35 px-3 py-2 last:border-b-0 hover:bg-[#faf9f7]"
                >
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", entry.type === "emotion" ? "bg-[#e5c8c4]" : "bg-[#e6c779]")} />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#5f5149]">{getEntryPreview(entry, t)}</span>
                  <time className="shrink-0 text-[9px] text-[#9a908a]">{formatDate(entry.timestamp, language)}</time>
                  <ChevronRight className="h-3 w-3 shrink-0 text-[#aaa09a]" />
                </Link>
              ))}
            </div>
          ) : (
            <Link
              to={routes.emotionRescue}
              className="flex min-h-[56px] items-center justify-center rounded-[14px] border border-dashed border-[#cfc7e8]/60 bg-[#f3f0fb]/45 px-4 text-center text-[11px] leading-5 text-[#8177a4]"
            >
              {t("home.empty")}
            </Link>
          )}
        </section>

        <p className="mt-4 text-center font-hand text-[11px] font-bold leading-4 text-[#8f9f7d]">
          {t("home.takeYourTime")} {t("home.notGoingAnywhere")}
        </p>
      </div>
    </AppShell>
  );
}
