import { useMemo, useState } from "react";
import { ChevronRight, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useI18n } from "../i18n";
import { getBunnyNotebookLine } from "../lib/storage";
import { routes } from "../routes";

export default function Home() {
  const { language, t } = useI18n();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greetingKey =
    hour >= 5 && hour < 12 ? "home.greeting.morning" :
    hour >= 12 && hour < 18 ? "home.greeting.afternoon" :
    hour >= 18 && hour < 23 ? "home.greeting.evening" :
    "home.greeting.night";

  const [notebookIndex, setNotebookIndex] = useState(() => Math.floor(Math.random() * 1000));
  const notebookLine = getBunnyNotebookLine(notebookIndex);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[390px] pt-8">
        <div className="flex items-center gap-2 px-[2px] pb-1">
          <span className="text-base font-bold tracking-tight text-[var(--ink)]/80">{t(greetingKey)}</span>
          <span className="text-pink"><img src="/assets/v2/items/pink-heart.png" alt="" className="h-4 w-4 object-contain" /></span>
        </div>

        <section className="app-hero-card">
          <div className="relative z-10 pr-[130px] pt-3">
            <h2 className="text-[20px] font-extrabold leading-tight tracking-tight text-[var(--ink)]">{t("home.v4.prompt")}</h2>
            <Link to={routes.dailyWarmth} className="app-primary-pill mt-[14px] text-[13px] px-5 py-2.5">
              {language === "zh" ? "开始记录" : "Start Writing"}
            </Link>
          </div>
          <img className="hero-mug" src="/assets/v2/items/heart-mug.png" alt="" />
          <img className="hero-bunny" src="/assets/v2/rabbits/reading.png" alt="" />
        </section>

        <section className="mt-3 grid grid-cols-2 gap-2.5">
          {[
            {
              to: routes.emotionRescue,
              title: language === "zh" ? "整理心事" : "Feelings",
              desc: language === "zh" ? "慢慢说" : "Talk to Bunny",
              img: "/assets/v2/items/sticky-note.png"
            },
            {
              to: routes.bunnyGarden,
              title: language === "zh" ? "花园" : "Garden",
              desc: language === "zh" ? "来花园看看" : "Visit the garden",
              img: "/assets/v2/plants/sprout.png"
            },
            {
              to: routes.collection,
              title: language === "zh" ? "小兔信箱" : "Mailbox",
              desc: language === "zh" ? "兔兔来信" : "Bunny's letters",
              img: "/assets/v2/items/heart-envelope.png"
            },
            {
              to: routes.pastJournals,
              title: language === "zh" ? "回忆册" : "Memories",
              desc: language === "zh" ? "最近记录" : "Recent entries",
              img: "/assets/v2/items/photo-album.png"
            }
          ].map((card) => (
            <Link key={card.to} to={card.to} className="app-feature-card">
              <ChevronRight className="feature-arrow" />
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
              <img src={card.img} alt="" />
            </Link>
          ))}
        </section>

        <section className="app-bunny-says cursor-pointer mt-3" onClick={() => navigate(routes.emotionRescue, { state: { prefill: notebookLine } })}>
          <div>
            <span>{language === "zh" ? "小兔说" : "Bunny Says"}</span>
            <p>{notebookLine}</p>
          </div>
          <span className="zzz">Zzz</span>
          <img src="/assets/v2/rabbits/sleeping.png" alt="" />
        </section>
      </div>
    </AppShell>
  );
}
