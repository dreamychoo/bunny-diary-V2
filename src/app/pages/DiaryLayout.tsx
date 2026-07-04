import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Smartphone, FileText } from "lucide-react";
import { toPng } from "html-to-image";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/button";
import { useI18n } from "../i18n";
import { emotionKeys, getEntryById, symptomKeys } from "../lib/storage";
import { routes } from "../routes";

const emotionIcons: Record<string, string> = {
  sadness: "💧", anger: "🌶️", anxiety: "⚡", disappointed: "🌧️",
  drained: "🌙", frustrated: "🐝", numbness: "◌", nothingness: "·", burnout: "🪫", emo: "🌑", loneliness: "🍂",
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
  const entry = id ? getEntryById(id) : null;
  const notebookQuote = (location.state as { notebookLine?: string } | null)?.notebookLine;

  // Auto font size based on text length
  const retroLen = entry
    ? (entry.type === "emotion" ? (entry.whatHappened?.length || 0) : (entry.type === "warmth" ? (entry.gratitude?.length || 0) : 0))
    : (notebookQuote?.length || 0);
  const autoFontSize = retroLen > 50 ? 10 : retroLen > 35 ? 13.5 : 16;

  const savedCal = typeof window !== 'undefined' ? (() => { try { return JSON.parse(window.localStorage.getItem('bunnyDiary_retroCal') || '{}'); } catch { return {}; } })() : {};
  const [lcdTop, setLcdTop] = useState(savedCal.top ?? 20.4);
  const [lcdLeft, setLcdLeft] = useState(savedCal.left ?? 28.1);
  const [lcdWidth, setLcdWidth] = useState(savedCal.width ?? 45.4);
  const [lcdHeight, setLcdHeight] = useState(savedCal.height ?? 40.9);
  const [lcdPadTop, setLcdPadTop] = useState(savedCal.padTop ?? 10);
  const [lcdPadBottom, setLcdPadBottom] = useState(savedCal.padBottom ?? 18);
  // Reset font size when text changes; user can override via the slider
  const [lcdFontSize, setLcdFontSize] = useState(autoFontSize);
  const [manualFont, setManualFont] = useState(false);
  const effectiveFontSize = manualFont ? lcdFontSize : autoFontSize;
  // Re‑sync with auto size when entry changes (unless user manually adjusted)
  useEffect(() => { if (!manualFont) setLcdFontSize(autoFontSize); }, [autoFontSize]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [cardStyle, setCardStyle] = useState<CardStyle>((location.state as { cardStyle?: CardStyle } | null)?.cardStyle ?? "plain");
  const saveCal = (key: string, val: number) => {
    try {
      const cur = JSON.parse(window.localStorage.getItem('bunnyDiary_retroCal') || '{}');
      cur[key] = val;
      window.localStorage.setItem('bunnyDiary_retroCal', JSON.stringify(cur));
    } catch {}
  };

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
            >
              <img className="retro-bg" src="/assets/v2/frames/retro-phone.png" alt="" />
              <div className="retro-lcd" style={{"--retro-font-size": `${effectiveFontSize}px`, left: `${lcdLeft}%`, top: `${lcdTop}%`, width: `${lcdWidth}%`, height: `${lcdHeight}%`, paddingTop: `${lcdPadTop}px`, paddingBottom: `${lcdPadBottom}px`} as React.CSSProperties}>
                <div className="retro-quote"><p>{retroText}</p></div>
              </div>
              <div className="retro-title">BUNNY DIARY</div>
              <div className="retro-divider">⋯⋯ ᕱ⑅ᕱ ⋯⋯</div>
              <div className="retro-footer">
                <span>{new Date().toISOString().slice(0, 10)}</span>
                <span className="retro-save-label">SAVE</span>
              </div>
            </div>
            <div className="retro-brand">
              <span>小兔日记 · 你的情绪觉察伙伴</span>
              <span>www.mybunnydiary.com</span>
            </div>
            <div className="retro-calibrate-hint">如果文字位置不对，可以拖动下方滑块微调哦～</div>
            {/* Calibrate controls for retro mode */}
            <div className="retro-controls">
              <div className="retro-ctrl-row">
                <label>左</label>
                <input type="range" min="0" max="60" step="0.1" value={lcdLeft} onChange={e => { saveCal('left', +e.target.value); setLcdLeft(+e.target.value); }} />
                <span className="retro-val">{lcdLeft}</span>
              </div>
              <div className="retro-ctrl-row">
                <label>上</label>
                <input type="range" min="19" max="70" step="0.1" value={lcdTop} onChange={e => { saveCal('top', +e.target.value); setLcdTop(+e.target.value); }} />
                <span className="retro-val">{lcdTop}</span>
              </div>
              <div className="retro-ctrl-row">
                <label>宽</label>
                <input type="range" min="20" max="48" step="0.1" value={lcdWidth} onChange={e => { saveCal('width', +e.target.value); setLcdWidth(+e.target.value); }} />
                <span className="retro-val">{lcdWidth}</span>
              </div>
              <div className="retro-ctrl-row">
                <label>高</label>
                <input type="range" min="15" max="80" step="0.1" value={lcdHeight} onChange={e => { saveCal('height', +e.target.value); setLcdHeight(+e.target.value); }} />
                <span className="retro-val">{lcdHeight}</span>
              </div>
              <div className="retro-ctrl-row">
                <label>字号</label>
                <input type="range" min="8" max="22" step="0.5" value={lcdFontSize} onChange={e => { setManualFont(true); saveCal('fontSize', +e.target.value); setLcdFontSize(+e.target.value); }} />
                <span className="retro-val">{lcdFontSize}</span>
              </div>
              <button className="retro-save-inline" onClick={handleSave}>
                <Download size={14} /> {t("detail.saveImage")}
              </button>
              <div className="retro-ctrl-flex">
                <button className="retro-reset-btn" onClick={() => { const v = { left: 28.1, top: 20.4, width: 45.4, height: 40.9, padTop: 10, padBottom: 18, fontSize: 16 }; window.localStorage.setItem('bunnyDiary_retroCal', JSON.stringify(v)); setLcdLeft(v.left); setLcdTop(v.top); setLcdWidth(v.width); setLcdHeight(v.height); setLcdPadTop(v.padTop); setLcdPadBottom(v.padBottom); setManualFont(false); }}>重置</button>
              </div>
            </div>
          </>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex justify-center">
          <Button variant="ghost" onClick={() => navigate(routes.home)}>
            <ArrowLeft className="h-4 w-4" />
            {t("common.home")}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
