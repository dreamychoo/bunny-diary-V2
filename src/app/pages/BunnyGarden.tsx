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

// ponytail: 7 planting plots + 3 empty soil plots, indexed 0-6 = plant, 7-9 = empty
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
  bamboo: "/assets/v2/plants/wheat.png",
  mushroom: "/assets/v2/plants/mushroom.png"
};

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
      <section className="max-h-[80dvh] w-full max-w-[620px] overflow-y-auto rounded-t-[28px] border border-[rgba(255,255,255,0.7)] bg-[rgba(255,253,249,0.96)] p-5 pb-[88px] shadow-[0_-12px_45px_rgba(75,58,52,0.12)] sm:rounded-[28px] sm:p-7 sm:pb-7" onMouseDown={(event) => event.stopPropagation()}>
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
    // Empty plot — show clickable patch
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
        seed?.status === "planted" && "animate-pulse"
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
      {(seed.status === "ready" || isUsed) && (
        <span className={cn(
          "absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border shadow",
          isUsed ? "border-[var(--pink)] bg-white text-[var(--pink)]" : "border-[var(--green)] bg-white text-[var(--green)]"
        )}>
          <Sprout className="h-3.5 w-3.5" />
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

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[390px]">
        {/* Top: watering bunny + title */}
        <section className="relative min-h-[128px] pt-1">
          <img src="/assets/v2/rabbits/watering.png" alt="" className="absolute -left-2 -top-2 z-2 h-[100px] w-[100px] object-contain drop-shadow-[0_14px_18px_rgba(95,64,48,0.16)]" />
          <div className="pl-[80px] pt-6">
            <h1 className="text-[29px] font-black tracking-tight leading-none text-[var(--ink)]">{t("garden.title")}<span className="ml-1 text-[20px] text-[var(--pink)]">♥</span></h1>
            <p className="mt-2 text-[12px] font-semibold leading-snug text-[var(--muted)] max-w-[210px]">{t("garden.shortSubtitle")}</p>
          </div>
        </section>

        {/* Prompt bar */}
        <section className="flex items-center gap-3 rounded-[22px] border border-[rgba(255,255,255,0.8)] bg-[rgba(255,254,250,0.86)] px-3 py-3 shadow-[0_10px_30px_rgba(126,91,72,0.10)] backdrop-blur-[18px]">
          <img src="/assets/v2/plants/sprout.png" alt="" className="h-11 w-11 flex-shrink-0 object-contain drop-shadow-[0_6px_9px_rgba(95,64,48,0.12)]" />
          <p className="flex-1 text-[13px] font-extrabold leading-snug text-[#4d3c33]">
            {garden.waitingSeedCount > 0 ? t("garden.promptBar.plantReady") : t("garden.promptBar.writeForSeed")}
          </p>
          <button onClick={() => setSeedVaultOpen(true)} className="inline-flex h-11 items-center rounded-[999px] border-0 bg-gradient-to-b from-[#92d096] to-[#78bf83] px-3.5 text-[12px] font-extrabold text-white shadow-[0_8px_18px_rgba(120,191,131,0.28),inset_0_1px_rgba(255,255,255,0.35)]">
            🌱 {t("garden.openSeedVault")}
          </button>
        </section>

        {/* Stats */}
        <section className="mt-3 grid grid-cols-3 overflow-hidden rounded-[22px] border border-[rgba(255,255,255,0.8)] bg-[rgba(255,254,250,0.86)] shadow-[0_10px_30px_rgba(126,91,72,0.10)]">
          {[
            { img: "/assets/v2/plants/pink-rose.png", label: t("garden.v3.warmPlants"), count: garden.warmPlantCount },
            { img: "/assets/v2/plants/lavender.png", label: t("garden.v3.worryPlants"), count: garden.worryPlantCount },
            { img: "/assets/v2/plants/sprout.png", label: t("garden.v3.waitingSeeds"), count: garden.waitingSeedCount },
          ].map((stat, i) => (
            <div key={i} className={`flex items-center justify-center gap-2 px-2 py-4 ${i > 0 ? "border-l border-[#f0e6dc]" : ""}`}>
              <img src={stat.img} alt="" className="h-7 w-7 object-contain" />
              <span className="text-[11px] font-bold text-[var(--muted)]">{stat.label}</span>
              <b className="text-xl font-black leading-none text-[#342923]">{stat.count}</b>
            </div>
          ))}
        </section>

        {/* Garden */}
        <section className="relative h-[250px] overflow-visible -mt-3 -mx-5">
          <img src="/garden-assets/prepped/grass-board.png" alt="" className="absolute left-1/2 top-[58%] w-[440px] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_18px_28px_rgba(83,132,70,0.18)]" />
          {garden.plots.slice(0, 10).map((plot, index) => (
            <Plot key={plot.id} plot={plot} index={index} onEmpty={() => garden.seedInventory.length ? setSeedVaultOpen(true) : setToast(t("garden.v3.writeForSeed"))} onHarvest={setHarvestTarget} onPlant={setPlantInfo} />
          ))}
        </section>

        {/* Letter card */}
        <section className="mt-9 flex items-center gap-3 rounded-[22px] border border-[rgba(255,255,255,0.8)] bg-[rgba(255,254,250,0.88)] px-3 py-4 shadow-[0_10px_30px_rgba(126,91,72,0.10)]">
          <img src="/assets/v2/items/heart-envelope.png" alt="" className="h-12 w-12 flex-shrink-0 object-contain" />
          <div className="flex-1">
            <h3 className="text-[16px] font-extrabold">{t("garden.v3.letterTitle")}</h3>
            <p className="mt-1 text-[11px] font-semibold leading-snug text-[var(--muted)]">
              {garden.availableLetterPlants.length >= 3 ? t("garden.v3.letterReady") : t("garden.v3.letterLocked", { count: Math.max(0, 3 - garden.availableLetterPlants.length) })}
            </p>
          </div>
          {garden.availableLetterPlants.length >= 3 && (
            <button onClick={() => { setSelectedSeedIds([]); setLetterPickerOpen(true); }} className="text-2xl font-black text-[#8b786d]">›</button>
          )}
        </section>
      </div>

      {/* Sheets (seed vault, harvest, plant info, letter picker) remain same structure */}
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
