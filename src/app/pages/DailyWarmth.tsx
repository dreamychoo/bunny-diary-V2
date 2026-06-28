import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Save, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../components/ui/utils";
import { useI18n } from "../i18n";
import { appendWarmthEntry, createEntryId, weatherKeys, WeatherKey, WarmthEntry } from "../lib/storage";
import { routes } from "../routes";

type InnerWeather = {
  emoji: string;
  key: WeatherKey;
  helpZh: string;
  helpEn: string;
};

const innerWeatherOptions: InnerWeather[] = [
  { emoji: "☀️", key: "sunny", helpZh: "轻盈、开心", helpEn: "light, happy" },
  { emoji: "⛅", key: "cloudy", helpZh: "平静、平淡", helpEn: "calm, steady" },
  { emoji: "🌧️", key: "rainy", helpZh: "低落、想哭", helpEn: "low, tearful" },
  { emoji: "🌫️", key: "foggy", helpZh: "迷茫、看不清", helpEn: "lost, unclear" },
  { emoji: "⛈️", key: "thunder", helpZh: "烦躁、强烈", helpEn: "restless, strong" },
  { emoji: "✨", key: "starry", helpZh: "安静、柔软", helpEn: "quiet, tender" }
];

const negativeWeatherKeys = new Set<WeatherKey>(["rainy", "foggy", "thunder"]);

const prompts = [
  "想一件今天让你觉得还可以的事",
  "有没有一句让你心里暖了一下的话？",
  "今天有没有为自己做了一件小事？",
  "有想感谢的人或事吗？",
  "今天有什么让你笑了的事？",
  "如果今天有一帧可以保存，是什么？"
];

const promptsEn = [
  "Something that felt okay today",
  "A line that stayed with you?",
  "One small thing you did for yourself",
  "Someone or something you're grateful for",
  "Something that made you smile today",
  "One frame worth saving from today"
];

export default function DailyWarmth() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [weather, setWeather] = useState<WeatherKey | "">("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showComfort, setShowComfort] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const currentPrompts = language === "zh" ? prompts : promptsEn;

  const handleRefreshPrompt = () => {
    setPromptIndex((prev) => (prev + 1) % currentPrompts.length);
  };

  const handleWritePrompt = () => {
    const prompt = currentPrompts[promptIndex];
    setNote((prev) => (prev ? `${prev}\n${prompt}\n` : `${prompt}\n`));
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
      textareaRef.current.style.height = `${Math.max(140, textareaRef.current.scrollHeight)}px`;
    }
  }, [note]);

  useEffect(() => {
    if ((location.state as { prefill?: string } | null)?.prefill) {
      setNote((location.state as { prefill: string }).prefill);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  function handleSaveAndCheck(event: FormEvent) {
    event.preventDefault();
    if (isSaving) return;
    setSaveError(null);

    if (negativeWeatherKeys.has(weather as WeatherKey)) {
      const entry: WarmthEntry = {
        id: createEntryId("warmth"),
        type: "warmth",
        timestamp: new Date().toISOString(),
        mood: "",
        weather: weather || "",
        gratitude: note,
        success: ""
      };
      try {
        appendWarmthEntry(entry);
        setShowComfort(true);
      } catch {
        setSaveError(t("common.saveFailed"));
      }
      return;
    }

    const entry: WarmthEntry = {
      id: createEntryId("warmth"),
      type: "warmth",
      timestamp: new Date().toISOString(),
      mood: "",
      weather: weather || "",
      gratitude: note,
      success: ""
    };

    try {
      appendWarmthEntry(entry);
      setIsSaving(true);
      navigate(routes.home);
    } catch {
      setIsSaving(false);
      setSaveError(t("common.saveFailed"));
    }
  }

  const helpText = language === "zh"
    ? innerWeatherOptions.map((w) => `${w.emoji}${t(`weatherKey.${w.key}`)} = ${w.helpZh}`).join(" · ")
    : innerWeatherOptions.map((w) => `${w.emoji}${t(`weatherKey.${w.key}`)} = ${w.helpEn}`).join(" · ");

  return (
    <AppShell title={t("daily.title")} subtitle={t("daily.subtitle")} headerMascotVariant="warmth">
      {showComfort ? (
        <div className="mx-auto max-w-[34rem] pt-6">
          <Card className="border-[#e6c779]/60 bg-[#ffffff] p-6 text-center">
            <div className="text-4xl">🐰</div>
            <h2 className="font-display mt-4 text-xl font-bold text-[#4a3b34]">{t("daily.comfort.title")}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#7f746e]">{t("daily.comfort.body")}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="ghost" onClick={() => navigate(routes.home)}>{t("common.home")}</Button>
              <Button variant="garden" onClick={() => navigate(routes.bunnyGarden)}>{t("daily.comfort.garden")}</Button>
            </div>
          </Card>
        </div>
      ) : (
        <form onSubmit={handleSaveAndCheck} className="mx-auto grid w-full max-w-[34rem] gap-4">
          {saveError && <p className="rounded-[16px] border border-[#e7c7c2] bg-[#fff5f3] px-4 py-3 text-sm leading-6 text-[#8a615a]">{saveError}</p>}

          <Card className="border-[#e6c779]/60 bg-[#ffffff] p-5">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#9a8f88]">
              <span className="text-[#e6c779]">✨</span>
              <span className="animate-fade-in">{currentPrompts[promptIndex]}</span>
              <button type="button" onClick={handleRefreshPrompt} className="ml-auto grid h-6 w-6 place-items-center rounded-full text-[#b3a79f] hover:bg-[#f8f4ee]" aria-label="refresh prompt">
                <RefreshCw className="h-3 w-3" />
              </button>
              <button type="button" onClick={handleWritePrompt} className="grid h-6 w-6 place-items-center rounded-full text-[#b3a79f] hover:bg-[#f8f4ee]" aria-label="write prompt">
                <span className="text-[12px]">✏️</span>
              </button>
            </div>

            <Textarea
              ref={textareaRef}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("daily.notePlaceholder")}
              className="mt-3 min-h-[8.75rem] overflow-hidden border-[#e7ddd3] bg-transparent text-[15px] leading-8 shadow-none focus:border-[#e6c779]/55 focus:ring-0"
            />
          </Card>

          <Card className="border-[#e6c779]/60 bg-[#ffffff] p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#4a3b34]">今天心里的天气</h2>
              <button
                type="button"
                onClick={() => setShowHelp((v) => !v)}
                className="grid h-7 w-7 place-items-center rounded-full border border-[#d8d3cc] text-[11px] text-[#8d817a] hover:bg-[#f8f4ee]"
                aria-label="help"
              >
                ?
              </button>
            </div>

            {showHelp && (
              <p className="mt-3 rounded-[12px] bg-[#f8f4ee] px-3 py-2 text-[11px] leading-[1.6] text-[#7c6f67]">
                {helpText}
              </p>
            )}

            <div className="mt-4 grid grid-cols-3 gap-2">
              {innerWeatherOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setWeather(weather === opt.key ? "" : opt.key)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[14px] font-semibold transition active:scale-[0.98]",
                    weather === opt.key
                      ? "border-[#c5a647] bg-[#e6c779] text-[#4a3b34]"
                      : "border-[#e6c779]/45 bg-[#ffffff] text-[#7f6b62] hover:bg-[#fbf3dc]"
                  )}
                >
                  <span className="text-[16px]">{opt.emoji}</span>
                  <span>{opt.emoji === "✨" ? t(`weatherKey.${opt.key}`) : opt.key === "thunder" ? t("weatherKey.thunder") : t(`weatherKey.${opt.key}`)}</span>
                </button>
              ))}
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
      )}
    </AppShell>
  );
}
