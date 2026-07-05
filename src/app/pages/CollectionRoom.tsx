import { Bookmark, ChevronRight, Mail, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useI18n } from "../i18n";
import { appendWarmthEntry, canClaimDailyLetter, claimDailyLetter, createEntryId, gardenPlantAssets, getDailyLetterProgress, getTodayLetter, GardenPlantVariant, GardenSeed, getGardenState, isDailyLetterSaved, markDailyLetterSaved } from "../lib/storage";
import { routes } from "../routes";

function groupPlants(seeds: GardenSeed[]) {
  const groups = new Map<GardenPlantVariant, GardenSeed[]>();
  seeds.forEach((seed) => groups.set(seed.plantVariant, [...(groups.get(seed.plantVariant) ?? []), seed]));
  return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
}

function formatDate(timestamp: string, language: string) {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(timestamp));
}

export default function CollectionRoom() {
  const { language, t } = useI18n();
  const location = useLocation();
  const [garden, setGarden] = useState(() => getGardenState());
  const groups = groupPlants(garden.collectedSeeds);
  const [todayLetter, setTodayLetter] = useState(() => getTodayLetter());
  const [canClaim, setCanClaim] = useState(() => canClaimDailyLetter());
  const [progress, setProgress] = useState(() => getDailyLetterProgress());
  const [showLetter, setShowLetter] = useState(() => !!todayLetter);
  const [justClaimed, setJustClaimed] = useState(false);
  const [letterSaved, setLetterSaved] = useState(() => todayLetter ? isDailyLetterSaved(todayLetter.index) : false);

  useEffect(() => {
    setGarden(getGardenState());
    const tl = getTodayLetter();
    setTodayLetter(tl);
    setCanClaim(canClaimDailyLetter());
    setProgress(getDailyLetterProgress());
    if (tl) setShowLetter(true);
  }, [location]);

  const handleClaim = () => {
    const letter = claimDailyLetter();
    if (letter) {
      setTodayLetter({ letter, index: progress.claimed });
      setCanClaim(false);
      setShowLetter(true);
      setJustClaimed(true);
      setProgress(getDailyLetterProgress());
    }
  };

  const allDone = progress.claimed >= progress.total;

  const handleSaveLetter = () => {
    if (!todayLetter || letterSaved) return;
    const body = todayLetter.letter[language === "zh" ? "bodyZh" : "bodyEn"];
    const title = todayLetter.letter[language === "zh" ? "titleZh" : "titleEn"];
    appendWarmthEntry({
      id: createEntryId("warmth"),
      type: "warmth",
      timestamp: new Date().toISOString(),
      mood: "gentle",
      weather: "sunny",
      gratitude: `📬 ${title}\n\n${body}`,
      success: "",
    });
    markDailyLetterSaved(todayLetter.index);
    setLetterSaved(true);
  };

  return (
    <AppShell title={t("collection.title")} subtitle={t("collection.subtitle")} headerMascotVariant="reading" wide>
      <div className="collection-layout">
        {/* Mailbox — primary, left column */}
        <section className="collection-panel">
          <header className="collection-section-heading"><img src="/assets/v2/items/mailbox.png" alt="" className="h-6 w-6 object-contain" /><h2>{t("collection.mailbox")}</h2></header>

          {/* Daily letter section */}
          <div className="collection-daily-letter" onClick={() => { if (!showLetter && !canClaim) setShowLetter(true); }}>
            <div className="daily-icon"><Sparkles /></div>
            <div>
              <h3>{t("collection.dailyLetter")}</h3>
              <p>{allDone ? t("collection.claimLetterAllDone") : canClaim ? t("collection.dailyLetterDesc") : t("collection.claimLetterDone")}</p>
            </div>
            {canClaim ? (
              <button className="daily-claim-btn" onClick={(e) => { e.stopPropagation(); handleClaim(); }}>
                {t("collection.claimLetter")}
              </button>
            ) : allDone ? (
              <span className="text-[.68rem] font-bold text-[#aaa] whitespace-nowrap">✓</span>
            ) : (
              <span className="text-[.68rem] font-bold text-[#c97a4a] whitespace-nowrap">✓</span>
            )}
          </div>

          {/* Show today's letter content when claimed */}
          {showLetter && todayLetter && (
            <div className="collection-daily-letter-body">
              <h4 className="font-bold text-[.82rem] text-[#c97a4a]">{todayLetter.letter[language === "zh" ? "titleZh" : "titleEn"]}</h4>
              <div className="letter-rule" />
              <p>{todayLetter.letter[language === "zh" ? "bodyZh" : "bodyEn"]}</p>
              <button className="daily-save-btn" onClick={handleSaveLetter} disabled={letterSaved}>
                <Bookmark size={11} />
                {t(letterSaved ? "collection.savedLetter" : "collection.saveLetter")}
              </button>
            </div>
          )}

          {/* All letters */}
          {garden.letters.length ? (
            <div className="collection-mail-cards">
              {garden.letters.map((letter) => (
                <Link key={letter.id} to={routes.letter(letter.id)} className="collection-mail-card group">
                  <span className="mail-icon"><Mail /></span>
                  <div className="min-w-0 flex-1">
                    <h3>{t(`letter.subject.${letter.letterType}.${letter.subjectIndex}`)}</h3>
                    <time>{formatDate(letter.createdAt, language)} · {t(`letter.type.${letter.letterType}`)}</time>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#aaa09a] transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="collection-empty">
              <div className="text-3xl opacity-40">✉️</div>
              <p>{t("collection.emptyLetters")}</p>
            </div>
          )}
          {garden.letters.length === 0 && garden.availableLetterPlants.length >= 3 && (
            <div className="collection-garden-link"><span>{t("collection.gardenHint")}</span><Link to={routes.bunnyGarden}>{t("collection.goGarden")} <ChevronRight /></Link></div>
          )}
        </section>

        {/* Plant collection — secondary, right column */}
        <section className="collection-panel">
          <header className="collection-section-heading"><img src="/assets/v2/items/white-flower.png" alt="" className="h-6 w-6 object-contain" /><h2>{t("collection.plants")}</h2></header>
          {groups.length ? (
            <div className="collection-plant-grid">
              {groups.map(([variant, seeds]) => {
                const seedType = seeds[0].seedType;
                const targetEntryId = seeds[0].entryId;
                return (
                  <Link key={variant} to={routes.diaryLayout(targetEntryId)}>
                    <img src={gardenPlantAssets[variant]} alt="" />
                    <h3>{t(`garden.variant.${variant}`)}</h3>
                    {seeds.length > 1 && <span className="plant-count">× {seeds.length}</span>}
                    <span className="plant-kind">{t(seedType === "warmth" ? "garden.v3.warmPlant" : "garden.v3.worryPlant")}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="collection-empty">
              <div className="text-3xl opacity-40">🌱</div>
              <p>{t("collection.emptyPlants")}</p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
