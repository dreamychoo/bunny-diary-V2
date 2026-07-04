import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useI18n } from "../i18n";
import { canClaimDailyLetter, createEntryId, getBunnyNotebookLine } from "../lib/storage";
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
  const [hasDailyLetter, setHasDailyLetter] = useState(() => canClaimDailyLetter());
  useEffect(() => { setHasDailyLetter(canClaimDailyLetter()); }, []);
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
            <p className="mt-1.5 text-[12px] font-medium leading-snug text-[var(--muted)]">{t("home.v4.subtitle")}</p>
            <Link to={routes.dailyWarmth} className="app-primary-pill mt-[14px] text-[13px] px-5 py-2.5">
              {t("home.v4.startWriting")}
            </Link>
          </div>
          <img className="hero-mug" src="/assets/v2/items/heart-mug.png" alt="" />
          <img className="hero-bunny" src="/assets/v2/rabbits/reading.png" alt="" />
        </section>

        <section className="mt-3 grid grid-cols-2 gap-2.5">
          {[
            {
              to: routes.emotionRescue,
              title: t("home.card.feelingsTitle"),
              desc: t("home.card.feelingsDesc"),
              img: "/assets/v2/rabbits/worried.png"
            },
            {
              to: routes.bunnyGarden,
              title: t("home.card.gardenTitle"),
              desc: t("home.card.gardenDesc"),
              img: "/assets/v2/plants/sprout.png"
            },
            {
              to: routes.collection,
              title: t("home.card.mailboxTitle"),
              desc: hasDailyLetter ? t("home.card.mailboxDescHasLetter") : t("home.card.mailboxDesc"),
              img: "/assets/v2/items/heart-envelope.png"
            },
            {
              to: routes.pastJournals,
              title: t("home.card.memoriesTitle"),
              desc: t("home.card.memoriesDesc"),
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

        <section className="app-bunny-says mt-3">
          <div className="bunny-says-content" onClick={() => {
              const tempId = createEntryId("warmth");
              navigate(routes.diaryLayout(tempId), { state: { notebookLine, cardStyle: "plain" } });
            }}>
            <div>
              <span className="bunny-says-badge"><img src="/assets/v2/items/pink-heart.png" alt="" className="bunny-says-icon" />{t("home.v4.bunnySays")}</span>
              <p>{notebookLine}</p>
            </div>
            <img src="/assets/v2/rabbits/sleeping.png" alt="" />
          </div>
          <div className="bunny-says-actions">
            <button onClick={() => {
              const tempId = createEntryId("warmth");
              navigate(routes.diaryLayout(tempId), { state: { notebookLine, cardStyle: "plain" } });
            }}>
              {t("home.v4.bunnyNote")}
            </button>
            <button onClick={() => {
              const tempId = createEntryId("warmth");
              navigate(routes.diaryLayout(tempId), { state: { notebookLine, cardStyle: "retro" } });
            }}>
              {t("home.v4.bunnyPhone")}
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
