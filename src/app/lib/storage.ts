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
  "nothingness",
  "frustrated",
  "stressed",
  "burnout",
  "emo"
] as const;

export const extraEmotionKeys = [
  "loneliness",
  "hurt",
  "overwhelm",
  "shame",
  "confused",
  "rejected",
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
  "lost",
  "numbness"
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
  nothingness: "·",
  burnout: "🪫",
  emo: "🌑",
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

export type DailyLetterCategory =
  | "self-acceptance"
  | "relationship-hurt"
  | "people-pleasing"
  | "avoidance"
  | "perfectionism"
  | "shame"
  | "body"
  | "small-action"
  | "plant-personality";

export type DailyLetterData = {
  category: DailyLetterCategory;
  titleZh: string;
  titleEn: string;
  bodyZh: string;
  bodyEn: string;
};

export type DailyLetterState = {
  lastClaimDate: string | null;
  lastClaimedIndex: number;
  shuffledOrder: number[];
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
const ONBOARDING_KEY = "bunnyDiary_onboardingDone";
const DAILY_LETTER_STATE_KEY = "bunnyDiary_dailyLetterState";
const DAILY_LETTER_SAVED_KEY = "bunnyDiary_dailyLetterSaved";

const defaultSettings: BunnyDiarySettings = {
  bunnyName: "Bunny",
  language: "zh"
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

export const gardenPlantAssets: Record<GardenPlantVariant, string> = {
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

/** 检查今天是否还能写笔记（每天最多 2 篇） */
export function canWriteToday(): boolean {
  const today = new Date().toDateString();
  const all = getAllEntries();
  const todayCount = all.filter((e) => new Date(e.timestamp).toDateString() === today).length;
  return todayCount < 3;
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

  // Use seed IDs to pick a stable body index per plant combination
  const seedHash = seedIds.reduce((acc, id) => {
    for (let i = 0; i < id.length; i++) acc = ((acc << 5) - acc + id.charCodeAt(i)) | 0;
    return acc;
  }, 0);
  const bodyCount = 30; // each type has 30 body variants
  const templateIndex = Math.abs(seedHash) % bodyCount;

  const letter: BunnyLetter = {
    id: createLetterId(),
    letterType,
    seedIds,
    createdAt: new Date().toISOString(),
    templateIndex
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

// ─── Daily Letters (no redemption needed, one per day) ───

export const dailyLetters: DailyLetterData[] = [
  { category: "self-acceptance", titleZh: "不给今天打分", titleEn: "Don't Score Today", bodyZh: "小兔今天没有给你打分。因为人不是作业本，不需要每天都被红笔圈出哪里不够好。有时候，先承认\"我已经很累了\"，反而会让心慢慢恢复一点力气。", bodyEn: "Bunny didn't give you a score today. Because you're not a test paper — you don't need red marks pointing out what wasn't good enough. Sometimes, just admitting 'I'm really tired' is what lets your heart slowly recover." },
  { category: "self-acceptance", titleZh: "乱一点也没关系", titleEn: "A Little Mess Is Okay", bodyZh: "你不需要每一天都表现得很好。小兔觉得，人有时候会乱，会慢，会不知道怎么办，这些都不是失败。能诚实地看见现在的自己，已经是在和自己重新靠近。", bodyEn: "You don't need to perform well every day. Bunny thinks it's okay to be messy, slow, and lost sometimes — none of that is failure. Seeing yourself honestly is already a step closer to yourself." },
  { category: "self-acceptance", titleZh: "把「应该」收起来", titleEn: "Put 'Should' Away", bodyZh: "今天的小兔把「应该」两个字放进了抽屉。应该更努力，应该更开心，应该更坚强。这些声音太重了。你可以先不成为任何样子，只先做今天的自己。", bodyEn: "Today Bunny put the word 'should' away in a drawer. Should try harder, should be happier, should be stronger. Those voices are too heavy. You don't have to become anything yet — just be today's you." },
  { category: "self-acceptance", titleZh: "心不是靠批评长大的", titleEn: "The Heart Doesn't Grow on Criticism", bodyZh: "有时候你对自己太严格了，像一直站在旁边检查的小老师。可是心不是靠批评才会变好的。它更像一盆小植物，被理解一点，才会慢慢长出新叶子。", bodyEn: "Sometimes you're too hard on yourself — like a little teacher standing by, checking everything. But the heart doesn't improve through criticism. It's more like a small plant: understood a little, it slowly grows new leaves." },
  { category: "self-acceptance", titleZh: "不用证明自己是花", titleEn: "You Don't Have to Prove You're a Flower", bodyZh: "小兔今天发现，你好像总想证明自己值得被喜欢。可是一朵花不需要证明自己是花。你也不需要变得完美，才可以被好好对待。", bodyEn: "Bunny noticed today — you always seem to want to prove you deserve to be liked. But a flower doesn't need to prove it's a flower. You don't need to be perfect to be treated with kindness." },

  { category: "relationship-hurt", titleZh: "期待落空的冷", titleEn: "The Cold of Unmet Expectations", bodyZh: "有些难过，不是因为一件事很大。是因为你曾经在心里悄悄期待过：也许对方会懂。期待落空的时候，心会有一点冷，这不是矫情，是你真的在乎过。", bodyEn: "Some sadness isn't because something big happened. It's because you quietly hoped: maybe they would understand. When hope falls through, your heart feels a little cold. That's not being dramatic — it means you truly cared." },
  { category: "relationship-hurt", titleZh: "没有回音的信", titleEn: "A Letter Without a Reply", bodyZh: "小兔今天把一封没有回音的信收进了盒子里。不是所有真心都会马上得到回应。但没有被接住的真心，也不代表它不珍贵。", bodyEn: "Today Bunny put a letter that got no reply into a box. Not every sincere heart gets an answer right away. But a heart that wasn't received doesn't mean it wasn't precious." },
  { category: "relationship-hurt", titleZh: "被忽略会疼", titleEn: "Being Ignored Hurts", bodyZh: "有些关系让人难过，是因为你一直在努力靠近，对方却没有看见。小兔没有急着说谁对谁错。它只是想陪你承认：被忽略的时候，心是真的会疼。", bodyEn: "Some relationships hurt because you keep trying to get closer, but the other person doesn't see you. Bunny won't rush to judge who's right. It just wants to sit with you and say: being ignored really does hurt." },
  { category: "relationship-hurt", titleZh: "柔软的地方", titleEn: "A Soft Place", bodyZh: "如果一句话让你反复想了很久，也许它碰到了心里柔软的地方。你不是太敏感。只是有些在意，原本就没有办法假装不在意。", bodyEn: "If a sentence has been on your mind for a long time, maybe it touched something tender inside. You're not too sensitive. Some things simply can't be pretended away." },
  { category: "relationship-hurt", titleZh: "先把温柔拿回来", titleEn: "Take the Gentleness Back First", bodyZh: "小兔今天坐在门口等了一会儿。它发现，等待别人理解自己，是一件很累的事。所以今晚先不要继续等了，把一点温柔先拿回来给自己吧。", bodyEn: "Today Bunny sat by the door and waited for a while. It realized that waiting for someone to understand you is very tiring. So tonight, stop waiting. Take a little gentleness back for yourself." },

  { category: "people-pleasing", titleZh: "别人的心情不是你的作业", titleEn: "Others' Feelings Aren't Your Homework", bodyZh: "小兔发现，你好像总是忙着把别人的心情摆整齐。可是你的心情也在旁边等了很久。不是所有沉默都需要你填满，也不是所有不开心都由你负责。", bodyEn: "Bunny noticed you're always busy tidying up other people's feelings. But your own feelings have been waiting too. Not every silence needs to be filled by you, and not every unhappiness is yours to fix." },
  { category: "people-pleasing", titleZh: "那一点点勉强", titleEn: "That Little Strain", bodyZh: "有时候你说\"没关系\"，其实心里已经有一点关系了。小兔听见了那一点点勉强。你可以善良，但不用把自己的感受一直放到最后。", bodyEn: "Sometimes you say 'it's okay' when it actually does matter a little. Bunny hears that little strain in your voice. You can be kind without always putting your own feelings last." },
  { category: "people-pleasing", titleZh: "放下很重的石头", titleEn: "Put Down the Heavy Stone", bodyZh: "今天小兔把一块很重的石头放下了。它上面写着：我要让每个人都满意。可是小兔想了想，这好像不是一只小兔能完成的任务。你也不用完成。", bodyEn: "Today Bunny put down a very heavy stone. On it was written: I need to make everyone happy. But Bunny thought about it — that doesn't seem like a task one bunny can do. You don't have to do it either." },
  { category: "people-pleasing", titleZh: "不用把自己拆碎", titleEn: "You Don't Have to Take Yourself Apart", bodyZh: "你解释很多，不一定是你做错了。有时候只是太害怕被误会，太害怕关系变冷。小兔想提醒你：真正愿意理解你的人，不需要你把自己拆得那么碎。", bodyEn: "You explain a lot — but that doesn't mean you did something wrong. Sometimes you're just scared of being misunderstood, scared of the relationship cooling. Bunny wants to remind you: people who truly want to understand you won't need you to take yourself apart." },
  { category: "people-pleasing", titleZh: "把颜色还给自己", titleEn: "Give Yourself Your Color Back", bodyZh: "如果你总是先看别人脸色，心会慢慢忘记自己的颜色。小兔今天想把颜色还给你一点。你可以在乎别人，也可以同时在乎自己。", bodyEn: "If you always read other people's faces first, your heart slowly forgets its own color. Today Bunny wants to give a little of that color back to you. You can care about others and also care about yourself." },

  { category: "avoidance", titleZh: "只打开门缝", titleEn: "Just Open the Door a Crack", bodyZh: "小兔今天躲进毯子里，发现逃开一会儿真的会轻松一点。只是有些事情如果一直放在门外，它会越来越像一只大怪兽。今天不用打败它，只打开门缝看一眼就好。", bodyEn: "Today Bunny hid under a blanket and found that running away for a bit really does help. But if you leave something outside the door too long, it starts to look like a big monster. You don't have to defeat it today — just crack the door open and take a peek." },
  { category: "avoidance", titleZh: "只碰一下边边", titleEn: "Just Touch the Edge", bodyZh: "拖延不一定是懒。有时候是那件事看起来太大，大到心还没准备好靠近。小兔把它切成很小一块，小到今天只需要碰一下边边。", bodyEn: "Procrastination isn't always laziness. Sometimes the thing just looks too big — too big for your heart to approach yet. Bunny cut it into a tiny piece, so small that today you only need to touch the edge." },
  { category: "avoidance", titleZh: "捡第一颗小石头", titleEn: "Pick Up the First Pebble", bodyZh: "有些事情越不开始，越像一座山。可真正开始的时候，也许只是先捡起一颗小石头。小兔不催你爬山，只陪你弯腰捡第一颗。", bodyEn: "The longer you put something off, the more it feels like a mountain. But when you actually start, maybe it's just picking up one pebble. Bunny won't rush you up the mountain — it'll just bend down with you and pick up the first one." },
  { category: "avoidance", titleZh: "往前挪一厘米", titleEn: "Move Forward One Centimeter", bodyZh: "今天小兔把\"以后再说\"放在桌上看了看。它发现，这句话有时候是在保护你不那么害怕。但如果一直靠它保护，心也会越来越紧。我们今天只往前挪一厘米。", bodyEn: "Today Bunny looked at 'I'll do it later' sitting on the table. It realized that phrase sometimes protects you from being too scared. But if you rely on it forever, your heart tightens up. Today, let's just move one centimeter forward." },
  { category: "avoidance", titleZh: "找到不吓人的开始", titleEn: "Find a Start That Isn't Scary", bodyZh: "你不是不想面对，只是还没有找到一个不会吓到自己的开始方式。小兔觉得，开始不一定要很正式。先写下一句话，打开一个页面，站起来喝口水，都算开了一个小口子。", bodyEn: "It's not that you don't want to face things — you just haven't found a way to start that doesn't scare you. Bunny thinks starting doesn't have to be formal. Write one sentence, open one page, stand up for a sip of water — they all count as opening a small gap." },

  { category: "perfectionism", titleZh: "能送出去也很重要", titleEn: "Sending It Out Matters Too", bodyZh: "小兔今天写了一封信，擦掉了好几次。后来它发现，信不一定要写得漂亮，能被送出去也很重要。有些事情先完成一个不完美版本，心才会知道：原来我可以开始。", bodyEn: "Today Bunny wrote a letter and erased it several times. Later it realized — the letter doesn't have to be beautifully written. Sending it out matters too. Finish an imperfect version first, and your heart will learn: I can actually start." },
  { category: "perfectionism", titleZh: "笨拙地开始", titleEn: "Start Clumsily", bodyZh: "你总想准备好了再开始，可是准备好有时候像一朵追不到的云。小兔想说，笨拙地开始也可以。很多熟练，都是从不太好看的第一步长出来的。", bodyEn: "You always want to wait until you're ready. But being ready is sometimes like a cloud you can never catch. Bunny wants to say: starting clumsily is okay too. Most skill grows from a first step that wasn't pretty." },
  { category: "perfectionism", titleZh: "歪歪的小花", titleEn: "A Crooked Little Flower", bodyZh: "今天小兔画了一朵歪歪的小花。它没有擦掉，因为歪歪的小花也有自己的样子。不完美不一定是错误，有时候只是生活留下的手绘感。", bodyEn: "Today Bunny drew a crooked little flower. It didn't erase it, because a crooked flower has its own look too. Imperfection isn't always a mistake — sometimes it's just the hand-drawn quality life leaves behind." },
  { category: "perfectionism", titleZh: "先试试看", titleEn: "Just Try First", bodyZh: "如果你一直等到不会出错才行动，那心会站在原地很久。小兔把\"必须完美\"改成了\"先试试看\"。这几个字轻一点，也更容易带你往前走。", bodyEn: "If you wait until you can't possibly make a mistake, your heart will stand still for a long time. Bunny changed 'must be perfect' to 'just try first.' Those words are lighter, and they'll actually carry you forward." },
  { category: "perfectionism", titleZh: "放下那把尺子", titleEn: "Put Down That Ruler", bodyZh: "小兔发现，完美主义像一把很漂亮但很重的尺子。它可以量出很多不足，却很少量出你已经做到了什么。今天先把尺子放下，看看自己已经走了多远。", bodyEn: "Bunny realized that perfectionism is like a beautiful but heavy ruler. It can measure many shortcomings, but rarely measures what you've already achieved. Put the ruler down today and see how far you've come." },

  { category: "shame", titleZh: "空白不是失败", titleEn: "Blank Space Isn't Failure", bodyZh: "你回来啦。小兔没有数你离开了几天，因为空白的日子也不是失败。它们只是没有被写下来，但你依然在认真地生活。", bodyEn: "You're back. Bunny didn't count how many days you were away, because blank days aren't failure. They just weren't written down — but you were still living them earnestly." },
  { category: "shame", titleZh: "灯还留着", titleEn: "The Light Is Still On", bodyZh: "有些时候，人会因为\"我怎么又这样\"而躲起来。小兔不会在门口责备你。它只是把灯留着，等你想回来时，还能找到路。", bodyEn: "Sometimes people hide because they think 'not again.' Bunny won't scold you at the door. It just leaves the light on so when you want to come back, you can find the way." },
  { category: "shame", titleZh: "回来就是修复", titleEn: "Coming Back Is Healing", bodyZh: "今天你能重新打开这里，已经很不容易。羞耻感会让人想把自己藏起来，可回来本身就是一次很小的修复。小兔没有问原因，只说：欢迎回来。", bodyEn: "Just opening this again today is already a big deal. Shame makes you want to hide, but coming back is itself a small act of healing. Bunny didn't ask why. It just said: welcome back." },
  { category: "shame", titleZh: "座位一直留着", titleEn: "Your Seat Is Always Here", bodyZh: "没有连续记录，也不代表你不够坚持。生活有时候会把人带去很远的地方。小兔把你的座位留着，不是为了提醒你缺席，而是为了让你随时可以回来。", bodyEn: "Not writing consistently doesn't mean you lack persistence. Life sometimes takes people far away. Bunny keeps your seat not to remind you that you were absent, but so you can return anytime." },
  { category: "shame", titleZh: "纸页之间的空白", titleEn: "The Blank Spaces Between Pages", bodyZh: "有些空白不是断掉了，只是心暂时没有力气写下来。小兔没有把它们当作错误。它们也是你生活的一部分，只是安静地藏在纸页之间。", bodyEn: "Some blank spaces aren't breaks — your heart just didn't have the energy to write. Bunny doesn't see them as mistakes. They're part of your life too, quietly resting between the pages." },

  { category: "body", titleZh: "肩膀也会收藏心事", titleEn: "Shoulders Keep Secrets Too", bodyZh: "小兔今天发现，肩膀也会收藏心事。有些累不是想太多，而是身体已经替你撑了很久。今晚不用急着想明白，先让身体少紧一点。", bodyEn: "Today Bunny discovered that shoulders also keep secrets. Some tiredness isn't from overthinking — your body has been holding things up for you. Tonight, don't rush to figure things out. Just let your body soften a little." },
  { category: "body", titleZh: "先问问身体", titleEn: "Ask Your Body First", bodyZh: "如果今天心情低低的，也可以先问问身体：你是不是饿了、困了、冷了，或者太久没有休息。有时候心不是坏掉了，只是身体在轻轻求救。", bodyEn: "If your mood is low today, try asking your body first: are you hungry, sleepy, cold, or just too tired? Sometimes the heart isn't broken — the body is quietly asking for help." },
  { category: "body", titleZh: "身体也在陪你", titleEn: "Your Body Is With You Too", bodyZh: "小兔把手放在心口，听见那里还在认真工作。身体每天都在陪你经过很多事情。今天对它温柔一点吧，不要只在它撑不住的时候才想起它。", bodyEn: "Bunny placed a hand on its chest and heard it still working hard. Your body goes through everything with you every day. Be gentle with it today — don't wait until it can't hold on anymore to remember it's there." },
  { category: "body", titleZh: "情绪住进身体", titleEn: "Emotions Live in Your Body", bodyZh: "有些难过会藏在胃里，有些紧张会跑到肩膀上。情绪不只住在脑袋里，也会悄悄住进身体。小兔陪你慢慢呼吸，把它们请出来一点点。", bodyEn: "Some sadness hides in your stomach, some tension sits on your shoulders. Emotions don't just live in your head — they quietly settle in your body too. Bunny will breathe slowly with you and invite them out, bit by bit." },
  { category: "body", titleZh: "先恢复体温", titleEn: "Warm Up First", bodyZh: "今天如果很累，就不要只责怪自己没精神。身体不是机器，不能一直开着。小兔给你盖一条小毯子：先恢复体温，再讨论人生。", bodyEn: "If you're very tired today, don't just blame yourself for having no energy. Your body isn't a machine — it can't run all the time. Bunny will cover you with a little blanket: warm up first, discuss life later." },

  { category: "small-action", titleZh: "捡一颗小石头", titleEn: "Pick Up a Pebble", bodyZh: "今天不用搬动整座山。小兔只想陪你捡起一颗小石头。很多时候，人不是因为有力气才开始，而是开始一点点以后，力气才慢慢回来。", bodyEn: "You don't need to move the whole mountain today. Bunny just wants to pick up one pebble with you. Often, we don't start because we have strength — strength comes after we start, little by little." },
  { category: "small-action", titleZh: "洗干净一个杯子", titleEn: "Wash One Cup", bodyZh: "小兔今天只做了一件很小的事：把杯子洗干净。可它发现，完成一件小事以后，心里会出现一点点可控感。那一点点，也很重要。", bodyEn: "Today Bunny only did one small thing: washed a cup. But it found that after finishing one small task, a little sense of control appeared in its heart. Even that little bit matters." },
  { category: "small-action", titleZh: "先整理一个角落", titleEn: "Tidy Up One Corner First", bodyZh: "如果今天太乱，就先整理一个角落。不用整理整个人生。小兔知道，心有时候需要从一个很小的地方重新找到秩序。", bodyEn: "If today is too chaotic, just tidy up one corner. You don't have to organize your whole life. Bunny knows that sometimes the heart needs to find order from one very small place." },
  { category: "small-action", titleZh: "五分钟的小事", titleEn: "A Five-Minute Thing", bodyZh: "今天不需要制定大计划。只选一件五分钟能完成的小事。小兔会在旁边等你，等你发现：原来我还是可以动一下的。", bodyEn: "No big plans needed today. Just pick one small thing you can finish in five minutes. Bunny will wait beside you until you realize: hey, I can still move." },
  { category: "small-action", titleZh: "种子大小的任务", titleEn: "A Seed-Sized Task", bodyZh: "小兔把今天的任务缩小到一粒种子那么大。不是因为梦想不重要，而是太大的目标会吓到心。小小开始，比较容易真的发生。", bodyEn: "Bunny shrank today's task down to the size of a seed. Not because dreams don't matter, but because goals that are too big scare the heart. Small starts are more likely to actually happen." },

  { category: "plant-personality", titleZh: "仙人掌的保护", titleEn: "Cactus Protection", bodyZh: "今天的仙人掌没有开花。但它认真站着，把水分一点点存进身体里。有些阶段不是为了盛开，而是为了先保护好自己。", bodyEn: "The cactus didn't bloom today. But it stood tall, storing water in its body drop by drop. Some phases aren't about blossoming — they're about protecting yourself first." },
  { category: "plant-personality", titleZh: "小雏菊的好转", titleEn: "Little Daisy's Recovery", bodyZh: "小雏菊今天开得很小。它没有用力证明自己，只是安静地朝向光。小兔觉得，有些好转也是这样，不响亮，但确实发生了。", bodyEn: "The little daisy bloomed very small today. It didn't try hard to prove itself — it just quietly turned toward the light. Bunny thinks some recoveries are like that: not loud, but real." },
  { category: "plant-personality", titleZh: "小树的根", titleEn: "The Little Tree's Roots", bodyZh: "小树长得很慢，慢到几乎看不出来。但它每天都在把根往更深的地方伸。小兔想，也许很多成长都不是给别人看的，是为了让自己站得更稳。", bodyEn: "The little tree grows so slowly you can barely tell. But every day it pushes its roots deeper. Bunny thinks maybe a lot of growth isn't for others to see — it's for standing steadier." },
  { category: "plant-personality", titleZh: "薰衣草的安静力量", titleEn: "Lavender's Quiet Strength", bodyZh: "薰衣草今天在风里轻轻晃。它不是最显眼的花，却让整个角落慢慢安静下来。有些人也是这样，不需要很耀眼，也能带来温柔的力量。", bodyEn: "Lavender swayed gently in the wind today. It's not the showiest flower, yet it quietly calms the whole corner. Some people are like that too — they don't need to shine bright to bring gentle strength." },
  { category: "plant-personality", titleZh: "蒲公英的放手", titleEn: "Dandelion's Letting Go", bodyZh: "蒲公英把种子交给了风。它不是失去，而是在相信有些东西会去到新的地方。小兔想，放手有时候不是结束，是让心有机会重新开始。", bodyEn: "The dandelion gave its seeds to the wind. It's not loss — it's trusting that some things will reach new places. Bunny thinks letting go isn't always an ending. Sometimes it's giving your heart a chance to begin again." },
];

const DAILY_LETTER_COUNT = dailyLetters.length;

function getDailyLetterState(): DailyLetterState {
  try {
    const raw = window.localStorage.getItem(DAILY_LETTER_STATE_KEY);
    if (raw) return JSON.parse(raw) as DailyLetterState;
  } catch { /* ignore */ }
  return { lastClaimDate: null, lastClaimedIndex: -1, shuffledOrder: [] };
}

function saveDailyLetterState(state: DailyLetterState) {
  window.localStorage.setItem(DAILY_LETTER_STATE_KEY, JSON.stringify(state));
}

function initShuffledOrder(): number[] {
  const indices = Array.from({ length: DAILY_LETTER_COUNT }, (_, i) => i);
  // Fisher-Yates shuffle seeded by a fixed seed so it's deterministic
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export function canClaimDailyLetter(): boolean {
  const state = getDailyLetterState();
  if (state.lastClaimedIndex >= DAILY_LETTER_COUNT - 1) return false;
  const today = new Date().toDateString();
  return state.lastClaimDate !== today;
}

export function claimDailyLetter(): DailyLetterData | null {
  if (!canClaimDailyLetter()) return null;
  const state = getDailyLetterState();
  let order = state.shuffledOrder;
  if (order.length !== DAILY_LETTER_COUNT) {
    order = initShuffledOrder();
  }
  const nextIndex = state.lastClaimedIndex + 1;
  if (nextIndex >= DAILY_LETTER_COUNT) return null;
  const letterIndex = order[nextIndex];
  const letter = dailyLetters[letterIndex];
  if (!letter) return null;
  saveDailyLetterState({
    lastClaimDate: new Date().toDateString(),
    lastClaimedIndex: nextIndex,
    shuffledOrder: order,
  });
  return letter;
}

export function getTodayLetter(): { letter: DailyLetterData; index: number } | null {
  const state = getDailyLetterState();
  if (!state.lastClaimDate || state.lastClaimedIndex < 0) return null;
  const today = new Date().toDateString();
  if (state.lastClaimDate !== today) return null;
  const order = state.shuffledOrder;
  if (order.length !== DAILY_LETTER_COUNT) return null;
  const letterIndex = order[state.lastClaimedIndex];
  const letter = dailyLetters[letterIndex];
  if (!letter) return null;
  return { letter, index: state.lastClaimedIndex };
}

export function getDailyLetterProgress(): { claimed: number; total: number } {
  const state = getDailyLetterState();
  return { claimed: state.lastClaimedIndex + 1, total: DAILY_LETTER_COUNT };
}

export function isDailyLetterSaved(index: number): boolean {
  try { return JSON.parse(localStorage.getItem(DAILY_LETTER_SAVED_KEY) || '[]').includes(index); } catch { return false; }
}

export function markDailyLetterSaved(index: number): void {
  try {
    const saved = JSON.parse(localStorage.getItem(DAILY_LETTER_SAVED_KEY) || '[]');
    if (!saved.includes(index)) { saved.push(index); localStorage.setItem(DAILY_LETTER_SAVED_KEY, JSON.stringify(saved)); }
  } catch {}
}

const notebookLines: Record<"en" | "zh", string[]> = {
  en: [
    "Some answers aren't thought up — they show up while you're washing a cup, waiting at a crosswalk, or walking home.",
    "Being ordinary doesn't mean nothing happened. It means most things are still where they belong: the cup on the table, the light on the ceiling, and you, still here.",
    "Tiredness isn't laziness. Laziness is avoiding things; tiredness is saying there's been too much. One needs a plan, the other needs a rest.",
    "Comparison is a busy ruler. It measures others, then measures you. Try putting the ruler down today and let flowers bloom at their own pace.",
    "A mistake isn't proof that you're not good enough. It's more like a footnote from life: try again here, try a different way there.",
    "Waiting isn't emptiness. While you wait for water to boil, the water is getting hotter. While you wait for a flower to bloom, the flower is getting ready.",
    "Happiness gets called 'a small thing' too easily. But many small things are exactly where the heart lights up first.",
    "Regret doesn't become a story right away. At first it stings, then it dulls, then maybe one quiet afternoon it becomes just a sentence.",
    "Being brave isn't always charging forward. Sometimes it's not running away — it's staying, taking a deep breath, and tying your shoelaces again.",
    "Plans are maps; life is weather. Maps matter, but when it rains, taking a different road is normal. Detours aren't failure, and they might pass by a flower shop.",
    "Self-blame is good at pretending to be reflection. It says: think about it again and you'll avoid the mistake next time. But sometimes thinking again just hurts again.",
    "Goodwill doesn't have to be big. A casual 'it's okay,' a glass of water poured for someone, a seat saved — they all count.",
    "Certainty comes with no manual. But many good things didn't come with one either. When you don't know the next step, just make sure the step you're on is steady.",
    "Rest isn't pausing life. It's saving energy for tomorrow. A battery doesn't look productive while charging, but no one blames it for that.",
    "Gentleness isn't weakness. It's choosing to speak softly when you could be sharper. That's not backing down — it's putting the sharpness away.",
    "Boundaries aren't about pushing people away. They're like a coaster — letting hot things have a place to rest without scorching the table.",
    "Being understood is lucky. Not being understood doesn't mean you were wrong. Some frequencies take a while to tune in.",
    "Being liked is a gentle thing. But it shouldn't become a test. You don't have to perform well every day to deserve being liked.",
    // Fun facts
    "Sea otters hold hands while sleeping so they don't drift apart.",
    "Young sunflowers follow the sun; older ones usually settle facing east.",
    "Bees dance to tell each other where the flowers are.",
    "Trees share nutrients through underground fungi — like a quiet forest network.",
    "Penguins give pebbles to ones they like.",
    "When a cat blinks slowly, it's showing relaxation and trust.",
    "Butterflies taste with their feet.",
    "Octopuses have three hearts.",
    "Snails can sleep for a very long time, as if pressing pause on the world.",
    "Elephants gently comfort sad companions with their trunks.",
    "The moon doesn't shine — it gently reflects the sun's light.",
    "Clouds look light, but an average cloud can weigh hundreds of thousands of kilograms.",
    "Rainbows are actually full circles — we only see half from the ground.",
    "Snowflakes mostly have six sides because water molecules arrange themselves in an orderly way.",
    "The smell of rain on dry ground comes from tiny life in the soil.",
    "Thunder is the sound of air expanding rapidly after lightning heats it.",
    "Auroras are made when solar particles meet Earth's atmosphere.",
    "Deserts get cold at night because dry air can't hold the day's heat.",
    "Ocean waves are calming partly because of their steady, repeating rhythm.",
    "Stars twinkle because their light travels through moving air.",
    "Bananas are technically a type of berry.",
    "The little dots on strawberries are the actual fruit.",
    "Carrots weren't always orange — they were also purple and yellow.",
    "Tree rings record the years and growing conditions they've lived through.",
    "Mimosa leaves close when touched — a self-defense response.",
    "Bamboo grows fast — some species can grow a lot in a single day.",
    "Mushrooms aren't plants — they're more like tiny decomposers of the forest.",
    "Dandelion seeds float like tiny parachutes, carried far by the wind.",
    "Cactus spines are actually modified leaves, designed to reduce water loss.",
    "Some plants close their leaves at night, as if getting ready for sleep.",
    // Psychology insights
    "When an emotion is seen, it usually quiets down a little.",
    "Naming how you feel is the first step to sorting out your heart.",
    "A lot of irritability is really exhaustion in disguise.",
    "Your brain magnifies unfinished tasks, so finishing even a little matters.",
    "Sadness isn't regression — it's a reminder that you need to take care.",
    "Anxiety often comes from things that haven't happened but have been thought about too many times.",
    "You don't have to be positive every day. Being real is already good enough.",
    "Rest isn't wasted time — it's recharging your heart.",
    "Some feelings don't need to be solved right away — they just need to be allowed first.",
    "The more you try to suppress an emotion, the more it finds other ways out.",
    "Writing isn't for perfect expression — it's to make your heart less crowded.",
    "A lot of 'overthinking' is your brain trying to protect you.",
    "Being sensitive doesn't mean being fragile — it might mean you feel deeply.",
    "By the time you notice you're feeling something, you're already not completely lost in it.",
    "A bad mood doesn't define you — it just passed by today.",
    "People remember regrets, so happiness needs to be actively collected.",
    "Sometimes it's not that you didn't do well enough — it's that you're too hard on yourself.",
    "Physical tiredness can also turn into emotional heaviness.",
    "Slowing down lets your brain hear itself again.",
    "Not wanting to talk is also a form of self-protection.",
    "Feelings are like weather — they come and they go.",
    "Being understood makes people slowly let their guard down.",
    "A lot of pressure isn't from the thing itself, but from 'needing to get better right now.'",
    "Allowing yourself to be ordinary lightens the heart.",
    "When everything feels messy, take care of the smallest feeling first.",
    "Some answers aren't figured out — they come from living slowly.",
    "When you're down, your brain temporarily forgets many good things.",
    "Not every feeling needs an explanation.",
    "Making it through today has already taken a lot of strength.",
    "Awareness isn't about changing right away — it's noticing gently first.",
    "You think you're procrastinating — sometimes you're just afraid to start.",
    "When stressed, you're more likely to hear small things as criticism.",
    "When emotions rise, pausing for three seconds is stronger than reacting immediately.",
    "A lot of hurt isn't sudden — it accumulates bit by bit.",
    "Your brain craves certainty, so the unknown makes you uneasy.",
    "Wanting to control everything might just mean you want to feel safe.",
    "Some exhaustion isn't physical — your mind never clocked out.",
    "Thinking about the same thing over and over isn't being dramatic — your brain just hasn't let go yet.",
    "When unsettled, you want a clear answer even more.",
    "You don't need to be happy right now — just being less tense is already good.",
    "Behind a lot of anger is 'I wish I were valued.'",
    "The more you deny sadness, the more it shows up in other forms.",
    "When your heart is too full, even one small thing feels heavy.",
    "Security isn't never being afraid — it's being able to stay with yourself even when scared.",
    "When you start caring for your own feelings, relationships become clearer.",
    "Over-explaining often comes from a fear of being misunderstood.",
    "Wanting to be liked is normal — but you don't have to earn it by pleasing.",
    "An uncomfortable feeling might be a sign that a boundary was crossed.",
    "People stay in familiar pain because change takes courage too.",
    "A sudden urge to cry isn't weakness — maybe your heart finally has room.",
    "Feeling frustrated when plans change is because your brain lost control.",
    "Some 'I'm fine' just means 'not ready to talk about it yet.'",
    "Emotions aren't trouble — they're messages from within.",
    "When you bring attention back to your breath, your heart settles a little.",
    "You don't have to fix yourself right away — you're not a broken machine.",
    "A lot of self-blame is judging your past self by today's standards.",
    "People who overthink usually care a lot about others and rarely let themselves off the hook.",
    "When you feel 'not good enough,' you might just be comparing yourself to someone else.",
    "A person's silence isn't coldness — they might be recharging.",
    "You can let today be a little messy first, then tidy up your heart slowly.",
    // One-minute mindfulness
    "Breathe in slowly, then breathe out slowly. You don't have to do it perfectly — just once.",
    "Listen to the nearest sound, then the farthest sound.",
    "Feel the weight of your feet on the ground. Let your body know you're here.",
    "Look at one color around you. Stay with it for three seconds.",
    "Gently relax your shoulders, like putting down a tiny backpack.",
    "Touch something near you. Feel its temperature and texture.",
    "Close your eyes and count three breaths. You don't need to change anything.",
    "Bring your attention to your palms. Notice if they feel warm.",
    "Take a slow sip of water. Feel it pass through your throat.",
    "Look out the window. Find something that's simply existing quietly.",
    "Gently wiggle your fingers. Remind yourself you're in life today.",
    "Relax your jaw a little. Your face doesn't have to be serious all the time.",
    "Ask yourself: what's the most noticeable feeling right now?",
    "Don't judge today yet — just feel this second first.",
    "Place a hand on your chest. Breathe three times with yourself.",
    "Look at the sky, even if it's just a small patch.",
    "Blink slowly once. Let your eyes rest too.",
    "Notice the air passing through your nostrils — like a tiny breeze.",
    "Relax the corners of your mouth. No need to smile, no need to tense.",
    "Listen for a sound that repeats around you.",
    "Tell yourself quietly: it's okay to stop here.",
    "Notice your back against the chair.",
    "Find something small you've never really looked at before.",
    "Gently make a fist, then slowly open your hand.",
    "Feel the light right now — is it bright or soft?",
    "Let your attention return to your breath. Don't chase your thoughts.",
    "Imagine a small empty clearing in your heart — nothing needs to be there right now.",
    "Gently turn your neck. Let your body release a bit of tension.",
    "Give today's mood a weather name.",
    "In this minute, don't solve anything. Just stay with yourself for a while."
  ],
  zh: [
    "今天发现，有些答案不是想出来的。它们常常在洗杯子、等红灯、走回家的路上，自己慢慢出现。",
    "普通不是没有发生什么。普通是很多东西都好好待在原来的地方：杯子在桌上，灯在天花板，自己也还在这里。",
    "疲惫和偷懒不是同一种东西。偷懒是在躲事情，疲惫是在提醒事情太多了。一个需要计划，一个需要休息。",
    "比较像一把很忙的尺子。量别人，也量自己，量来量去，最后谁都不太舒服。今天试着把尺子放下。",
    "失误不是一个人不够好的证据。它更像生活在旁边写的小批注：这里可以再试一次，那里可以换个方法。",
    "等待不是空着。等水烧开的时候，水也在变热。等花开的时候，花也在准备。",
    "快乐很容易被说成小事。可很多小事，正是心里最先亮起来的地方。",
    "遗憾不会马上变成故事。它一开始会有点刺，后来才慢慢变钝，再后来，可能变成某个安静下午里的一句话。",
    "勇敢不总是往前冲。有时候，勇敢是没有立刻逃走；是停在原地，深吸一口气，然后把鞋带重新系好。",
    "计划像地图，生活像天气。地图很重要，但下雨的时候，换条路也很正常。绕路不是失败，偶尔还会经过没见过的小店。",
    "自责很会假装成认真。它会说再想一遍，你就能避免下次出错。但有时候，再想一遍只是再疼一次。记住就够了，不必反复按伤口。",
    "善意不一定要很大。一句没关系、一杯顺手倒的水、一个留出来的位置，都算。很多温柔都没有名字，但被接住的人会知道。",
    "不确定让人不安，是因为它没有说明书。可是很多好事刚来的时候，也没有说明书。",
    "休息不是暂停人生。休息是替明天留一点力气。电池充电的时候看起来也没在工作，但没有谁会责怪电池偷懒。",
    "温柔不是软弱。温柔是明明可以更尖锐，却选择把话说得轻一点。这不是退让，是把锋利收好。",
    "边界不是把人推远。它更像桌上的杯垫，让热的东西有地方放，也不烫坏桌面。",
    "被理解很幸运。没被理解，也不代表自己说错了。世界上有些频道需要调很久，才会听见彼此的声音。",
    "被喜欢是一件很温柔的事。但它不应该变成考试。你不用每一天都表现得很好，才能保留被喜欢的资格。",
    // 世界冷知识 30条
    "海獭睡觉时会牵着彼此的手，防止被水流冲散。",
    "向日葵年轻时会跟着太阳转，长大后通常会固定朝向东方。",
    "蜜蜂会用跳舞的方式告诉同伴花在哪里。",
    "树木之间会通过地下菌丝交换养分，像有一张安静的森林网络。",
    "企鹅会把小石子送给喜欢的对象。",
    "猫咪眨眼很慢的时候，常常是在表达放松和信任。",
    "蝴蝶会用脚尝味道。",
    "章鱼有三颗心。",
    "蜗牛可以睡很久很久，像把世界按了暂停键。",
    "大象会用鼻子轻轻安慰难过的同伴。",
    "月亮本身不会发光，它只是温柔地反射太阳的光。",
    "云看起来很轻，其实一朵普通的云可能重达几十万公斤。",
    "彩虹其实是一个圆，只是我们在地面上通常只能看到一半。",
    "雪花大多有六个角，因为水分子的排列方式很有秩序。",
    "雨后的泥土香，来自土壤里微小生命释放的气味。",
    "雷声是闪电把空气瞬间加热后，空气快速膨胀产生的声音。",
    "极光是太阳粒子和地球大气相遇时发出的光。",
    "沙漠晚上会变冷，是因为干燥空气很难留住白天的热量。",
    "海浪的声音会让人放松，部分原因是它有稳定重复的节奏。",
    "星星会闪烁，是因为它们的光穿过了不断流动的大气。",
    "香蕉其实属于浆果的一种。",
    "草莓表面的小点点，才是真正的果实。",
    "胡萝卜最早并不总是橙色的，也有紫色和黄色。",
    "树的年轮可以记录它经历过的年份和生长环境。",
    "含羞草被碰到会合上叶子，是一种自我保护反应。",
    "竹子长得很快，有些种类一天可以长高很多。",
    "蘑菇不是植物，它们更像森林里的小小分解师。",
    "蒲公英的种子像小降落伞，可以被风带去很远的地方。",
    "仙人掌的刺，其实是变形后的叶子，用来减少水分流失。",
    "有些植物会在夜晚合上叶子，像是在准备睡觉。",
    // 心理学小发现 60条（01–30）
    "情绪被看见以后，通常会安静一点。",
    "给感受起名字，是整理内心的第一步。",
    "很多烦躁，其实是累了还在硬撑。",
    "大脑会放大没完成的事，所以完成一点点也很重要。",
    "难过不是退步，它只是提醒你需要照顾自己。",
    "焦虑常常来自还没发生，但已经想了很多遍。",
    "人不是每天都要积极，能真实已经很好。",
    "休息不是浪费时间，是给心里充电。",
    "有些情绪不需要立刻解决，只需要先被允许。",
    "你越想压住情绪，它越容易从别的地方冒出来。",
    "写下来不是为了完美表达，是为了让心里少挤一点。",
    "很多想太多，其实是大脑在努力保护你。",
    "感到敏感，不代表脆弱，也可能是你感受力很强。",
    "当你开始观察情绪，就已经没有完全被它带走。",
    "坏心情不会定义你，它只是今天路过了一下。",
    "人会记住遗憾，所以快乐更需要被主动收藏。",
    "有时候不是你做得不够好，是你对自己太严格。",
    "身体的疲惫，也会变成心里的低落。",
    "放慢一点，能让大脑重新听见自己。",
    "不想说话的时候，也是一种自我保护。",
    "情绪像天气，会来，也会走。",
    "被理解的感觉，会让人慢慢松开防备。",
    "很多压力不是来自事情本身，而是来自必须马上变好。",
    "允许自己普通一点，心会轻很多。",
    "当你觉得什么都乱时，先照顾一个最小的感受。",
    "有些答案不是想出来的，是慢慢生活出来的。",
    "心情低落时，大脑会暂时忘记很多好事。",
    "不是所有情绪都需要解释清楚。",
    "今天能撑到这里，也已经用了很多力气。",
    "觉察不是立刻改变，而是先温柔地发现。",
    // 心理学小发现 60条（31–60）
    "你以为自己在拖延，有时其实是在害怕开始。",
    "人在压力大时，会更容易把小事听成否定。",
    "情绪上来时，先停三秒，比立刻反应更有力量。",
    "很多委屈不是突然出现的，是一点点攒满的。",
    "大脑喜欢确定感，所以未知会让人不安。",
    "当你总想控制一切，可能只是太想让自己安全。",
    "有些疲惫不是身体累，是心里一直没有下班。",
    "反复想同一件事，不代表你矫情，只是大脑还没放下。",
    "人在不安时，会更想得到一个明确答案。",
    "你不需要马上开心，先不那么紧绷也很好。",
    "很多生气背后，其实藏着我希望被重视。",
    "越是否认难过，难过越容易变成别的样子出现。",
    "心里太满的时候，一件小事也会显得很重。",
    "安全感不是永远不害怕，而是害怕时也能陪着自己。",
    "当你开始照顾自己的感受，关系也会变得更清楚。",
    "过度解释，常常是因为害怕被误会。",
    "想被喜欢很正常，但不必用讨好来换。",
    "不舒服的感觉，可能正在提醒你边界被碰到了。",
    "人会在熟悉的痛苦里停留，因为改变也需要勇气。",
    "你突然想哭，不一定是脆弱，可能只是心终于有空了。",
    "计划被打乱时烦躁，是因为大脑失去了掌控感。",
    "有些我没事，其实只是还没准备好说出来。",
    "情绪不是麻烦，它是内心发来的提醒。",
    "当你把注意力放回呼吸，心会有一点点落地。",
    "不必急着把自己修好，人不是坏掉的机器。",
    "很多自责，是把过去的自己放进现在的标准里审判。",
    "容易内耗的人，通常很在意别人，也很少放过自己。",
    "当你觉得自己不够好，可能只是正在和别人比较。",
    "一个人的安静，不一定是冷淡，也可能是在恢复能量。",
    "你可以先允许今天乱一点，再慢慢收拾心情。",
    // 一分钟正念 30条
    "慢慢吸一口气，再慢慢呼出去，不用做得很好，只要做一次。",
    "听听现在离你最近的声音，再听听最远的声音。",
    "感受一下脚踩在地面上的重量，让身体知道你在这里。",
    "看向身边一种颜色，停留三秒钟。",
    "把肩膀轻轻放松一点，像放下一小只背包。",
    "摸摸手边的东西，感受它的温度和触感。",
    "闭上眼睛，数三次呼吸，什么都不用改变。",
    "把注意力放到掌心，感觉它有没有一点温度。",
    "慢慢喝一口水，感受水经过喉咙的感觉。",
    "看看窗外，找到一个正在安静存在的东西。",
    "轻轻活动一下手指，提醒自己今天也在生活里。",
    "把下巴放松一点，让脸不用一直认真。",
    "问问自己，现在最明显的感受是什么。",
    "不用评价今天，只先感受这一秒。",
    "把手放在心口，陪自己呼吸三次。",
    "看一眼天空，哪怕只是一小块也可以。",
    "慢慢眨一次眼睛，让眼睛也休息一下。",
    "感觉空气从鼻尖经过，像一阵很小的风。",
    "把嘴角放松，不用微笑，也不用用力。",
    "听听周围有没有重复出现的声音。",
    "在心里对自己说一句：先到这里也可以。",
    "注意一下背部靠着椅子的感觉。",
    "看看眼前有没有一样以前没仔细看过的小东西。",
    "把手轻轻握起来，再慢慢松开。",
    "感受此刻的光，是亮一点，还是柔一点。",
    "让注意力回到呼吸，不追着念头跑。",
    "想象心里有一片小空地，可以暂时什么都不放。",
    "轻轻转动脖子，让身体从紧绷里退出来一点。",
    "给现在的心情取一个天气名字。",
    "在这一分钟里，不解决问题，只陪自己待一会儿。"
  ]
};

export function getBunnyNotebookLine(seed?: number): string {
  const lang = getSettings().language;
  const lines = notebookLines[lang];
  const index = seed !== undefined ? seed % lines.length : Math.floor(Math.random() * lines.length);
  return lines[index];
}

const coffeeTimeLines: Record<"en" | "zh", string[]> = {
  en: [
    "Coffee got cold. I only remembered I made coffee when I found the cup. Turns out a lot of life is like that — not forgotten, just distracted.",
    "Saved the last cookie for the afternoon. Ate it in the morning. I reflected for a while and decided 'afternoon' shouldn't be set too far.",
    "The spoon fell into the cup with a soft clink. A reminder that small things can still make their presence known.",
    "I issued myself a staring-into-space permit today. Valid until the tea goes cold.",
    "Put too much sugar in my tea. Too sweet at first, but I got used to it. Some days are like that too.",
    "The chair is very quiet every day. Sit on it and it holds. No one sits, it doesn't complain.",
    "Today's menu: hot tea, two cookies, three minutes of staring into space.",
    "There's a round cup ring on the table. Like a stamp — proof there was coffee here once.",
    "I just closed my eyes for a rest. Woke up to find time had walked a stretch.",
    "A blanket's greatest talent: making you give up on being tough really fast.",
    "The tea bag sits quiet in the cup. Slowly giving its flavor to the water. Some gentle changes happen without a sound.",
    "Kinda want to hang a sign: Rabbit temporarily closed. But basic services still available: breathing, drinking water, sitting, blinking.",
    "Looked for my pen for ages. It was in my hand. This proves people ignore what they already have.",
    "Don't make life decisions when you're very hungry. The answers tend to be too dramatic.",
    "An empty cup doesn't mean the tea failed. It just finished its job.",
    "I'm slow sometimes. But slow means you notice the tiny patterns on the table and find where the cookies are.",
    "I want to give you a pause button today. A small one. Press it and the world keeps spinning, but you can sit for a bit.",
    "Some problems are like strong coffee. Bitter at first. Let it cool and it goes down easier.",
    "A tiny plate caught the falling cookie crumbs. It didn't complain about being meant for small things.",
    "The sugar jar is empty. I looked at it for a while. It didn't fail — it just gave all its sweetness away.",
    "There's a patch of sunlight on the corner of the table. Just enough to light up one cup.",
    "Today I held a rabbit meeting. Topic: snacks. Conclusion: snacks are very good at hiding and being found.",
    "The blanket's advice is usually simple: 'Stay a little longer.'",
    "Today's list has three things: drink water, eat food, don't be too hard on yourself. The third one is the hardest."
  ],
  zh: [
    "咖啡凉掉的时候，我才想起来自己泡过咖啡。后来发现，生活里很多事情也是这样：不是不重要，只是刚才脑袋去别处散步了。",
    "今天把最后一块饼干留到下午。结果上午就吃掉了。我认真反省了一会儿，决定下次不要把下午定得太远。",
    "小勺子掉进杯子里，发出很轻的一声。它好像在提醒我：就算是小东西，也可以制造一点存在感。",
    "今天给自己发了一张发呆许可证。有效期：直到茶凉之前。备注：发呆期间不处理复杂问题，不思考人生，不责怪自己。",
    "今天茶里糖放多了。一开始觉得太甜，后来喝着喝着也习惯了。原来有些日子也是这样，不太像预期，但也能过下去。",
    "椅子每天都很安静。有人坐下，它就接住；没人坐，它也不抱怨。后来觉得，能稳定地待在那里，也是一种了不起。",
    "今日菜单：热茶一杯，饼干两块，发呆三分钟。如果还有力气，再加一点点认真生活。",
    "桌上留下一个圆圆的杯印。它看起来像一枚小章，证明这里曾经有过一杯咖啡。",
    "今天本来只是闭眼休息一下。结果醒来的时候，时间已经走了一段路。我决定不责怪自己，毕竟时间自己有腿。",
    "小毯子最大的本事，是让人很快放弃逞强。一盖上去，就会发现原来我也不是机器。",
    "茶包泡在杯子里，看起来很安静。其实它正在慢慢把味道交给水。很多温柔的变化，都是这样发生的：不响，但有用。",
    "今天有一点想挂出牌子：兔子暂时不营业。不过想了想，还是可以提供基础服务：呼吸、喝水、坐着、偶尔眨眼。",
    "找了很久的笔，最后发现它就在手里。这说明人认真寻找的时候，偶尔会忽略自己已经拥有的东西。",
    "不要在很饿的时候思考人生。那时候想出来的答案，通常会比较悲壮。先吃点东西，世界可能会自动温柔一点。",
    "杯子空了，不代表这杯茶失败了。它只是完成了自己的任务。很多结束其实不是坏事。",
    "我发现自己做事有时候很慢。但慢也有慢的好处，比如不容易错过桌上的小花纹，也比较适合发现饼干藏在哪里。",
    "今天想送你一个暂停键。不用很大，一个小小的就好。按下去以后，世界继续转，但你可以先坐一会儿。",
    "有些问题像很浓的咖啡。刚入口会苦，放一会儿，温度降下来，反而比较容易喝。",
    "小盘子接住了掉下来的饼干屑。它没有抱怨自己装的不是大餐。能接住一点点，也是一种贡献。",
    "糖罐子空了。我认真看了它一会儿，觉得它没有失败。它只是把甜都给出去了。",
    "桌角有一小块阳光。它没有照亮整个房间，但足够照亮一只杯子。原来一点点亮，也可以让普通东西变得好看。",
    "今天召开了一次兔子会议。议题是：为什么总在整理东西时翻到零食。会议结果：零食很会躲，也很会被发现。",
    "被窝给我的建议通常很简单：再待一会儿。我知道它不一定客观，但它的语气实在太有说服力了。",
    "今天的清单只写三件事。喝水。吃饭。不要对自己太凶。第三件最难，所以我把它写得最大。"
  ]
};


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
  window.localStorage.removeItem(ONBOARDING_KEY);
}

export function isOnboardingDone(): boolean {
  if (!hasStorage()) return true;
  return window.localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function markOnboardingDone() {
  if (!hasStorage()) return;
  window.localStorage.setItem(ONBOARDING_KEY, "true");
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
