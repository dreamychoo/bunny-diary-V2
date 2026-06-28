import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Mail, Sprout, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/button";
import { cn } from "../components/ui/utils";
import { useI18n } from "../i18n";
import {
  createBunnyLetter,
  GardenPlotView,
  GardenSeed,
  getGardenState,
  harvestSeed,
  plantSeedInPlot
} from "../lib/storage";
import { routes } from "../routes";

const gardenSlots = [
  { x: 16, y: 32 },
  { x: 37, y: 32 },
  { x: 60, y: 28 },
  { x: 84, y: 32 },
  { x: 22, y: 58 },
  { x: 47, y: 56 },
  { x: 72, y: 58 },
  { x: 90, y: 60 },
  { x: 5, y: 62 },
  { x: 50, y: 78 },
] as const;

const gardenPlotSizes = [
  "w-[60px] h-[68px]", "w-[50px] h-[56px]", "w-[54px] h-[62px]", "w-[50px] h-[56px]",
  "w-[72px] h-[82px]", "w-[64px] h-[72px]", "w-[68px] h-[78px]",
  "w-[52px] h-[58px]", "w-[46px] h-[52px]", "w-[42px] h-[48px]",
] as const;

const gardenPlotSizesSmall = [
  "w-[44px] h-[50px]", "w-[38px] h-[42px]", "w-[40px] h-[46px]", "w-[38px] h-[42px]",
  "w-[52px] h-[60px]", "w-[46px] h-[52px]", "w-[50px] h-[58px]",
  "w-[38px] h-[42px]", "w-[34px] h-[38px]", "w-[30px] h-[34px]",
] as const;

const PLANT_SLOT_COUNT = 7;
const EMPTY_SLOT_START = 7;

const matureAssets: Record<GardenSeed["plantVariant"], string> = {
  daisy: "/assets/v2/plants/daisy.png",
  tulip: "/assets/v2/plants/tulip.png",
  sunflower: "/assets/v2/plants/sunflower.png",
  cherry_blossom: "/assets/v2/plants/cherry-tree.png",
  rose: "/assets/v2/plants/red-rose.png",
  lavender: "/assets/v2/plants/lavender.png",
  hibiscus: "/assets/v2/plants/pink-rose.png",
  sprout: "/assets/v2/plants/clover.png",
  leaf: "/assets/v2/plants/lotus-leaves.png",
  clover: "/assets/v2/plants/clover.png",
  small_tree: "/assets/v2/plants/green-tree.png",
  pine: "/assets/v2/plants/green-tree.png",
  four_leaf: "/assets/v2/plants/clover.png",
  cactus: "/assets/v2/plants/cactus.png",
  palm: "/assets/v2/plants/green-tree.png",
  bamboo: "/assets/v2/plants/grass.png",
  mushroom: "/assets/v2/plants/mushroom.png"
};

const plantLetterMarker = "/assets/v2/items/heart-envelope.png";

function growingAsset(seed: GardenSeed) {
  if (!seed.plantedAt || !seed.maturesAt) return "/assets/v2/plants/germinating-seed.png";
  const started = new Date(seed.plantedAt).getTime();
  const ends = new Date(seed.maturesAt).getTime();
  const progress = Math.max(0, Math.min(1, (Date.now() - started) / Math.max(1, ends - started)));
  if (progress < 0.3) return seed.seedType === "warmth" ? "/assets/v2/plants/germinating-seed.png" : "/assets/v2/plants/germinating-seed.png";
  if (progress < 0.7) return seed.seedType === "warmth" ? "/assets/v2/plants/daisy.png" : "/assets/v2/plants/clover.png";
  return seed.seedType === "warmth" ? "/assets/v2/plants/pink-rose.png" : "/assets/v2/plants/lavender.png";
}

function plantAsset(seed: GardenSeed) {
  return seed.status === "planted" ? growingAsset(seed) : matureAssets[seed.plantVariant];
}

function formatDate(timestamp: string, language: string) {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", { month: "short", day: "numeric" }).format(new Date(timestamp));
}

function Sheet({ children, onClose, blockClose }: { children: React.ReactNode; onClose: () => void; blockClose?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 px-3 pt-14 backdrop-blur-[2px] sm:items-center sm:p-6" onMouseDown={blockClose ? undefined : onClose}>
      <section className="max-h-[80dvh] w-full max-w-[620px] overflow-y-auto rounded-t-[24px] border border-[rgba(255,255,255,0.7)] bg-[rgba(255,253,249,0.96)] p-5 pb-[88px] shadow-[0_-12px_45px_rgba(75,58,52,0.12)] sm:rounded-[24px] sm:p-7 sm:pb-7" onMouseDown={(event) => event.stopPropagation()}>
        {children}
      </section>
    </div>
  );
}

function Plot({ plot, index, onEmpty, onHarvest, onPlant }: { plot: GardenPlotView; index: number; onEmpty: () => void; onHarvest: (seed: GardenSeed) => void; onPlant: (seed: GardenSeed) => void }) {
  const slot = gardenSlots[index];
  const seed = plot.seed;
  const isUsed = seed?.status === "usedForLetter";

  if (!seed) {
    return (
      <button
        type="button"
        className="absolute z-5 -translate-x-1/2 -translate-y-1/2 garden-plot--empty"
        style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
        onClick={onEmpty}
        aria-label="Plant seed"
      >
        <span className="garden-empty-patch" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "absolute z-5 -translate-x-1/2 -translate-y-1/2 transition duration-160 ease-out hover:scale-105",
        seed.status === "grown" || seed.status === "ready" ? gardenPlotSizes[index] : gardenPlotSizesSmall[index],
        seed.status === "planted" && "garden-plant-sway",
        seed.status === "ready" && "garden-plant-ready"
      )}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
      onClick={() => {
        if (seed.status === "ready") onHarvest(seed);
        else if (seed.status === "grown" || seed.status === "usedForLetter") onPlant(seed);
        else onPlant(seed);
      }}
      aria-label={seed.plantVariant}
    >
      <img src={plantAsset(seed)} alt="" className="h-full w-full object-contain drop-shadow-[0_8px_10px_rgba(58,82,45,0.14)]" />
      {isUsed && (
        <span className="absolute -right-1.5 -top-1 grid h-5 w-5 place-items-center rounded-full bg-white shadow-[0_2px_8px_rgba(255,111,134,0.2)]">
          <img src={plantLetterMarker} alt="" className="h-3 w-3 object-contain" />
        </span>
      )}
    </button>
  );
}

export default function BunnyGarden() {
  const { language, t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [garden, setGarden] = useState(() => getGardenState());
  const [seedVaultOpen, setSeedVaultOpen] = useState(false);
  const [harvestTarget, setHarvestTarget] = useState<GardenSeed | null>(null);
  const [plantInfo, setPlantInfo] = useState<GardenSeed | null>(null);
  const [letterPickerOpen, setLetterPickerOpen] = useState(false);
  const [selectedSeedIds, setSelectedSeedIds] = useState<string[]>([]);
  const [writing, setWriting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const writingTimerRef = useRef<number | null>(null);
  const refreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if ((location.state as { openSeedVault?: boolean } | null)?.openSeedVault) {
      setSeedVaultOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    refreshTimerRef.current = window.setInterval(() => { setGarden(getGardenState()); }, 5000);
    return () => { if (refreshTimerRef.current !== null) window.clearInterval(refreshTimerRef.current); };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => () => { if (writingTimerRef.current !== null) window.clearTimeout(writingTimerRef.current); }, []);

  const selectedSeeds = useMemo(
    () => garden.availableLetterPlants.filter((seed) => selectedSeedIds.includes(seed.id)),
    [garden.availableLetterPlants, selectedSeedIds]
  );
  const warmSelected = selectedSeeds.filter((seed) => seed.seedType === "warmth").length;
  const previewType = warmSelected === 3 ? "warm-light" : warmSelected === 0 && selectedSeeds.length === 3 ? "slow-growth" : "after-rain";

  function refresh() { setGarden(getGardenState()); }

  function plant(seed: GardenSeed) {
    const emptyPlot = garden.plots.find((plot) => plot.state === "empty");
    if (!emptyPlot) { setToast(t("garden.v3.noSpace")); return; }
    const result = plantSeedInPlot(seed.id, emptyPlot.id);
    if (!result.ok) return;
    setSeedVaultOpen(false);
    setToast(t("garden.plantedToast"));
    refresh();
  }

  function harvest() {
    if (!harvestTarget) return;
    const harvested = harvestSeed(harvestTarget.id);
    if (!harvested) return;
    setHarvestTarget(null);
    setToast(t("garden.v3.harvested"));
    refresh();
  }

  function toggleSelected(seedId: string) {
    setSelectedSeedIds((current) => current.includes(seedId) ? current.filter((id) => id !== seedId) : current.length < 3 ? [...current, seedId] : current);
  }

  function createLetter() {
    if (selectedSeedIds.length !== 3) return;
    setWriting(true);
    writingTimerRef.current = window.setTimeout(() => {
      const letter = createBunnyLetter(selectedSeedIds);
      if (!letter) { setWriting(false); return; }
      navigate(routes.letter(letter.id));
    }, 900);
  }

  const hasPlants = garden.totalPlants > 0;
  const hasSeeds = garden.seedInventory.length > 0;
  const hasReady = garden.readyCount > 0;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[390px]">
        {/* === Compact Header === */}
        <div className="flex items-end gap-1.5 -ml-1.5 pb-1">
          <img src="/assets/v2/rabbits/watering.png" alt="" className="h-[68px] w-[68px] object-contain drop-shadow-[0_10px_14px_rgba(95,64,48,0.14)]" />
          <div className="flex flex-1 items-end justify-between pb-[7px] pr-1">
            <h1 className="text-[22px] font-black tracking-tight leading-none text-[var(--ink)]">{t("garden.title")}<span className="ml-1 text-[16px] text-[var(--pink)]">♥</span></h1>
            {/* Badges row */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-[#5a4a3f] shadow-[0_2px_8px_rgba(75,58,52,0.05)]">
                <img src="/assets/v2/plants/pink-rose.png" alt="" className="h-3.5 w-3.5 object-contain" />
                {garden.warmPlantCount}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-[#5a4a3f] shadow-[0_2px_8px_rgba(75,58,52,0.05)]">
                <img src="/assets/v2/plants/lavender.png" alt="" className="h-3.5 w-3.5 object-contain" />
                {garden.worryPlantCount}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-[#5a4a3f] shadow-[0_2px_8px_rgba(75,58,52,0.05)]">
                <img src="/assets/v2/plants/sprout.png" alt="" className="h-3.5 w-3.5 object-contain" />
                {garden.waitingSeedCount}
              </span>
            </div>
          </div>
        </div>

        {/* === Garden Stage === */}
        <div className="relative -mx-5">
          {/* Task bar — translucent overlay on garden top */}
          <div className="absolute left-1/2 z-10 flex w-[85%] max-w-[340px] -translate-x-1/2 items-center gap-2 rounded-[18px] border border-white/70 bg-white/82 px-3 py-2.5 shadow-[0_4px_16px_rgba(75,58,52,0.06)] backdrop-blur-[12px]" style={{ top: "6%" }}>
            <p className="flex-1 text-[11px] font-bold leading-snug text-[#4d3c33]">
              {hasReady
                ? (language === "zh" ? "有植物长大了 🌱 轻点收获" : "Some plants have grown 🌱 Tap to harvest")
                : hasSeeds
                  ? (language === "zh" ? "选一颗种子，点空地种下" : "Pick a seed, tap an empty patch")
                  : (language === "zh" ? "写下今天的心情，长出第一颗种子" : "Write down your day to grow a seed")}
            </p>
            {hasSeeds && (
              <button onClick={() => setSeedVaultOpen(true)} className="shrink-0 rounded-full bg-gradient-to-b from-[#92d096] to-[#78bf83] px-3 py-1.5 text-[10px] font-extrabold text-white shadow-[0_4px_10px_rgba(120,191,131,0.3)]">
                🌱 {t("garden.openSeedVault")}
              </button>
            )}
          </div>

          {/* Garden scene */}
          <div className="relative w-full overflow-visible" style={{ aspectRatio: "815/480" }}>
            <img
              src="/garden-assets/prepped/grass-board.png"
              alt=""
              className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_18px_28px_rgba(83,132,70,0.18)]"
            />

            {/* Empty garden zero-state — glowing seed CTA */}
            {!hasPlants && !hasSeeds && (
              <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
                <button
                  onClick={() => navigate(routes.dailyWarmth)}
                  className="mx-auto mb-2 grid h-16 w-16 place-items-center rounded-full bg-white/80 shadow-[0_0_30px_rgba(255,111,134,0.15)] garden-glow-pulse"
                >
                  <img src="/assets/v2/plants/sprout.png" alt="" className="h-9 w-9 object-contain" />
                </button>
                <p className="text-[12px] font-extrabold text-[#4d3c33]">
                  {language === "zh" ? "写第一篇日记" : "Write your first entry"}
                </p>
              </div>
            )}

            {/* Plots */}
            {garden.plots.slice(0, 10).map((plot, index) => (
              <Plot
                key={plot.id}
                plot={plot}
                index={index}
                onEmpty={() => garden.seedInventory.length ? setSeedVaultOpen(true) : setToast(t("garden.v3.writeForSeed"))}
                onHarvest={setHarvestTarget}
                onPlant={setPlantInfo}
              />
            ))}
          </div>
        </div>

        {/* === Floating Letter Tray === */}
        <div
          className={cn(
            "relative -mt-6 mx-2 rounded-[20px] border border-white/70 px-4 py-3.5 shadow-[0_8px_24px_rgba(75,58,52,0.08)] backdrop-blur-[12px] transition-all duration-300",
            garden.availableLetterPlants.length >= 3
              ? "bg-gradient-to-b from-[#fff0f2]/90 to-white/86 shadow-[0_8px_24px_rgba(255,111,134,0.12)]"
              : "bg-white/80"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all duration-300",
              garden.availableLetterPlants.length >= 3
                ? "bg-gradient-to-br from-[var(--pink-soft)] to-[var(--pink)] shadow-[0_4px_12px_rgba(255,111,134,0.2)]"
                : "bg-[#f5f0ec]"
            )}>
              <img
                src="/assets/v2/items/heart-envelope.png"
                alt=""
                className={cn(
                  "h-6 w-6 object-contain transition-all",
                  garden.availableLetterPlants.length >= 3 ? "brightness-0 invert" : "opacity-60"
                )}
              />
            </div>
            <div className="flex-1">
              <h3 className={cn(
                "text-[13px] font-extrabold",
                garden.availableLetterPlants.length >= 3 ? "text-[var(--pink)]" : "text-[#6b5c53]"
              )}>
                {t("garden.v3.letterTitle")}
              </h3>
              <p className="mt-0.5 text-[11px] font-semibold text-[var(--muted)]">
                {garden.availableLetterPlants.length >= 3
                  ? t("garden.v3.letterReady")
                  : t("garden.v3.letterLocked", { count: Math.max(0, 3 - garden.availableLetterPlants.length) })}
              </p>
            </div>
            {garden.availableLetterPlants.length >= 3 && (
              <button
                onClick={() => { setSelectedSeedIds([]); setLetterPickerOpen(true); }}
                className="inline-flex h-10 items-center rounded-full bg-gradient-to-b from-[var(--pink-2)] to-[var(--pink)] px-4 text-[12px] font-extrabold text-white shadow-[0_6px_16px_rgba(255,111,134,0.3),inset_0_1px_rgba(255,255,255,0.35)] shrink-0"
              >
                {t("garden.v3.writeLetter")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sheets */}
      {seedVaultOpen && <Sheet onClose={() => setSeedVaultOpen(false)}>
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="font-display text-2xl font-bold text-[var(--ink)]">{t("garden.seedVaultTitle")}</h2><p className="mt-1 text-sm text-[var(--muted)]">{t("garden.v3.vaultSubtitle")}</p></div>
          <button type="button" className="sheet-close" onClick={() => setSeedVaultOpen(false)} aria-label={t("garden.v3.later")}><X /></button>
        </div>
        <div className="mt-5 grid gap-3">
          {garden.seedInventory.length ? garden.seedInventory.map((seed) => (
            <article key={seed.id} className="seed-row">
              <img src={seed.seedType === "warmth" ? "/assets/v2/plants/warmth-seed.png" : "/assets/v2/plants/worry-seed.png"} alt="" />
              <div className="min-w-0 flex-1"><h3 className="font-semibold text-[var(--ink)]">{t(`garden.seedType.${seed.seedType}`)}</h3><p className="text-xs text-[var(--muted)]">{formatDate(seed.createdAt, language)}</p><p className="mt-1 text-sm text-[var(--muted)]">{t(seed.seedType === "warmth" ? "garden.v3.seedWarmHint" : "garden.v3.seedWorryHint")}</p></div>
              <Button type="button" variant="primary" onClick={() => plant(seed)}>{t("garden.v3.plant")}</Button>
            </article>
          )) : <p className="rounded-2xl bg-[rgba(255,255,255,0.6)] p-5 text-sm text-[var(--muted)]">{t("garden.seedVaultEmpty")}</p>}
        </div>
      </Sheet>}

      {harvestTarget && <Sheet onClose={() => setHarvestTarget(null)}>
        <div className="text-center"><img src={matureAssets[harvestTarget.plantVariant]} alt="" className="mx-auto h-40 w-32 object-contain" /><h2 className="font-display text-2xl font-bold text-[var(--ink)]">{t(`garden.variant.${harvestTarget.plantVariant}`)}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{t("garden.v3.harvestHint")}</p><div className="mt-5 flex justify-center gap-3"><Button variant="ghost" onClick={() => { navigate(routes.journalEntry(harvestTarget.entryId)); }}>{t("garden.reviewDay")}</Button><Button variant="primary" onClick={harvest}>{t("garden.v3.harvest")}</Button></div></div>
      </Sheet>}

      {plantInfo && <Sheet onClose={() => setPlantInfo(null)}>
        <div className="text-center"><img src={plantAsset(plantInfo)} alt="" className="mx-auto h-40 w-32 object-contain" /><h2 className="font-display text-2xl font-bold text-[var(--ink)]">{plantInfo.status === "planted" ? t("garden.growingNow") : t(`garden.variant.${plantInfo.plantVariant}`)}</h2><p className="mt-2 text-sm text-[var(--muted)]">{plantInfo.status === "usedForLetter" ? t("garden.v3.usedForLetter") : plantInfo.status === "planted" ? t("garden.v3.growingHint") : t("garden.v3.collectedHint")}</p><div className="mt-5 flex justify-center gap-3"><Button variant="ghost" onClick={() => { navigate(routes.journalEntry(plantInfo.entryId)); }}>{t("garden.reviewDay")}</Button><Button variant="ghost" onClick={() => setPlantInfo(null)}>{t("garden.keepWalking")}</Button></div></div>
      </Sheet>}

      {letterPickerOpen && <Sheet onClose={() => !writing && setLetterPickerOpen(false)} blockClose={!writing && selectedSeedIds.length > 0}>
        <div className="flex items-start justify-between gap-4"><div><h2 className="font-display text-2xl font-bold text-[var(--ink)]">{t("garden.v3.pickerTitle")}</h2><p className="mt-1 text-sm text-[var(--muted)]">{t("garden.v3.pickerSubtitle")}</p></div>{!writing && <button type="button" className="sheet-close" onClick={() => setLetterPickerOpen(false)} aria-label={t("garden.v3.later")}><X /></button>}</div>
        {writing ? <div className="grid min-h-64 place-items-center text-center"><div><img src="/assets/v2/rabbits/writing.png" alt="" className="mx-auto h-32 w-32 object-contain animate-pulse" /><p className="font-display text-xl font-bold">{t("garden.v3.writing")}</p></div></div> : <>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">{garden.availableLetterPlants.map((seed) => { const selected = selectedSeedIds.includes(seed.id); return <button type="button" key={seed.id} className={cn("letter-plant-row", selected && "letter-plant-row--selected")} onClick={() => toggleSelected(seed.id)}><img src={matureAssets[seed.plantVariant]} alt="" /><span className="min-w-0 flex-1 text-left"><strong className="block truncate text-[var(--ink)]">{t(`garden.variant.${seed.plantVariant}`)}</strong><small>{t(seed.seedType === "warmth" ? "garden.v3.warmPlant" : "garden.v3.worryPlant")}</small></span><span className="selection-check">{selected && <Check />}</span></button>; })}</div>
          <div className="mt-5 rounded-[20px] border border-[rgba(217,205,197,0.35)] bg-[rgba(255,253,249,0.9)] p-4"><p className="text-sm font-semibold text-[var(--ink)]">{selectedSeedIds.length === 3 ? t(`letter.preview.${previewType}.title`) : t("garden.v3.selectedCount", { count: selectedSeedIds.length })}</p><p className="mt-1 text-sm text-[var(--muted)]">{selectedSeedIds.length === 3 ? t(`letter.preview.${previewType}.body`) : t("garden.v3.pickExactly")}</p></div>
          <div className="mt-5 flex justify-end gap-3"><Button variant="ghost" onClick={() => setLetterPickerOpen(false)}>{t("garden.v3.later")}</Button><Button variant="primary" onClick={createLetter} disabled={selectedSeedIds.length !== 3}>{t("garden.v3.writeLetter")}</Button></div>
        </>}
      </Sheet>}

      {toast && <div className="garden-toast">{toast}</div>}
    </AppShell>
  );
}
