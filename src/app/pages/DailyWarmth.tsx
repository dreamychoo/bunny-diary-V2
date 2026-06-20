import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PlantingAnimationOverlay } from "../components/PlantingAnimationOverlay";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../components/ui/utils";
import { useI18n } from "../i18n";
import { appendWarmthEntry, createEntryId, moodKeys, MoodKey, WarmthEntry, weatherKeys, WeatherKey } from "../lib/storage";
import { routes } from "../routes";

function SingleChoice<TValue extends string>({
  options,
  value,
  onChange,
  labelPrefix
}: {
  options: readonly TValue[];
  value: TValue | "";
  onChange: (value: TValue) => void;
  labelPrefix: string;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-bold transition active:scale-[0.98]",
            value === option
              ? "border-[#c5a647] bg-[#e6c779] text-[#4a3b34]"
              : "border-[#e6c779]/55 bg-[#ffffff] text-[#7f6b62] hover:bg-[#fbf3dc]"
          )}
        >
          {t(`${labelPrefix}.${option}`)}
        </button>
      ))}
    </div>
  );
}

export default function DailyWarmth() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mood, setMood] = useState<MoodKey | "">("");
  const [weather, setWeather] = useState<WeatherKey | "">("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPlanting, setShowPlanting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isSaving) return;
    setSaveError(null);

    const entry: WarmthEntry = {
      id: createEntryId("warmth"),
      type: "warmth",
      timestamp: new Date().toISOString(),
      mood,
      weather,
      gratitude: note,
      success: ""
    };

    try {
      appendWarmthEntry(entry);
      setIsSaving(true);
      setShowPlanting(true);
    } catch {
      setIsSaving(false);
      setShowPlanting(false);
      setSaveError(t("common.saveFailed"));
    }
  }

  return (
    <AppShell title={t("daily.title")} subtitle={t("daily.subtitle")} headerMascotVariant="warmth">
      <PlantingAnimationOverlay
        open={showPlanting}
        variant="save-success"
        tone="warmth"
        onPrimary={() => navigate(routes.bunnyGarden, { state: { openSeedVault: true } })}
        onSecondary={() => navigate(routes.home)}
      />

      <form onSubmit={handleSubmit} className={cn("grid gap-5 transition-opacity duration-300", showPlanting && "pointer-events-none opacity-0")}>
        {saveError && <p className="rounded-[16px] border border-[#e7c7c2] bg-[#fff5f3] px-4 py-3 text-sm leading-6 text-[#8a615a]">{saveError}</p>}

        <Card className="grid gap-5 border-[#e6c779]/60 bg-[#ffffff] p-6">
          <div>
            <Label>{t("daily.mood")}</Label>
            <div className="mt-3">
              <SingleChoice options={moodKeys} value={mood} onChange={setMood} labelPrefix="moodKey" />
            </div>
          </div>
          <div>
            <Label>{t("daily.weather")}</Label>
            <div className="mt-3">
              <SingleChoice options={weatherKeys} value={weather} onChange={setWeather} labelPrefix="weatherKey" />
            </div>
          </div>
        </Card>

        <Card className="grid gap-5 border-[#e6c779]/60 bg-[#fbf3dc] p-6">
          <div>
            <Label htmlFor="note">{t("daily.note")}</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("daily.notePlaceholder")}
              className="mt-3 min-h-[140px] max-h-[240px] border-[#ecd9a3] bg-[#fffdf8] leading-7"
            />
          </div>
        </Card>

        <div className="flex flex-wrap justify-between gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate(routes.home)}>
            <ArrowLeft className="h-4 w-4" />
            {t("common.home")}
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4" />
            {t("daily.save")}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
