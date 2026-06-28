import type { Language } from "../i18n/translations";

export type EntryType = "emotion" | "warmth";
export type PlantStage = "seed" | "sprout" | "young" | "flower" | "bloom";
export type WarmPlantKind = "daisy" | "tulip" | "sunflower" | "cherry_blossom";
export type EmotionPlantKind = "clover" | "moon_grass" | "lavender" | "wildflower";
export type PlantKind = WarmPlantKind | EmotionPlantKind;
export type GardenSeedType = "warmth" | "feeling";
export type GardenPlantCategory = "flower" | "leaf" | "tree";
export type GardenSeedStatus = "inventory" | "planted" | "ready" | "grown" | "usedForLetter" | "archived";
export type GardenPlotState = "empty" | "planted" | "ready" | "grown";
export type GardenWarmthVariant = "daisy" | "tulip" | "sunflower" | "cherry_blossom" | "rose" | "lavender" | "hibiscus";
export type GardenFeelingVariant =
  | "sprout"
  | "leaf"
  | "clover"
  | "small_tree"
  | "pine"
  | "four_leaf"
  | "cactus"
  | "palm"
  | "bamboo"
  | "mushroom";
export type GardenPlantVariant = GardenWarmthVariant | GardenFeelingVariant;
export type GardenKeepsakeType = "bouquet" | "herbarium" | "grove";

export const primaryEmotionKeys = [
  "sadness",
  "anger",
  "anxiety",
  "disappointed",
  "drained",
  "frustrated",
  "numbness"
] as const;

export const extraEmotionKeys = [
  "loneliness",
  "hurt",
  "overwhelm",
  "shame",
  "confused",
  "rejected",
  "stressed",
  "jealous",
  "hopeless",
  "guilty",
  "fear",
  "empty",
  "sensitive",
  "on_edge",
  "avoidant",
  "unseen",
  "ignored",
  "lost"
] as const;

const archivedEmotionKeys = ["tenderness", "moved", "calm", "grateful", "hopeful"] as const;

export const emotionKeys = [...primaryEmotionKeys, ...extraEmotionKeys, ...archivedEmotionKeys] as const;

export const primarySymptomKeys = [
  "tight_chest",
  "stomach_knot",
  "heavy_head",
  "tears",
  "low_energy",
  "nothing_at_all",
  "sleepy",
  "want_to_hide"
] as const;

export const extraSymptomKeys = [
  "restless_hands",
  "can_not_sleep",
  "fast_heartbeat",
  "short_breath",
  "heavy_shoulders",
  "headache",
  "zoning_out",
  "want_to_eat",
  "no_appetite",
  "feeling_cold",
  "feeling_hot",
  "can_not_sit_still",
  "numb_body",
  "exhausted",
  "sore_eyes",
  "want_to_cry_harder",
  "can_not_do_anything"
] as const;

export const symptomKeys = [...primarySymptomKeys, ...extraSymptomKeys] as const;
export const moodKeys = ["gentle", "tired", "hopeful", "quiet", "tender", "unsettled"] as const;
export const weatherKeys = ["sunny", "cloudy", "rainy", "foggy", "windy", "moonlit", "thunder", "starry"] as const;

export type EmotionKey = (typeof emotionKeys)[number];
export type SymptomKey = (typeof symptomKeys)[number];
export type MoodKey = (typeof moodKeys)[number];
export type WeatherKey = (typeof weatherKeys)[number];

export const emotionIcons: Record<EmotionKey, string> = {
  sadness: "💧",
  anger: "🌶️",
  anxiety: "⚡",
  disappointed: "🌧️",
  drained: "🌙",
  frustrated: "🐝",
  numbness: "◌",
  loneliness: "🍂",
  hurt: "🫧",
  overwhelm: "🪨",
  shame: "🌫️",
  confused: "❔",
  rejected: "🚪",
  stressed: "📦",
  jealous: "🌵",
  hopeless: "🌑",
  guilty: "🧵",
  fear: "🐾",
  empty: "☁️",
  sensitive: "🌼",
  on_edge: "🌊",
  avoidant: "🍃",
  unseen: "📭",
  ignored: "👁️",
  lost: "🧭",
  tenderness: "🫶",
  moved: "✨",
  calm: "🕊️",
  grateful: "☀️",
  hopeful: "🌱"
};

export type EmotionEntry = {
  id: string;
  type: "emotion";
  timestamp: string;
  emotions: EmotionKey[];
  symptoms: SymptomKey[];
  intensity: number;
  whatHappened: string;
  childhood: string;
  beliefs: string;
};

export type WarmthEntry = {
  id: string;
  type: "warmth";
  timestamp: string;
  mood: MoodKey | string;
  weather: WeatherKey | string;
  gratitude: string;
  success: string;
};

export type DiaryEntry = EmotionEntry | WarmthEntry;

export type GardenPlant = {
  id: string;
  entryId: string;
  type: EntryType;
  kind: PlantKind;
  stage: PlantStage;
  plantedAt: string;
  daysGrowing: number;
};

export type GardenMilestone = "first_seed" | "gentle_bloom" | "golden_flower" | "brave_clover";

export type GardenSeed = {
  id: string;
  entryId: string;
  seedType: GardenSeedType;
  plantCategory: GardenPlantCategory;
  plantVariant: GardenPlantVariant;
  status: GardenSeedStatus;
  createdAt: string;
  plantedAt: string | null;
  maturesAt: string | null;
  plotId: string | null;
  revealedAt: string | null;
  harvestedAt: string | null;
  usedInLetterIds: string[];
};

export type BunnyLetterType = "warm-light" | "slow-growth" | "after-rain";

export type BunnyLetter = {
  id: string;
  letterType: BunnyLetterType;
  seedIds: string[];
  createdAt: string;
  templateIndex: number;
};

export type GardenPlot = {
  id: string;
  positionIndex: number;
  state: GardenPlotState;
  seedId: string | null;
};

export type GardenKeepsake = {
  id: string;
  type: GardenKeepsakeType;
  name: string;
  plantIds: string[];
  entryIds: string[];
  createdAt: string;
};

export type GardenPlotView = GardenPlot & {
  seed: GardenSeed | null;
  entry: DiaryEntry | null;
};

export type GardenKeepsakeView = GardenKeepsake & {
  entries: DiaryEntry[];
};

export type GardenMemoryStatus = "inventory" | "growing" | "garden" | "keepsake";

export type GardenMemoryItem = {
  seedId: string;
  entryId: string;
  plantVariant: GardenPlantVariant;
  plantCategory: GardenPlantCategory;
  seedType: GardenSeedType;
  timestamp: string;
  summary: string;
  status: GardenMemoryStatus;
  displayIconType: "seed" | "mound" | "plant";
  displayLabelKey: string;
  isVariantHidden: boolean;
};

export type GardenState = {
  plots: GardenPlotView[];
  plotPages: GardenPlotView[][];
  seedInventory: GardenSeed[];
  keepsakes: GardenKeepsakeView[];
  letters: BunnyLetter[];
  collectedSeeds: GardenSeed[];
  availableLetterPlants: GardenSeed[];
  memoryBook: GardenMemoryItem[];
  milestones: GardenMilestone[];
  totalEntries: number;
  totalPlants: number;
  daysTogether: number;
  readyCount: number;
  warmthSeedCount: number;
  feelingSeedCount: number;
  warmPlantCount: number;
  worryPlantCount: number;
  waitingSeedCount: number;
  bunnyLine: "empty" | "inventory" | "ready" | "growing" | "full";
};

export type BunnyDiarySettings = {
  bunnyName: string;
  language: Language;
};

const EMOTION_KEY = "bunnyDiary_emotionEntries";
const WARMTH_KEY = "bunnyDiary_warmthEntries";
const SETTINGS_KEY = "bunnyDiary_settings";
const SEEDS_KEY = "bunnyDiary_gardenSeeds";
const PLOTS_KEY = "bunnyDiary_gardenPlots";
const KEEPSAKES_KEY = "bunnyDiary_gardenKeepsakes";
const LETTERS_KEY = "bunnyDiary_bunnyLetters";
const LEGACY_ENTRY_KEY = "currentEntry";
const LEGACY_WARMTH_KEY = "currentWarmth";

const defaultSettings: BunnyDiarySettings = {
  bunnyName: "Bunny",
  language: "en"
};

const GARDEN_PLOT_COUNT = 10;
const MATURITY_SPROUT_MINUTES = 2;
const MATURITY_BLOOM_MINUTES = 5;
const plantStages: PlantStage[] = ["seed", "sprout", "young", "flower", "bloom"];
const warmPlantKinds: WarmPlantKind[] = ["daisy", "tulip", "sunflower", "cherry_blossom"];
const emotionPlantKinds: EmotionPlantKind[] = ["clover", "moon_grass", "lavender", "wildflower"];
const gardenWarmthVariants: GardenWarmthVariant[] = ["daisy", "tulip", "sunflower", "cherry_blossom", "rose", "lavender", "hibiscus"];
const gardenFeelingVariants: GardenFeelingVariant[] = [
  "sprout",
  "leaf",
  "clover",
  "small_tree",
  "pine",
  "four_leaf",
  "cactus",
  "palm",
  "bamboo",
  "mushroom"
];
const treeVariants = new Set<GardenPlantVariant>(["small_tree", "pine", "palm"]);

const legacyEmotionMap: Record<string, EmotionKey> = {
  Sad: "sadness",
  sadness: "sadness",
  Angry: "anger",
  anger: "anger",
  Anxious: "anxiety",
  anxiety: "anxiety",
  Lonely: "loneliness",
  loneliness: "loneliness",
  Ashamed: "shame",
  shame: "shame",
  Overwhelmed: "overwhelm",
  overwhelm: "overwhelm",
  Numb: "numbness",
  numbness: "numbness",
  Tender: "tenderness",
  tenderness: "tenderness",
  Disappointed: "disappointed",
  disappointed: "disappointed",
  Confused: "confused",
  confused: "confused",
  Rejected: "rejected",
  rejected: "rejected",
  Frustrated: "frustrated",
  frustrated: "frustrated",
  Stressed: "stressed",
  stressed: "stressed",
  Jealous: "jealous",
  jealous: "jealous",
  Hopeless: "hopeless",
  hopeless: "hopeless",
  Guilty: "guilty",
  guilty: "guilty"
};

const legacySymptomMap: Record<string, SymptomKey> = {
  "Tight chest": "tight_chest",
  tight_chest: "tight_chest",
  "Heavy head": "heavy_head",
  heavy_head: "heavy_head",
  "Stomach knot": "stomach_knot",
  stomach_knot: "stomach_knot",
  Tears: "tears",
  tears: "tears",
  "Restless hands": "restless_hands",
  restless_hands: "restless_hands",
  "Low energy": "low_energy",
  low_energy: "low_energy"
};

const legacyMoodMap: Record<string, MoodKey> = {
  Gentle: "gentle",
  gentle: "gentle",
  Tired: "tired",
  tired: "tired",
  Hopeful: "hopeful",
  hopeful: "hopeful",
  Quiet: "quiet",
  quiet: "quiet",
  Tender: "tender",
  tender: "tender",
  Unsettled: "unsettled",
  unsettled: "unsettled"
};

const legacyWeatherMap: Record<string, WeatherKey> = {
  Sunny: "sunny",
  sunny: "sunny",
  Cloudy: "cloudy",
  cloudy: "cloudy",
  Raining: "rainy",
  rainy: "rainy",
  Foggy: "foggy",
  foggy: "foggy",
  Wind: "windy",
  windy: "windy",
  Moonlit: "moonlit",
  moonlit: "moonlit",
  Thunder: "thunder",
  thunder: "thunder",
  Starry: "starry",
  starry: "starry"
};

function hasStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function readArray<T>(key: string): T[] {
  if (!hasStorage()) return [];
  const parsed = safeParse<unknown>(window.localStorage.getItem(key), []);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

function writeArray<T>(key: string, entries: T[]) {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(entries));
}

export function createEntryId(type: EntryType) {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${type}-${randomId}`;
}

function readSeeds() {
  return readArray<GardenSeed>(SEEDS_KEY).map((seed) => ({
    ...seed,
    harvestedAt: seed.harvestedAt ?? seed.revealedAt ?? null,
    usedInLetterIds: Array.isArray(seed.usedInLetterIds) ? seed.usedInLetterIds : []
  }));
}

function writeSeeds(seeds: GardenSeed[]) {
  writeArray(SEEDS_KEY, seeds);
}

function createDefaultPlots(): GardenPlot[] {
  return Array.from({ length: GARDEN_PLOT_COUNT }, (_, index) => ({
    id: `plot_${String(index + 1).padStart(2, "0")}`,
    positionIndex: index + 1,
    state: "empty",
    seedId: null
  }));
}

function readPlots() {
  const plots = readArray<GardenPlot>(PLOTS_KEY);
  if (plots.length === GARDEN_PLOT_COUNT) return plots;
  const occupied = plots.filter((plot) => plot.seedId).slice(0, GARDEN_PLOT_COUNT);
  return createDefaultPlots().map((plot, index) => {
    const previous = occupied[index];
    return previous ? { ...plot, state: previous.state, seedId: previous.seedId } : plot;
  });
}

function writePlots(plots: GardenPlot[]) {
  writeArray(PLOTS_KEY, plots);
}

function readKeepsakes() {
  return readArray<GardenKeepsake>(KEEPSAKES_KEY);
}

function writeKeepsakes(keepsakes: GardenKeepsake[]) {
  writeArray(KEEPSAKES_KEY, keepsakes);
}

function readLetters() {
  return readArray<BunnyLetter>(LETTERS_KEY);
}

function writeLetters(letters: BunnyLetter[]) {
  writeArray(LETTERS_KEY, letters);
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function createSeedId(entryId: string) {
  return `seed_${entryId}`;
}

function createLetterId() {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `letter_${randomId}`;
}

function getGardenSeedType(entry: DiaryEntry): GardenSeedType {
  return entry.type === "warmth" ? "warmth" : "feeling";
}

function getPlantVariant(entry: DiaryEntry): GardenPlantVariant {
  const source = `${entry.id}-${entry.timestamp}-${entry.type}`;
  const hash = hashString(source);
  if (entry.type === "warmth") {
    return gardenWarmthVariants[hash % gardenWarmthVariants.length];
  }
  return gardenFeelingVariants[hash % gardenFeelingVariants.length];
}

function getPlantCategory(variant: GardenPlantVariant): GardenPlantCategory {
  if (gardenWarmthVariants.includes(variant as GardenWarmthVariant)) return "flower";
  if (treeVariants.has(variant)) return "tree";
  return "leaf";
}

function summarizeEntry(entry: DiaryEntry, maxLength = 20) {
  const text =
    entry.type === "warmth"
      ? `${entry.gratitude} ${entry.success}`.trim()
      : `${entry.whatHappened} ${entry.childhood} ${entry.beliefs}`.trim();

  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function computeMaturesAt(plantedAtIso: string) {
  return new Date(new Date(plantedAtIso).getTime() + MATURITY_BLOOM_MINUTES * 60 * 1000).toISOString();
}

function isSeedMature(seed: GardenSeed, now = new Date()) {
  if (!seed.plantedAt || !seed.maturesAt) return false;
  return now.getTime() >= new Date(seed.maturesAt).getTime();
}

function createSeedForEntry(entry: DiaryEntry): GardenSeed {
  const plantVariant = getPlantVariant(entry);

  return {
    id: createSeedId(entry.id),
    entryId: entry.id,
    seedType: getGardenSeedType(entry),
    plantCategory: getPlantCategory(plantVariant),
    plantVariant,
    status: "inventory",
    createdAt: entry.timestamp,
    plantedAt: null,
    maturesAt: null,
    plotId: null,
    revealedAt: null,
    harvestedAt: null,
    usedInLetterIds: []
  };
}

export function getSeedDisplayState(seed: GardenSeed) {
  if (seed.status === "inventory") {
    return {
      displayIconType: "seed" as const,
      displayLabelKey: `garden.seedType.${seed.seedType}`,
      isVariantHidden: true
    };
  }

  if (seed.status === "planted") {
    return {
      displayIconType: "mound" as const,
      displayLabelKey: "garden.growingNow",
      isVariantHidden: true
    };
  }

  return {
    displayIconType: "plant" as const,
    displayLabelKey: `garden.variant.${seed.plantVariant}`,
    isVariantHidden: false
  };
}

function readGardenStorage() {
  const entries = getAllEntries();
  const entryMap = new Map(entries.map((entry) => [entry.id, entry]));
  const existingSeeds = readSeeds();
  const nextSeedsMap = new Map<string, GardenSeed>();

  existingSeeds.forEach((seed) => {
    if (!entryMap.has(seed.entryId)) return;
    nextSeedsMap.set(seed.id, isSeedMature(seed) && seed.status === "planted" ? { ...seed, status: "ready" } : seed);
  });

  entries.forEach((entry) => {
    const seedId = createSeedId(entry.id);
    if (!nextSeedsMap.has(seedId)) {
      nextSeedsMap.set(seedId, createSeedForEntry(entry));
    }
  });

  const nextSeeds = [...nextSeedsMap.values()].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const validSeedIds = new Set(nextSeeds.map((seed) => seed.id));

  const nextPlots: GardenPlot[] = readPlots().map((plot) => {
    const seed = plot.seedId ? nextSeedsMap.get(plot.seedId) ?? null : null;
    if (!seed || !validSeedIds.has(seed.id) || seed.status === "inventory" || seed.status === "archived" || seed.status === "usedForLetter") {
      return { ...plot, state: "empty" as const, seedId: null };
    }

    const state = seed.status === "ready" ? "ready" : seed.status === "grown" ? "grown" : "planted";
    return { ...plot, state, seedId: seed.id };
  });

  const nextKeepsakes = readKeepsakes()
    .map((keepsake) => {
      const nextEntryIds = keepsake.entryIds.filter((entryId) => entryMap.has(entryId));
      const nextPlantIds = keepsake.plantIds.filter((plantId) => {
        const seedId = plantId.replace(/^plant_/, "");
        return validSeedIds.has(seedId);
      });

      return {
        ...keepsake,
        entryIds: nextEntryIds,
        plantIds: nextPlantIds
      };
    })
    .filter((keepsake) => keepsake.entryIds.length > 0 && keepsake.plantIds.length > 0);

  const nextLetters = readLetters().filter((letter) => letter.seedIds.every((seedId) => validSeedIds.has(seedId)));

  return {
    entries,
    seeds: nextSeeds,
    plots: nextPlots,
    keepsakes: nextKeepsakes,
    letters: nextLetters
  };
}

function syncGardenStorage() {
  const state = readGardenStorage();

  writeSeeds(state.seeds);
  writePlots(state.plots);
  writeKeepsakes(state.keepsakes);
  writeLetters(state.letters);

  return state;
}

export function getEmotionEntries() {
  return readArray<EmotionEntry>(EMOTION_KEY);
}

export function setEmotionEntries(entries: EmotionEntry[]) {
  writeArray(EMOTION_KEY, entries);
}

export function appendEmotionEntry(entry: EmotionEntry) {
  const entries = getEmotionEntries();
  setEmotionEntries([...entries, entry]);
  syncGardenStorage();
}

export function getWarmthEntries() {
  return readArray<WarmthEntry>(WARMTH_KEY);
}

export function setWarmthEntries(entries: WarmthEntry[]) {
  writeArray(WARMTH_KEY, entries);
}

export function appendWarmthEntry(entry: WarmthEntry) {
  const entries = getWarmthEntries();
  setWarmthEntries([...entries, entry]);
  syncGardenStorage();
}

export function getAllEntries() {
  return [...getEmotionEntries(), ...getWarmthEntries()].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getEntryById(id: string) {
  return getAllEntries().find((entry) => entry.id === id) ?? null;
}

export function getGardenState(): GardenState {
  const { entries, seeds, plots, keepsakes, letters } = readGardenStorage();
  const chronologicalEntries = [...entries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const firstEntry = chronologicalEntries[0];
  const now = Date.now();
  const entryMap = new Map(entries.map((entry) => [entry.id, entry]));
  const seedMap = new Map(seeds.map((seed) => [seed.id, seed]));

  const plotViews = plots.map((plot) => {
    const seed = plot.seedId ? seedMap.get(plot.seedId) ?? null : null;
    const entry = seed ? entryMap.get(seed.entryId) ?? null : null;
    const state: GardenPlotState =
      !seed || seed.status === "inventory" || seed.status === "archived"
        ? "empty"
        : seed.status === "ready"
          ? "ready"
        : seed.status === "grown" || seed.status === "usedForLetter"
            ? "grown"
            : "planted";

    return {
      ...plot,
      state,
      seed,
      entry
    };
  });

  const keepsakeViews = keepsakes
    .map((keepsake) => ({
      ...keepsake,
      entries: keepsake.entryIds.map((entryId) => entryMap.get(entryId)).filter((entry): entry is DiaryEntry => Boolean(entry))
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const memoryBook = seeds
    .map((seed) => {
      const entry = entryMap.get(seed.entryId);
      if (!entry) return null;

      const status: GardenMemoryStatus =
        seed.status === "inventory"
          ? "inventory"
          : seed.status === "archived"
            ? "keepsake"
            : seed.status === "grown" || seed.status === "usedForLetter"
              ? "garden"
              : "growing";
      const displayState = getSeedDisplayState(seed);

      return {
        seedId: seed.id,
        entryId: entry.id,
        plantVariant: seed.plantVariant,
        plantCategory: seed.plantCategory,
        seedType: seed.seedType,
        timestamp: entry.timestamp,
        summary: summarizeEntry(entry),
        status,
        displayIconType: displayState.displayIconType,
        displayLabelKey: displayState.displayLabelKey,
        isVariantHidden: displayState.isVariantHidden
      };
    })
    .filter((item): item is GardenMemoryItem => Boolean(item))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const readyCount = seeds.filter((seed) => seed.status === "ready").length;
  const inventorySeeds = seeds
    .filter((seed) => seed.status === "inventory")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const warmthSeedCount = inventorySeeds.filter((seed) => seed.seedType === "warmth").length;
  const feelingSeedCount = inventorySeeds.filter((seed) => seed.seedType === "feeling").length;
  const activePlantCount = seeds.filter((seed) => seed.status === "grown" || seed.status === "usedForLetter").length;
  const plotsInUse = plotViews.filter((plot) => plot.state !== "empty").length;
  const bunnyLine: GardenState["bunnyLine"] =
    !entries.length ? "empty" : readyCount > 0 ? "ready" : inventorySeeds.length > 0 ? "inventory" : plotsInUse >= GARDEN_PLOT_COUNT ? "full" : "growing";
  const plantedSeeds = seeds.filter((seed) => seed.status !== "inventory");
  const collectedSeeds = seeds.filter((seed) => ["grown", "usedForLetter", "archived"].includes(seed.status));
  const availableLetterPlants = seeds.filter((seed) => seed.status === "grown");

  return {
    plots: plotViews,
    plotPages: [plotViews],
    seedInventory: inventorySeeds,
    keepsakes: keepsakeViews,
    letters: [...letters].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    collectedSeeds,
    availableLetterPlants,
    memoryBook,
    milestones: getGardenMilestones(chronologicalEntries),
    totalEntries: entries.length,
    totalPlants: activePlantCount,
    daysTogether: firstEntry ? Math.max(1, Math.floor((now - new Date(firstEntry.timestamp).getTime()) / 86_400_000) + 1) : 0,
    readyCount,
    warmthSeedCount,
    feelingSeedCount,
    warmPlantCount: plantedSeeds.filter((seed) => seed.seedType === "warmth").length,
    worryPlantCount: plantedSeeds.filter((seed) => seed.seedType === "feeling").length,
    waitingSeedCount: inventorySeeds.length,
    bunnyLine
  };
}

function getGardenMilestones(entries: DiaryEntry[]): GardenMilestone[] {
  const milestones: GardenMilestone[] = [];
  const uniqueDays = new Set(entries.map((entry) => new Date(entry.timestamp).toDateString()));

  if (entries.length > 0) milestones.push("first_seed");
  if (uniqueDays.size >= 7) milestones.push("gentle_bloom");
  if (entries.length >= 30) milestones.push("golden_flower");
  if (entries.some((entry) => entry.type === "emotion")) milestones.push("brave_clover");

  return milestones;
}

export function plantSeedInPlot(seedId: string, plotId: string) {
  const { seeds, plots } = syncGardenStorage();
  const nowIso = new Date().toISOString();
  const seed = seeds.find((item) => item.id === seedId);
  const plot = plots.find((item) => item.id === plotId);

  if (!seed || !plot || seed.status !== "inventory" || plot.seedId) {
    return { ok: false as const };
  }

  const nextSeeds = seeds.map((item) =>
    item.id === seedId
      ? {
          ...item,
          status: "planted" as const,
          plantedAt: nowIso,
          maturesAt: computeMaturesAt(nowIso),
          plotId
        }
      : item
  );
  const nextPlots: GardenPlot[] = plots.map((item) => (item.id === plotId ? { ...item, state: "planted" as const, seedId } : item));

  writeSeeds(nextSeeds);
  writePlots(nextPlots);

  return { ok: true as const };
}

export function revealSeed(seedId: string) {
  const { seeds, plots } = syncGardenStorage();
  const seed = seeds.find((item) => item.id === seedId);
  if (!seed || seed.status !== "ready") {
    return null;
  }

  const revealedAt = new Date().toISOString();
  const nextSeeds = seeds.map((item) =>
    item.id === seedId ? { ...item, status: "grown" as const, revealedAt, harvestedAt: revealedAt } : item
  );
  const nextPlots: GardenPlot[] = plots.map((plot) => (plot.seedId === seedId ? { ...plot, state: "grown" as const } : plot));
  writeSeeds(nextSeeds);
  writePlots(nextPlots);

  return nextSeeds.find((item) => item.id === seedId) ?? null;
}

export const harvestSeed = revealSeed;

export function getLetterById(letterId: string) {
  const state = readGardenStorage();
  const letter = state.letters.find((item) => item.id === letterId) ?? null;
  if (!letter) return null;
  return {
    ...letter,
    seeds: letter.seedIds.map((seedId) => state.seeds.find((seed) => seed.id === seedId)).filter((seed): seed is GardenSeed => Boolean(seed))
  };
}

export function createBunnyLetter(seedIds: string[]) {
  if (seedIds.length !== 3 || new Set(seedIds).size !== 3) return null;
  const state = syncGardenStorage();
  const selectedSeeds = seedIds
    .map((seedId) => state.seeds.find((seed) => seed.id === seedId))
    .filter((seed): seed is GardenSeed => Boolean(seed));
  if (selectedSeeds.length !== 3 || selectedSeeds.some((seed) => seed.status !== "grown")) return null;

  const warmCount = selectedSeeds.filter((seed) => seed.seedType === "warmth").length;
  const letterType: BunnyLetterType = warmCount === 3 ? "warm-light" : warmCount === 0 ? "slow-growth" : "after-rain";
  const letter: BunnyLetter = {
    id: createLetterId(),
    letterType,
    seedIds,
    createdAt: new Date().toISOString(),
    templateIndex: state.letters.filter((item) => item.letterType === letterType).length % 3
  };

  const nextSeeds = state.seeds.map((seed) =>
    seedIds.includes(seed.id)
      ? {
          ...seed,
          status: "usedForLetter" as const,
          usedInLetterIds: [...seed.usedInLetterIds, letter.id]
        }
      : seed
  );
  writeSeeds(nextSeeds);
  writeLetters([...state.letters, letter]);
  return letter;
}

export function getSeedById(seedId: string) {
  return readGardenStorage().seeds.find((seed) => seed.id === seedId) ?? null;
}

export function getPlotById(plotId: string) {
  return readGardenStorage().plots.find((plot) => plot.id === plotId) ?? null;
}

export function getEntryGardenAttachment(id: string) {
  const { seeds, keepsakes } = readGardenStorage();
  const seed = seeds.find((item) => item.entryId === id) ?? null;
  const keepsake = keepsakes.find((item) => item.entryIds.includes(id)) ?? null;
  return {
    seed,
    keepsake
  };
}

export function deleteEntry(id: string) {
  const emotionEntries = getEmotionEntries();
  const warmthEntries = getWarmthEntries();
  const nextEmotionEntries = emotionEntries.filter((entry) => entry.id !== id);
  const nextWarmthEntries = warmthEntries.filter((entry) => entry.id !== id);

  setEmotionEntries(nextEmotionEntries);
  setWarmthEntries(nextWarmthEntries);
  syncGardenStorage();

  return nextEmotionEntries.length !== emotionEntries.length || nextWarmthEntries.length !== warmthEntries.length;
}

export function getSettings(): BunnyDiarySettings {
  if (!hasStorage()) return defaultSettings;
  const settings = { ...defaultSettings, ...safeParse<Partial<BunnyDiarySettings>>(window.localStorage.getItem(SETTINGS_KEY), {}) };
  return {
    ...settings,
    language: settings.language === "zh" ? "zh" : "en"
  };
}

export function saveSettings(settings: Partial<BunnyDiarySettings>) {
  if (!hasStorage()) return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...getSettings(), ...settings }));
}

export function saveLanguage(language: Language) {
  saveSettings({ language });
}

export function exportDiaryData() {
  const { seeds, plots, keepsakes, letters } = readGardenStorage();
  return {
    exportedAt: new Date().toISOString(),
    settings: getSettings(),
    emotionEntries: getEmotionEntries(),
    warmthEntries: getWarmthEntries(),
    gardenSeeds: seeds,
    gardenPlots: plots,
    gardenKeepsakes: keepsakes,
    bunnyLetters: letters
  };
}

export function clearAllDiaryData() {
  if (!hasStorage()) return;
  window.localStorage.removeItem(EMOTION_KEY);
  window.localStorage.removeItem(WARMTH_KEY);
  window.localStorage.removeItem(SETTINGS_KEY);
  window.localStorage.removeItem(SEEDS_KEY);
  window.localStorage.removeItem(PLOTS_KEY);
  window.localStorage.removeItem(KEEPSAKES_KEY);
  window.localStorage.removeItem(LETTERS_KEY);
  window.localStorage.removeItem(LEGACY_ENTRY_KEY);
  window.localStorage.removeItem(LEGACY_WARMTH_KEY);
}

export function migrateLegacyEntries() {
  if (!hasStorage()) return;

  const emotionEntries = getEmotionEntries();
  const warmthEntries = getWarmthEntries();
  const legacyEmotion = safeParse<Partial<EmotionEntry> | null>(window.localStorage.getItem(LEGACY_ENTRY_KEY), null);
  const legacyWarmth = safeParse<Partial<WarmthEntry> | null>(window.localStorage.getItem(LEGACY_WARMTH_KEY), null);

  if (legacyEmotion && !emotionEntries.length) {
    const entry: EmotionEntry = {
      id: legacyEmotion.id || createEntryId("emotion"),
      type: "emotion",
      timestamp: legacyEmotion.timestamp || new Date().toISOString(),
      emotions: normalizeEmotionKeys(legacyEmotion.emotions),
      symptoms: normalizeSymptomKeys(legacyEmotion.symptoms),
      intensity: Number(legacyEmotion.intensity) || 5,
      whatHappened: legacyEmotion.whatHappened || "",
      childhood: legacyEmotion.childhood || "",
      beliefs: legacyEmotion.beliefs || ""
    };
    setEmotionEntries([entry]);
  }

  if (legacyWarmth && !warmthEntries.length) {
    const entry: WarmthEntry = {
      id: legacyWarmth.id || createEntryId("warmth"),
      type: "warmth",
      timestamp: legacyWarmth.timestamp || new Date().toISOString(),
      mood: normalizeMoodKey(legacyWarmth.mood || ""),
      weather: normalizeWeatherKey(legacyWarmth.weather || ""),
      gratitude: legacyWarmth.gratitude || "",
      success: legacyWarmth.success || ""
    };
    setWarmthEntries([entry]);
  }

  normalizeExistingEntries();
  syncGardenStorage();
}

function normalizeEmotionKeys(values: unknown): EmotionKey[] {
  if (!Array.isArray(values)) return [];
  return values.map((value) => legacyEmotionMap[String(value)]).filter((value): value is EmotionKey => Boolean(value));
}

function normalizeSymptomKeys(values: unknown): SymptomKey[] {
  if (!Array.isArray(values)) return [];
  return values.map((value) => legacySymptomMap[String(value)]).filter((value): value is SymptomKey => Boolean(value));
}

function normalizeMoodKey(value: string) {
  return legacyMoodMap[value] ?? value;
}

function normalizeWeatherKey(value: string) {
  return legacyWeatherMap[value] ?? value;
}

function normalizeExistingEntries() {
  const nextEmotionEntries = getEmotionEntries().map((entry) => ({
    ...entry,
    emotions: normalizeEmotionKeys(entry.emotions),
    symptoms: normalizeSymptomKeys(entry.symptoms)
  }));
  const nextWarmthEntries = getWarmthEntries().map((entry) => ({
    ...entry,
    mood: normalizeMoodKey(entry.mood),
    weather: normalizeWeatherKey(entry.weather)
  }));

  setEmotionEntries(nextEmotionEntries);
  setWarmthEntries(nextWarmthEntries);
}
