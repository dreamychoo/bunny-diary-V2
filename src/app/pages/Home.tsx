import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useI18n } from "../i18n";
import { getBunnyNotebookLine } from "../lib/storage";
import { routes } from "../routes";

export default function Home() {
  const { language, t } = useI18n();

  const hour = new Date().getHours();
  const greetingKey =
    hour >= 5 && hour < 12 ? "home.greeting.morning" :
    hour >= 12 && hour < 18 ? "home.greeting.afternoon" :
    hour >= 18 && hour < 23 ? "home.greeting.evening" :
    "home.greeting.night";

  const notebookLine = useMemo(() => getBunnyNotebookLine(), []);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[390px]">
        <div className="flex items-center gap-2 px-[2px] pb-2 pt-6">
          <span className="text-lg font-bold tracking-tight text-[var(--ink)]/80">{t(greetingKey)}</span>
          <span className="text-pink"><img src="/assets/v2/items/pink-heart.png" alt="" className="h-5 w-5 object-contain" /></span>
        </div>

        <section className="app-hero-card">
          <div className="relative z-10 pr-[130px] pt-4">
            <h2 className="text-[22px] font-extrabold leading-tight tracking-tight text-[var(--ink)]">{t("home.v4.prompt")}</h2>
            <Link to={routes.dailyWarmth} className="app-primary-pill mt-[18px]">
              {language === "zh" ? "开始记录" : "Start Writing"}
            </Link>
          </div>
          <img className="hero-mug" src="/assets/v2/items/heart-mug.png" alt="" />
          <img className="hero-bunny" src="/assets/v2/rabbits/reading.png" alt="" />
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3.5">
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

        <section className="app-bunny-says mt-8">
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
