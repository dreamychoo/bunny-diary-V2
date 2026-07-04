import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Smartphone, FileText } from "lucide-react";
import { toPng } from "html-to-image";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/button";
import { useI18n } from "../i18n";
import { RETRO_PHONE } from "../lib/calibration";
import { emotionIcons, emotionKeys, getEntryById, symptomKeys } from "../lib/storage";
import { routes } from "../routes";

const weatherEmojis: Record<string, string> = {
  sunny: "☀️", cloudy: "⛅", rainy: "🌧️", foggy: "🌫️",
  thunder: "⛈️", starry: "✨", windy: "💨", moonlit: "🌙"
};

type CardStyle = "plain" | "retro";

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
  const quoteRef = useRef<HTMLDivElement>(null);
  const entry = id ? getEntryById(id) : null;
  const notebookQuote = (location.state as { notebookLine?: string } | null)?.notebookLine;

  // Auto-fit font: find size that fits LCD, then give 5px breathing room
  const [autoFitPx, setAutoFitPx] = useState(16);
  const [fontOverride, setFontOverride] = useState<number | null>(null);
  const retroLen = entry
    ? (entry.type === "emotion" ? (entry.whatHappened?.length || 0) : (entry.type === "warmth" ? (entry.gratitude?.length || 0) : 0))
    : (notebookQuote?.length || 0);
  const aestheticCap = retroLen > 50 ? 10 : retroLen > 35 ? 13.5 : 16;
  const effectiveFontSize = fontOverride ?? Math.min(aestheticCap, Math.max(6, autoFitPx - 5));

  const [lcdFontSize, setLcdFontSize] = useState(16);
  // Sync slider with effective size when no manual override
  useEffect(() => { if (fontOverride === null) setLcdFontSize(effectiveFontSize); }, [autoFitPx, fontOverride]);

  useLayoutEffect(() => {
    if (cardStyle !== "retro") return;
    if (fontOverride !== null) return; // user has manual override
    const el = quoteRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    const orig = el.style.fontSize;
    let lo = 6, hi = 22;
    for (let i = 0; i < 8; i++) {
      const mid = (lo + hi) / 2;
      el.style.fontSize = `${mid}px`;
      if (el.scrollHeight <= parent.clientHeight) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    el.style.fontSize = orig;
    const fitted = Math.round(lo * 2) / 2;
    if (fitted !== autoFitPx) setAutoFitPx(fitted);
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [cardStyle, setCardStyle] = useState<CardStyle>((location.state as { cardStyle?: CardStyle } | null)?.cardStyle ?? "plain");

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
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `diary-card-${Date.now()}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t("detail.saveImage") });
      } else {
        const link = document.createElement("a");
        link.download = file.name;
        link.href = dataUrl;
        link.click();
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setSaveError(t("detail.saveFailed"));
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = t("detail.saveImage"); }
    }
  };

  const emotionEntry = notebookQuote || entry?.type !== "emotion" ? null : entry;
  const warmthEntry = notebookQuote || entry?.type !== "warmth" ? null : entry;
  const isEmotion = Boolean(emotionEntry);
  // Determine retro text content
  let retroText = "";
  if (notebookQuote) {
    retroText = notebookQuote;
  } else if (isEmotion && emotionEntry?.whatHappened) {
    retroText = emotionEntry.whatHappened;
  } else if (warmthEntry?.gratitude) {
    retroText = warmthEntry.gratitude;
  } else {
    retroText = "⋯";
  }

  return (
    <AppShell title={t("detail.diaryCard")}>
      <div className="mx-auto max-w-[420px]">
        {saveError && <p className="mb-4 rounded-[16px] border border-[#e7c7c2] bg-[#fff5f3] px-4 py-3 text-sm leading-6 text-[#8a615a]">{saveError}</p>}

        {/* Card style toggle */}
        <div className="card-style-toggle">
          <button className={`card-style-btn${cardStyle === "plain" ? " active" : ""}`} onClick={() => setCardStyle("plain")}>
            <FileText /> {t("detail.stylePlain")}
          </button>
          <button className={`card-style-btn${cardStyle === "retro" ? " active" : ""}`} onClick={() => setCardStyle("retro")}>
            <Smartphone /> {t("detail.styleRetro")}
          </button>
        </div>

        {cardStyle === "plain" ? (
          <>
            {/* Plain card */}
            <div
              ref={cardRef}
              className="overflow-hidden rounded-[12px] bg-[var(--bg)] p-14 pb-12 shadow-[0_8px_40px_rgba(75,58,52,0.08)]"
              style={{ fontFamily: "Inter, Nunito, system-ui, sans-serif" }}
            >
              <div className="flex justify-center">
                <img src="/assets/v2/rabbits/holding-heart.png" alt="" className="h-20 w-20 object-contain" />
              </div>

              {notebookQuote ? (
                <p className="mt-4 text-center text-[13px] font-semibold tracking-wide text-[var(--muted)]">{new Date().toLocaleDateString(language === "zh" ? "zh-CN" : "en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <p className="text-[13px] font-semibold tracking-wide text-[var(--muted)]">
                    {formatDate(entry!.timestamp, language)}
                  </p>
                  {warmthEntry?.weather && (
                    <span className="text-xl">{weatherEmojis[warmthEntry.weather] || "☀️"}</span>
                  )}
                </div>
              )}

              <div className="mx-auto my-4 h-px w-12 bg-[var(--muted)]/40" />

              {notebookQuote ? (
                <div className="mt-6 border-l-2 border-[rgba(255,111,134,0.25)] pl-5">
                  <p className="whitespace-pre-wrap text-[15px] leading-8 text-[#4a3b34]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{notebookQuote}</p>
                </div>
              ) : isEmotion ? (
                <>
                  {emotionEntry && emotionEntry.emotions.length > 0 && (
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className="text-lg">{emotionIcons[emotionEntry.emotions[0]] || "💧"}</span>
                      <span className="rounded-full bg-[var(--pink-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--pink)]">
                        {optionLabel(emotionEntry.emotions[0], "emotionKey", emotionKeys, t)}
                      </span>
                      {emotionEntry && emotionEntry.symptoms.length > 0 && (
                        <span className="rounded-full bg-[#f4f0fb] px-2.5 py-0.5 text-[10px] font-medium text-[#6f6486]">
                          {emotionEntry.symptoms.map((s) => optionLabel(s, "symptomKey", symptomKeys, t)).join(" · ")}
                        </span>
                      )}
                      {emotionEntry.intensity > 0 && (
                        <div className="flex gap-0.5">
                          {Array.from({ length: 10 }, (_, i) => (
                            <span key={i} className={`block h-2 w-2 rounded-full ${i < emotionEntry.intensity ? "bg-[var(--pink)]" : "bg-[var(--muted)]/30"}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {emotionEntry?.whatHappened && (
                    <div className="mt-6 border-l-2 border-[rgba(255,111,134,0.25)] pl-5">
                      <p className="whitespace-pre-wrap text-[15px] leading-8 text-[#4a3b34]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        {emotionEntry.whatHappened}
                      </p>
                    </div>
                  )}
                  {emotionEntry?.childhood && (
                    <div className="mt-4 rounded-[14px] bg-[#f3f0fb]/70 px-4 py-3">
                      <p className="text-[11px] font-semibold text-[#8177a4]">{t("detail.whatNeeded")}</p>
                      <p className="whitespace-pre-wrap text-[15px] leading-8 text-[#5f5149]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{emotionEntry.childhood}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {warmthEntry?.gratitude && (
                    <div className="mt-6 border-l-2 border-[rgba(255,111,134,0.25)] pl-5">
                      <p className="whitespace-pre-wrap text-[15px] leading-8 text-[#4a3b34]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        {warmthEntry.gratitude}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="mx-auto my-4 h-px w-12 bg-[var(--muted)]/40" />
              <p className="text-center font-hand text-[12px] text-[var(--muted)]">
                {t("app.title")} · {t("app.tagline")}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Retro phone card */}
            <div
              ref={cardRef}
              className="card-retro-phone"
              style={{
                "--cal-lcd-left": `${RETRO_PHONE.lcd.left}%`,
                "--cal-lcd-top": `${RETRO_PHONE.lcd.top}%`,
                "--cal-lcd-width": `${RETRO_PHONE.lcd.width}%`,
                "--cal-lcd-height": `${RETRO_PHONE.lcd.height}%`,
                "--cal-title-top": `${RETRO_PHONE.title.top}%`,
                "--cal-divider-top": `${RETRO_PHONE.divider.top}%`,
                "--cal-footer-top": `${RETRO_PHONE.footer.top}%`,
              } as React.CSSProperties}
            >
              <img className="retro-bg" src="/assets/v2/frames/retro-phone.png" alt="" />
              <div className="retro-lcd" style={{"--retro-font-size": `${effectiveFontSize}px`} as React.CSSProperties}>
                <div className="retro-quote" ref={quoteRef}><p>{retroText}</p></div>
              </div>
              <div className="retro-title">BUNNY DIARY</div>
              <div className="retro-divider">⋯⋯ ᕱ⑅ᕱ ⋯⋯</div>
              <div className="retro-footer">
                <span>{new Date().toISOString().slice(0, 10)}</span>
                <span className="retro-save-label">SAVE</span>
              </div>
            </div>
            <div className="retro-brand">
              <span>{t("detail.brand")}</span>
              <span>www.mybunnydiary.com</span>
            </div>
            {/* Font size only — position is auto-calibrated from retro-phone.png */}
            <div className="retro-controls">
              <div className="retro-ctrl-row">
                <label>{t("detail.fontSize")}</label>
                <input type="range" min="6" max="22" step="0.5" value={lcdFontSize} onChange={e => { setFontOverride(+e.target.value); setLcdFontSize(+e.target.value); }} />
                <span className="retro-val">{lcdFontSize}</span>
              </div>
              <button className="retro-save-inline" onClick={handleSave}>
                <Download size={14} /> {t("detail.saveImage")}
              </button>
              <div className="retro-ctrl-flex">
                <button className="retro-reset-btn" onClick={() => { setFontOverride(null); }}>{t("detail.reset")}</button>
              </div>
            </div>
          </>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="ghost" onClick={() => navigate(routes.pastJournals)}>
            <ArrowLeft className="h-4 w-4" />
            {t("common.backToPastJournals")}
          </Button>
          <Button variant="ghost" onClick={() => navigate(routes.home)}>
            {t("common.home")}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
