import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useI18n } from "../i18n";
import { getAllEntries, type DiaryEntry } from "../lib/storage";
import { routes } from "../routes";

function formatDate(timestamp: string, language: "en" | "zh") {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", { month: "short", day: "numeric" }).format(new Date(timestamp));
}

function getEntryPreview(entry: DiaryEntry, t: (key: string) => string) {
  if (entry.type === "warmth") return entry.gratitude || entry.success || t("common.warmth");
  return entry.whatHappened || t("common.emotion");
}

export default function Home() {
  const { language, t } = useI18n();
  const [entries, setEntries] = useState(() => getAllEntries());

  useEffect(() => { setEntries(getAllEntries()); }, []);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[390px]">
        {/* Header */}
        <div className="flex items-center justify-between px-[2px] pb-2">
          <h1 className="text-[30px] font-extrabold tracking-tight leading-none text-[var(--ink)]">
            小兔日记<span className="ml-1 text-[22px] text-[var(--pink)]">♥</span>
          </h1>
        </div>

        {/* Hero */}
        <section className="app-hero-card">
          <div className="relative z-10 pr-[130px]">
            <p className="text-[22px] font-extrabold leading-tight tracking-tight text-[var(--ink)]">{t("home.v4.prompt")} <span className="text-[13px] font-semibold text-[var(--muted)]">写一小段也可以</span></p>
            <Link to={routes.dailyWarmth} className="app-primary-pill mt-[18px]">
              开始记录
            </Link>
          </div>
          <img className="hero-mug" src="/assets/v2/items/heart-mug.png" alt="" />
          <img className="hero-bunny" src="/assets/v2/rabbits/reading.png" alt="" />
        </section>

        {/* Feature grid */}
        <section className="mt-4 grid grid-cols-2 gap-3.5">
          {[
            { to: routes.emotionRescue, title: "整理心事", desc: "慢慢说", img: "/assets/v2/items/sticky-note.png" },
            { to: routes.bunnyGarden, title: "花园", desc: "看看今天长出了什么", img: "/assets/v2/plants/sprout.png" },
            { to: routes.collection, title: "小兔信箱", desc: "兔兔来信", img: "/assets/v2/items/heart-envelope.png" },
            { to: routes.pastJournals, title: "回忆册", desc: "最近记录", img: "/assets/v2/items/photo-album.png" },
          ].map((card) => (
            <Link key={card.to} to={card.to} className="app-feature-card">
              <ChevronRight className="feature-arrow" />
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
              <img src={card.img} alt="" />
            </Link>
          ))}
        </section>

        {/* Bunny says */}
        <section className="app-bunny-says mt-4">
          <div>
            <span>小兔说</span>
            <p>情绪不是问题，<br />它只是信息。</p>
          </div>
          <span className="zzz">Zzz</span>
          <img src="/assets/v2/rabbits/sleeping.png" alt="" />
        </section>

        {/* Recent entries */}
        {entries.length > 0 && (
          <section className="mt-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-xs font-extrabold text-[var(--muted)]">{t("home.recentEntries")}</h2>
              <Link to={routes.pastJournals} className="text-xs font-bold text-[var(--pink)]">{t("home.viewAllEntries")}</Link>
            </div>
            <div className="app-list-card">
              {entries.slice(0, 3).map((entry) => (
                <Link key={entry.id} to={routes.journalEntry(entry.id)} className="app-list-row">
                  <span className={entry.type === "emotion" ? "app-dot app-dot--pink" : "app-dot app-dot--sun"} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--ink)]">{getEntryPreview(entry, t)}</span>
                  <time className="text-xs text-[var(--muted)]">{formatDate(entry.timestamp, language)}</time>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
