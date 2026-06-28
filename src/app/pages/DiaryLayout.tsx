import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ArrowLeft, Download } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/button";
import { useI18n } from "../i18n";
import { emotionKeys, getEntryById, moodKeys, symptomKeys, weatherKeys, type EmotionKey, type SymptomKey, type WeatherKey } from "../lib/storage";
import { routes } from "../routes";

const emotionIcons: Record<string, string> = {
  sadness: "💧", anger: "🌶️", anxiety: "⚡", disappointed: "🌧️",
  drained: "🌙", frustrated: "🐝", numbness: "◌", loneliness: "🍂",
  hurt: "🫧", overwhelm: "🪨", shame: "🌫️", confused: "❔",
  rejected: "🚪", stressed: "📦", jealous: "🌵", hopeless: "🌑",
  guilty: "🧵", fear: "🐾", empty: "☁️", sensitive: "🌼",
  on_edge: "🌊", avoidant: "🍃", unseen: "📭", ignored: "👁️",
  lost: "🧭", tenderness: "🫶", moved: "✨", calm: "🕊️",
  grateful: "☀️", hopeful: "🌱"
};

const weatherEmojis: Record<string, string> = {
  sunny: "☀️", cloudy: "⛅", rainy: "🌧️", foggy: "🌫️",
  thunder: "⛈️", starry: "✨", windy: "💨", moonlit: "🌙"
};

function formatDate(timestamp: string, language: string) {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
    year: "numeric", month: "long", day: "numeric", weekday: "long"
  }).format(new Date(timestamp));
}

function optionLabel(value: string, prefix: string, knownValues: readonly string[], t: (key: string) => string) {
  return knownValues.includes(value) ? t(`${prefix}.${value}`) : value;
}

export default function DiaryLayout() {
  const { t, language } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const entry = id ? getEntryById(id) : null;
  const notebookQuote = (location.state as { notebookLine?: string } | null)?.notebookLine;

  if (!entry && !notebookQuote) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-[#8d817a]">{t("detail.notFoundBody")}</p>
        </div>
      </AppShell>
    );
  }

  const handleSave = async () => {
    if (!cardRef.current) return;
    const btn = document.activeElement as HTMLButtonElement | null;
    if (btn) { btn.disabled = true; btn.textContent = t("detail.generating"); }
    try {
      const dataUrl = await toPng(cardRef.current, { backgroundColor: "#fdf8f2", pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `diary-card-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setSaveError(t("detail.saveFailed"));
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = t("detail.saveImage"); }
    }
  };

  const isEmotion = notebookQuote ? false : entry.type === "emotion";

  return (
    <AppShell title={t("detail.diaryCard")}>
      <div className="mx-auto max-w-[420px]">
        {saveError && <p className="mb-4 rounded-[16px] border border-[#e7c7c2] bg-[#fff5f3] px-4 py-3 text-sm leading-6 text-[#8a615a]">{saveError}</p>}
        <div
          ref={cardRef}
          className="overflow-hidden rounded-[28px] bg-[var(--bg)] p-6 shadow-[0_8px_40px_rgba(75,58,52,0.08)]"
          style={{ fontFamily: "Inter, Nunito, system-ui, sans-serif" }}
        >
          {/* Decorative top */}
          <div className="flex justify-center">
            <img src="/assets/v2/rabbits/holding-heart.png" alt="" className="h-20 w-20 object-contain" />
          </div>

          {/* Date + Weather or Notebook Line */}
          {notebookQuote ? (
            <p className="mt-4 text-center text-[13px] font-semibold tracking-wide text-[var(--muted)]">{new Date().toLocaleDateString(language === "zh" ? "zh-CN" : "en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          ) : (
            <div className="mt-4 flex items-center justify-center gap-2">
              <p className="text-[13px] font-semibold tracking-wide text-[var(--muted)]">
                {formatDate(entry.timestamp, language)}
              </p>
              {!isEmotion && entry.weather && (
                <span className="text-xl">{weatherEmojis[entry.weather] || "☀️"}</span>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="mx-auto my-4 h-px w-12 bg-[var(--muted)]/40" />

          {notebookQuote ? (
            <div className="mt-6 border-l-2 border-[rgba(255,111,134,0.25)] pl-5">
              <p className="whitespace-pre-wrap text-[15px] leading-8 text-[#4a3b34]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{notebookQuote}</p>
            </div>
          ) : isEmotion ? (
            <>
              {/* Emotions */}
              {entry.emotions.length > 0 && (
                <div className="mt-5 text-center">
                  <span className="text-4xl">{emotionIcons[entry.emotions[0]] || "💧"}</span>
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                    {entry.emotions.map((em) => (
                      <span key={em} className="rounded-full bg-[var(--pink-soft)] px-3 py-1 text-[13px] font-semibold text-[var(--pink)]">
                        {optionLabel(em, "emotionKey", emotionKeys, t)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Intensity */}
              {entry.intensity > 0 && (
                <div className="mt-4 flex justify-center gap-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <span
                      key={i}
                      className={`block h-2 w-2 rounded-full ${i < entry.intensity ? "bg-[var(--pink)]" : "bg-[var(--muted)]/30"}`}
                    />
                  ))}
                </div>
              )}

              {/* What happened */}
              {entry.whatHappened && (
                <div className="mt-5 rounded-[18px] bg-white p-5 text-center">
                  <p className="whitespace-pre-wrap text-[15px] leading-8 text-[#4a3b34]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    {entry.whatHappened}
                  </p>
                </div>
              )}

              {/* Symptoms */}
              {entry.symptoms.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {entry.symptoms.map((s) => (
                    <span key={s} className="rounded-full bg-[#f4f0fb] px-2.5 py-1 text-[11px] font-medium text-[#6f6486]">
                      {optionLabel(s, "symptomKey", symptomKeys, t)}
                    </span>
                  ))}
                </div>
              )}

              {/* Childhood */}
              {entry.childhood && (
                <div className="mt-4 rounded-[14px] bg-[#f3f0fb]/70 px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#8177a4]">
                    {t("detail.whatNeeded")}
                  </p>
                  <p className="whitespace-pre-wrap text-[15px] leading-8 text-[#5f5149]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{entry.childhood}</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Gratitude */}
              {entry.gratitude && (
                <div className="mt-5 rounded-[18px] bg-white p-5 text-center">
                  <p className="whitespace-pre-wrap text-[15px] leading-8 text-[#4a3b34]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    {entry.gratitude}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Brand footer */}
          <div className="mx-auto my-4 h-px w-12 bg-[var(--muted)]/40" />
          <p className="text-center font-hand text-[12px] text-[var(--muted)]">
            {t("app.title")} · {t("app.tagline")}
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex justify-between gap-3">
          <Button variant="ghost" onClick={() => navigate(routes.home)}>
            <ArrowLeft className="h-4 w-4" />
            {t("common.home")}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <Download className="h-4 w-4" />
            {t("detail.saveImage")}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
