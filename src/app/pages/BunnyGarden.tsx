import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Flower2, Leaf, Mail, Sprout, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { GardenNav } from "../components/GardenNav";
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
  { x: 18, y: 24 },
  { x: 38, y: 20 },
  { x: 65, y: 22 },
  { x: 82, y: 28 },
  { x: 24, y: 44 },
  { x: 50, y: 40 },
  { x: 72, y: 48 },
  { x: 35, y: 66 },
  { x: 58, y: 68 },
  { x: 78, y: 62 }
] as const;

const matureAssets: Record<GardenSeed["plantVariant"], string> = {
  daisy: "/garden-assets/prepped/warmth-flower-daisy.png",
  tulip: "/garden-assets/prepped/warmth-flower-blossom.png",
  sunflower: "/garden-assets/prepped/warmth-flower-sunflower.png",
  cherry_blossom: "/garden-assets/prepped/warmth-flower-blossom.png",
  rose: "/garden-assets/prepped/warmth-flower-blossom.png",
  lavender: "/garden-assets/prepped/warmth-flower-bell.png",
  hibiscus: "/garden-assets/prepped/warmth-flower-daisy.png",
  sprout: "/garden-assets/prepped/feeling-sapling.png",
  leaf: "/garden-assets/prepped/feeling-tree-branch.png",
  clover: "/garden-assets/prepped/feeling-bush.png",
  small_tree: "/garden-assets/prepped/feeling-tree-round.png",
  pine: "/garden-assets/prepped/feeling-tree-round.png",
  four_leaf: "/garden-assets/prepped/feeling-bush.png",
  cactus: "/garden-assets/prepped/feeling-bush.png",
  palm: "/garden-assets/prepped/feeling-tree-branch.png",
  bamboo: "/garden-assets/prepped/feeling-tree-branch.png",
  mushroom: "/garden-assets/prepped/feeling-tree-droop.png"
};

function growingAsset(seed: GardenSeed) {
  if (!seed.plantedAt || !seed.maturesAt) {
    return seed.seedType === "warmth" ? "/garden-assets/prepped/warmth-planted.png" : "/garden-assets/prepped/feeling-planted.png";
  }
  const started = new Date(seed.plantedAt).getTime();
  const ends = new Date(seed.maturesAt).getTime();
  const progress = Math.max(0, Math.min(1, (Date.now() - started) / Math.max(1, ends - started)));
  if (progress < 0.34) return seed.seedType === "warmth" ? "/garden-assets/prepped/warmth-planted.png" : "/garden-assets/prepped/feeling-planted.png";
  if (progress < 0.72) return seed.seedType === "warmth" ? "/garden-assets/prepped/warmth-sprout.png" : "/garden-assets/prepped/feeling-sprout.png";
  return seed.seedType === "warmth" ? "/garden-assets/prepped/warmth-bud.png" : "/garden-assets/prepped/feeling-sapling.png";
}

function plantAsset(seed: GardenSeed) {
  return seed.status === "planted" ? growingAsset(seed) : matureAssets[seed.plantVariant];
}

function formatDate(timestamp: string, language: string) {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", { month: "short", day: "numeric" }).format(new Date(timestamp));
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#4b3a34]/20 px-3 pt-14 backdrop-blur-[2px] sm:items-center sm:p-6" onMouseDown={onClose}>
      <section className="max-h-[88dvh] w-full max-w-[620px] overflow-y-auto rounded-t-[28px] border border-[#e8ded2] bg-[#fffdf9] p-5 shadow-[0_-12px_45px_rgba(75,58,52,0.12)] sm:rounded-[28px] sm:p-7" onMouseDown={(event) => event.stopPropagation()}>
        {children}
      </section>
    </div>
  );
}

function Plot({ plot, index, onEmpty, onHarvest, onPlant }: { plot: GardenPlotView; index: number; onEmpty: () => void; onHarvest: (seed: GardenSeed) => void; onPlant: (seed: GardenSeed) => void }) {
  const slot = gardenSlots[index];
  const seed = plot.seed;
  const isUsed = seed?.status === "usedForLetter";
  return (
    <button
      type="button"
      className={cn("garden-plot", plot.state === "empty" && "garden-plot--empty", seed?.status === "planted" && "garden-plot--growing")}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
      onClick={() => !seed ? onEmpty() : seed.status === "ready" ? onHarvest(seed) : onPlant(seed)}
      aria-label={seed ? seed.plantVariant : `plot-${plot.id}`}
    >
      {!seed ? <span className="garden-empty-patch" /> : (
        <span className="relative grid h-full w-full place-items-center">
          <img src={plantAsset(seed)} alt="" className="max-h-full max-w-full object-contain drop-shadow-[0_5px_7px_rgba(75,58,52,0.08)]" />
          {seed.status === "ready" && <span className="garden-harvest-dot"><Sprout className="h-3.5 w-3.5" /></span>}
          {isUsed && <span className="garden-letter-mark"><Mail className="h-3 w-3" /></span>}
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

  useEffect(() => {
    if ((location.state as { openSeedVault?: boolean } | null)?.openSeedVault) {
      setSeedVaultOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => () => {
    if (writingTimerRef.current !== null) window.clearTimeout(writingTimerRef.current);
  }, []);

  const statusLine = garden.readyCount > 0
    ? t("garden.v3.status.ready")
    : garden.waitingSeedCount > 0
      ? t("garden.v3.status.waiting")
      : t("garden.v3.status.growing");

  const selectedSeeds = useMemo(
    () => garden.availableLetterPlants.filter((seed) => selectedSeedIds.includes(seed.id)),
    [garden.availableLetterPlants, selectedSeedIds]
  );
  const warmSelected = selectedSeeds.filter((seed) => seed.seedType === "warmth").length;
  const previewType = warmSelected === 3 ? "warm-light" : warmSelected === 0 && selectedSeeds.length === 3 ? "slow-growth" : "after-rain";

  function refresh() {
    setGarden(getGardenState());
  }

  function plant(seed: GardenSeed) {
    const emptyPlot = garden.plots.find((plot) => plot.state === "empty");
    if (!emptyPlot) {
      setToast(t("garden.v3.noSpace"));
      return;
    }
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
      if (!letter) {
        setWriting(false);
        return;
      }
      navigate(routes.letter(letter.id));
    }, 900);
  }

  return (
    <AppShell title={t("garden.title")} subtitle={t("garden.subtitle")} headerMascotVariant="garden" wide>
      <section className="garden-status-band">
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-semibold leading-8 text-[#4b3a34] sm:text-[26px]">{statusLine}</p>
          <p className="mt-1 text-sm leading-6 text-[#8d817a] sm:text-base">{t("garden.v3.status.support")}</p>
        </div>
        <Button type="button" variant="garden" onClick={() => setSeedVaultOpen(true)} disabled={!garden.seedInventory.length}>{t("garden.openSeedVault")}</Button>
      </section>

      <div className="garden-counts" aria-label={t("garden.v3.summary")}> 
        <div><Flower2 className="text-[#d6a85f]" /><span>{t("garden.v3.warmPlants")}</span><strong>{garden.warmPlantCount}</strong></div>
        <div><Leaf className="text-[#78936f]" /><span>{t("garden.v3.worryPlants")}</span><strong>{garden.worryPlantCount}</strong></div>
        <div><Sprout className="text-[#78936f]" /><span>{t("garden.v3.waitingSeeds")}</span><strong>{garden.waitingSeedCount}</strong></div>
      </div>

      <section className="garden-scene" aria-label={t("garden.v3.scene")}>
        <img src="/garden-assets/prepped/garden-ground.png" alt="" className="absolute inset-0 h-full w-full object-fill" />
        {garden.plots.map((plot, index) => (
          <Plot key={plot.id} plot={plot} index={index} onEmpty={() => garden.seedInventory.length ? setSeedVaultOpen(true) : setToast(t("garden.v3.writeForSeed"))} onHarvest={setHarvestTarget} onPlant={setPlantInfo} />
        ))}
      </section>

      <section className="garden-letter-card">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fbf3dc] text-[#b48845]"><Mail className="h-5 w-5" /></span>
          <div>
            <h2 className="font-display text-xl font-bold">{t("garden.v3.letterTitle")}</h2>
            <p className="mt-1 text-sm leading-6 text-[#7f746e]">
              {garden.availableLetterPlants.length >= 3 ? t("garden.v3.letterReady") : t("garden.v3.letterLocked", { count: Math.max(0, 3 - garden.availableLetterPlants.length) })}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#78936f]">{t("garden.v3.available", { count: garden.availableLetterPlants.length })}</p>
          </div>
        </div>
        {garden.availableLetterPlants.length >= 3 && <Button type="button" variant="garden" onClick={() => { setSelectedSeedIds([]); setLetterPickerOpen(true); }}>{t("garden.v3.chooseThree")}</Button>}
      </section>

      <GardenNav />

      {seedVaultOpen && <Sheet onClose={() => setSeedVaultOpen(false)}>
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="font-display text-2xl font-bold">{t("garden.seedVaultTitle")}</h2><p className="mt-1 text-sm text-[#8d817a]">{t("garden.v3.vaultSubtitle")}</p></div>
          <button type="button" className="sheet-close" onClick={() => setSeedVaultOpen(false)} aria-label={t("garden.v3.later")}><X /></button>
        </div>
        <div className="mt-5 grid gap-3">
          {garden.seedInventory.length ? garden.seedInventory.map((seed) => (
            <article key={seed.id} className="seed-row">
              <img src={seed.seedType === "warmth" ? "/garden-assets/prepped/warmth-seed.png" : "/garden-assets/prepped/feeling-seed.png"} alt="" />
              <div className="min-w-0 flex-1"><h3 className="font-semibold">{t(`garden.seedType.${seed.seedType}`)}</h3><p className="text-xs text-[#8d817a]">{formatDate(seed.createdAt, language)}</p><p className="mt-1 text-sm text-[#7f746e]">{t(seed.seedType === "warmth" ? "garden.v3.seedWarmHint" : "garden.v3.seedWorryHint")}</p></div>
              <Button type="button" variant="garden" onClick={() => plant(seed)}>{t("garden.v3.plant")}</Button>
            </article>
          )) : <p className="rounded-2xl bg-[#f8f4ee] p-5 text-sm text-[#7f746e]">{t("garden.seedVaultEmpty")}</p>}
        </div>
      </Sheet>}

      {harvestTarget && <Sheet onClose={() => setHarvestTarget(null)}>
        <div className="text-center"><img src={matureAssets[harvestTarget.plantVariant]} alt="" className="mx-auto h-40 w-32 object-contain" /><h2 className="font-display text-2xl font-bold">{t(`garden.variant.${harvestTarget.plantVariant}`)}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7f746e]">{t("garden.v3.harvestHint")}</p><div className="mt-5 flex justify-center gap-3"><Button variant="ghost" onClick={() => setHarvestTarget(null)}>{t("garden.v3.later")}</Button><Button variant="garden" onClick={harvest}>{t("garden.v3.harvest")}</Button></div></div>
      </Sheet>}

      {plantInfo && <Sheet onClose={() => setPlantInfo(null)}>
        <div className="text-center"><img src={plantAsset(plantInfo)} alt="" className="mx-auto h-40 w-32 object-contain" /><h2 className="font-display text-2xl font-bold">{plantInfo.status === "planted" ? t("garden.growingNow") : t(`garden.variant.${plantInfo.plantVariant}`)}</h2><p className="mt-2 text-sm text-[#7f746e]">{plantInfo.status === "usedForLetter" ? t("garden.v3.usedForLetter") : plantInfo.status === "planted" ? t("garden.v3.growingHint") : t("garden.v3.collectedHint")}</p><Button className="mt-5" variant="ghost" onClick={() => setPlantInfo(null)}>{t("garden.keepWalking")}</Button></div>
      </Sheet>}

      {letterPickerOpen && <Sheet onClose={() => !writing && setLetterPickerOpen(false)}>
        <div className="flex items-start justify-between gap-4"><div><h2 className="font-display text-2xl font-bold">{t("garden.v3.pickerTitle")}</h2><p className="mt-1 text-sm text-[#8d817a]">{t("garden.v3.pickerSubtitle")}</p></div>{!writing && <button type="button" className="sheet-close" onClick={() => setLetterPickerOpen(false)} aria-label={t("garden.v3.later")}><X /></button>}</div>
        {writing ? <div className="grid min-h-64 place-items-center text-center"><div><img src="/mascot/poses/writing.png" alt="" className="mx-auto h-32 w-32 object-contain animate-pulse" /><p className="font-display text-xl font-bold">{t("garden.v3.writing")}</p></div></div> : <>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">{garden.availableLetterPlants.map((seed) => { const selected = selectedSeedIds.includes(seed.id); return <button type="button" key={seed.id} className={cn("letter-plant-row", selected && "letter-plant-row--selected")} onClick={() => toggleSelected(seed.id)}><img src={matureAssets[seed.plantVariant]} alt="" /><span className="min-w-0 flex-1 text-left"><strong className="block truncate">{t(`garden.variant.${seed.plantVariant}`)}</strong><small>{t(seed.seedType === "warmth" ? "garden.v3.warmPlant" : "garden.v3.worryPlant")}</small></span><span className="selection-check">{selected && <Check />}</span></button>; })}</div>
          <div className="mt-5 rounded-[20px] border border-[#e8ded2] bg-[#faf7f1] p-4"><p className="text-sm font-semibold">{selectedSeedIds.length === 3 ? t(`letter.preview.${previewType}.title`) : t("garden.v3.selectedCount", { count: selectedSeedIds.length })}</p><p className="mt-1 text-sm text-[#7f746e]">{selectedSeedIds.length === 3 ? t(`letter.preview.${previewType}.body`) : t("garden.v3.pickExactly")}</p></div>
          <div className="mt-5 flex justify-end gap-3"><Button variant="ghost" onClick={() => setLetterPickerOpen(false)}>{t("garden.v3.later")}</Button><Button variant="garden" onClick={createLetter} disabled={selectedSeedIds.length !== 3}>{t("garden.v3.writeLetter")}</Button></div>
        </>}
      </Sheet>}

      {toast && <div className="garden-toast">{toast}</div>}
    </AppShell>
  );
}
