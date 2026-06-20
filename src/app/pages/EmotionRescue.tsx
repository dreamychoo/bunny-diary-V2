import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Sparkles, Sprout } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { PlantingAnimationOverlay } from "../components/PlantingAnimationOverlay";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../components/ui/utils";
import { useI18n } from "../i18n";
import {
  appendEmotionEntry,
  createEntryId,
  EmotionEntry,
  EmotionKey,
  extraEmotionKeys,
  extraSymptomKeys,
  primaryEmotionKeys,
  primarySymptomKeys,
  SymptomKey
} from "../lib/storage";
import { routes } from "../routes";

const emotionIcons: Record<EmotionKey, string> = {
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

function formatLetterDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function StickerPicker<TValue extends string>({
  options,
  selected,
  onChange,
  labelPrefix,
  tone,
  expanded,
  onToggleExpanded,
  moreLabel,
  lessLabel,
  defaultCount
}: {
  options: readonly TValue[];
  selected: TValue[];
  onChange: (value: TValue[]) => void;
  labelPrefix: string;
  tone: "emotion" | "body";
  expanded: boolean;
  onToggleExpanded: () => void;
  moreLabel: string;
  lessLabel: string;
  defaultCount: number;
}) {
  const { t } = useI18n();
  const primaryOptions = options.slice(0, defaultCount);
  const extraOptions = options.slice(defaultCount);
  const visibleOptions = expanded ? options : primaryOptions;

  return (
    <div className="space-y-2.5">
      <div className={cn("flex flex-wrap gap-2", !expanded && "max-h-[4.5rem] overflow-hidden")}>
        {visibleOptions.map((option, index) => {
          const isSelected = selected.includes(option);
          const toneClass =
            tone === "emotion"
              ? isSelected
                ? "border-[#d8b2ad] bg-[#f7e8e6] text-[#855d58]"
                : "border-[#ecd8d4] bg-[#fffdfb] text-[#7f6b62] hover:bg-[#fbf0ee]"
              : isSelected
                ? "border-[#cfbfd8] bg-[#f4f0fb] text-[#6f6486]"
                : "border-[#e4dcec] bg-[#fffdfb] text-[#7a7080] hover:bg-[#f7f3fb]";

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(isSelected ? selected.filter((item) => item !== option) : [...selected, option])}
              className={cn(
                "inline-flex min-h-[2rem] items-center gap-1.5 rounded-[999px] border px-2.5 py-1.5 text-left text-[12px] font-semibold leading-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition",
                "hover:-translate-y-[1px] active:scale-[0.98]",
                toneClass,
                index % 3 === 1 && "rotate-[0.5deg]",
                index % 4 === 0 && "rotate-[-0.55deg]"
              )}
            >
              <span className="text-[11px]">{isSelected ? (tone === "emotion" ? emotionIcons[option as EmotionKey] : "📌") : tone === "emotion" ? "◌" : "✦"}</span>
              <span>{t(`${labelPrefix}.${option}`)}</span>
            </button>
          );
        })}
      </div>

      {extraOptions.length > 0 && (
        <button
          type="button"
          onClick={onToggleExpanded}
          className="inline-flex items-center gap-1 rounded-full border border-[#e6ddd4] bg-[#ffffff]/82 px-2.5 py-1.5 text-[11px] font-semibold text-[#7d7168] transition hover:bg-[#ffffff]"
        >
          {expanded ? lessLabel : moreLabel}
          <ChevronDown className={cn("h-3.5 w-3.5 transition", expanded && "rotate-180")} />
        </button>
      )}
    </div>
  );
}

export default function EmotionRescue() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [emotions, setEmotions] = useState<EmotionKey[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomKey[]>([]);
  const [intensity, setIntensity] = useState(6);
  const [whatHappened, setWhatHappened] = useState("");
  const [childhood, setChildhood] = useState("");
  const [showEmotionMore, setShowEmotionMore] = useState(false);
  const [showSymptomMore, setShowSymptomMore] = useState(false);
  const [showDeeperNotes, setShowDeeperNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPlanting, setShowPlanting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const whatHappenedRef = useRef<HTMLTextAreaElement | null>(null);
  const intensityRatio = ((intensity - 1) / 9) * 100;
  const letterDate = useMemo(() => formatLetterDate(new Date()), []);

  useEffect(() => {
    const textarea = whatHappenedRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.max(140, textarea.scrollHeight)}px`;
  }, [whatHappened]);

  const trackGradient = useMemo(() => {
    if (intensity <= 3) {
      return `linear-gradient(90deg, #f0e6c7 0%, #e6cf8a ${intensityRatio}%, rgba(216,211,204,0.48) ${intensityRatio}%, rgba(216,211,204,0.48) 100%)`;
    }
    if (intensity <= 7) {
      return `linear-gradient(90deg, #f1d7c9 0%, #dfa89b ${intensityRatio}%, rgba(216,211,204,0.48) ${intensityRatio}%, rgba(216,211,204,0.48) 100%)`;
    }
    return `linear-gradient(90deg, #e8b6aa 0%, #bc7a6f ${intensityRatio}%, rgba(216,211,204,0.48) ${intensityRatio}%, rgba(216,211,204,0.48) 100%)`;
  }, [intensity, intensityRatio]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isSaving) return;
    setSaveError(null);

    const entry: EmotionEntry = {
      id: createEntryId("emotion"),
      type: "emotion",
      timestamp: new Date().toISOString(),
      emotions,
      symptoms,
      intensity,
      whatHappened,
      childhood,
      beliefs: ""
    };

    try {
      appendEmotionEntry(entry);
      setIsSaving(true);
      setShowPlanting(true);
    } catch {
      setIsSaving(false);
      setShowPlanting(false);
      setSaveError(t("common.saveFailed"));
    }
  }

  return (
    <AppShell title={t("emotion.title")} subtitle={t("emotion.subtitle")} headerMascotVariant="listening">
      <PlantingAnimationOverlay
        open={showPlanting}
        variant="save-success"
        tone="feeling"
        onPrimary={() => navigate(routes.bunnyGarden, { state: { openSeedVault: true } })}
        onSecondary={() => navigate(routes.home)}
      />

      <form
        onSubmit={handleSubmit}
        className={cn(
          "mx-auto grid w-full max-w-[34rem] gap-4 transition-opacity duration-300 sm:gap-5",
          showPlanting && "pointer-events-none opacity-0"
        )}
      >
        <section className="pb-1 text-center">
          {saveError && <p className="mx-auto max-w-xs rounded-[16px] border border-[#e7c7c2] bg-[#fff5f3] px-4 py-3 text-sm leading-6 text-[#8a615a]">{saveError}</p>}
        </section>

        <Card className="border-[#ead6d1]/65 bg-[#fffdfb] p-4 sm:p-5">
          <Label className="text-[1rem]">{t("emotion.emotionsLabel")}</Label>
          <div className="mt-3">
            <StickerPicker
              options={[...primaryEmotionKeys, ...extraEmotionKeys]}
              selected={emotions}
              onChange={setEmotions}
              labelPrefix="emotionKey"
              tone="emotion"
              expanded={showEmotionMore}
              onToggleExpanded={() => setShowEmotionMore((value) => !value)}
              moreLabel={t("emotion.more")}
              lessLabel={t("emotion.less")}
              defaultCount={primaryEmotionKeys.length}
            />
          </div>
        </Card>

        <Card className="border-[#e5ddee]/68 bg-[#fffdfb] p-4 sm:p-5">
          <Label className="text-[1rem]">{t("emotion.symptomsLabel")}</Label>
          <div className="mt-3">
            <StickerPicker
              options={[...primarySymptomKeys, ...extraSymptomKeys]}
              selected={symptoms}
              onChange={setSymptoms}
              labelPrefix="symptomKey"
              tone="body"
              expanded={showSymptomMore}
              onToggleExpanded={() => setShowSymptomMore((value) => !value)}
              moreLabel={t("emotion.more")}
              lessLabel={t("emotion.less")}
              defaultCount={primarySymptomKeys.length}
            />
          </div>
        </Card>

        <Card className="border-[#ead6d1]/65 bg-[#ffffff] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="intensity" className="text-[1rem]">
              {t("emotion.intensity")}
            </Label>
            {emotions.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#dfd6ca] bg-[#fff9ef] px-3 py-1 text-[12px] font-semibold text-[#8a7651] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                <Sprout className={cn("h-3.5 w-3.5 transition-transform", isSaving && "translate-y-3 opacity-0")} />
                {t("emotion.seedReady")}
              </span>
            )}
          </div>

          <div className="mt-5 px-1">
            <div className="flex h-10 items-center">
              <input
                id="intensity"
                type="range"
                min="1"
                max="10"
                value={intensity}
                onInput={(event) => setIntensity(Number(event.currentTarget.value))}
                className="intensity-slider w-full"
                style={{ background: trackGradient }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[12px] text-[#8b7f78]">
            <span>{t("emotion.intensityLow")}</span>
            <span className="text-[#c1b4ad]">↔</span>
            <span>{t("emotion.intensityHigh")}</span>
          </div>
        </Card>

        <Card
          className={cn(
            "overflow-hidden border-[#ead6d1]/68 bg-[#fffdf9] p-0 transition duration-500",
            isSaving && "translate-y-[2px] scale-[0.992]"
          )}
        >
          <div className="border-b border-[#efe5dc] bg-[#fbf6ef] px-5 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-3 text-[12px] text-[#9b8f87]">
              <span>{letterDate}</span>
              <span className="font-hand text-[15px] text-[#887b73]">{t("emotion.dearBunny")}</span>
            </div>
          </div>
          <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            <Label htmlFor="whatHappened" className="text-[1rem]">
              {t("emotion.whatHappened")}
            </Label>
            <Textarea
              id="whatHappened"
              ref={whatHappenedRef}
              value={whatHappened}
              onChange={(event) => setWhatHappened(event.target.value)}
              placeholder={t("emotion.whatHappenedPlaceholder")}
              className="mt-4 min-h-[8.75rem] overflow-hidden border-[#e7ddd3] bg-transparent text-[15px] leading-8 shadow-none focus:border-[#e5c8c4] focus:ring-0"
            />
          </div>
        </Card>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowDeeperNotes((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-[#e6ddd4] bg-[#ffffff]/88 px-4 py-2 text-[13px] font-semibold text-[#7f746e] transition hover:bg-[#ffffff]"
          >
            {showDeeperNotes ? t("emotion.hideDetails") : t("emotion.expandDetails")}
            <ChevronDown className={cn("h-4 w-4 transition", showDeeperNotes && "rotate-180")} />
          </button>
        </div>

        {showDeeperNotes && (
          <Card className="border-[#ead6d1]/62 bg-[#ffffff] p-5 sm:p-6">
            <div>
              <Label htmlFor="childhood" className="text-[1rem]">
                {t("emotion.childhood")}
              </Label>
              <Textarea
                id="childhood"
                value={childhood}
                onChange={(event) => setChildhood(event.target.value)}
                placeholder={t("emotion.childhoodPlaceholder")}
                className="mt-3 min-h-[8.5rem] border-[#e7ddd3] bg-[#fffdfb]"
              />
            </div>
          </Card>
        )}

        <div className="sticky bottom-3 z-10 flex justify-center">
          <Button
            type="submit"
            className={cn(
              "min-w-[12rem] rounded-[18px] px-6 py-3 text-[15px] shadow-[0_8px_24px_rgba(181,144,139,0.18)]",
              isSaving && "bg-[#dcc4c0]"
            )}
            disabled={isSaving}
          >
            <span className="relative inline-flex items-center gap-2">
              <span>🌱</span>
              {t("emotion.save")}
            </span>
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
