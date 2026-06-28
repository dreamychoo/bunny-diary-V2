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
        <div className="px-[2px] pb-2">
          <h1 className="text-[26px] font-extrabold tracking-tight leading-none text-[var(--ink)]">
            {language === "zh" ? "小兔日记" : "Bunny Diary"}<span className="ml-1 text-[18px] text-[var(--pink)]">♥</span>
          </h1>
        </div>

        {/* Hero */}
        <section className="app-hero-card">
          <div className="relative z-10 pr-[130px] pt-4">
            <h2 className="text-[22px] font-extrabold leading-tight tracking-tight text-[var(--ink)]">{t("home.v4.prompt")}</h2>
            <Link to={routes.dailyWarmth} className="app-primary-pill mt-[18px]">{language === "zh" ? "开始记录" : "Start Writing"}</Link>
          </div>
          <img className="hero-mug" src="/assets/v2/items/heart-mug.png" alt="" />
          <img className="hero-bunny" src="/assets/v2/rabbits/reading.png" alt="" />
        </section>

        {/* Feature grid */}
        <section className="mt-4 grid grid-cols-2 gap-3.5">
          {[
            { to: routes.emotionRescue, title: language === "zh" ? "整理心事" : "Feelings", desc: language === "zh" ? "慢慢说" : "Talk to Bunny", img: "/assets/v2/items/sticky-note.png" },
            { to: routes.bunnyGarden, title: language === "zh" ? "花园" : "Garden", desc: language === "zh" ? "来花园看看" : "Visit the garden", img: "/assets/v2/plants/sprout.png" },
            { to: routes.collection, title: language === "zh" ? "小兔信箱" : "Mailbox", desc: language === "zh" ? "兔兔来信" : "Bunny's letters", img: "/assets/v2/items/heart-envelope.png" },
            { to: routes.pastJournals, title: language === "zh" ? "回忆册" : "Memories", desc: language === "zh" ? "最近记录" : "Recent entries", img: "/assets/v2/items/photo-album.png" },
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
            <span>{language === "zh" ? "小兔说" : "Bunny Says"}</span>
            <p>{language === "zh" ? "情绪不是问题，它只是信息。" : "A feeling is not a problem. It is simply information."}</p>
          </div>
          <span className="zzz">Zzz</span>
          <img src="/assets/v2/rabbits/sleeping.png" alt="" />
        </section>

      </div>
    </AppShell>
  );
}
