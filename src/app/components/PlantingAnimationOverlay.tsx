import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";
import { useI18n } from "../i18n";

const frameSources = [
  "/animations/planting/01-seed-drop.png",
  "/animations/planting/03-pat-soil.png",
  "/animations/planting/02-seed-plant.png",
  "/animations/planting/04-sprout-glow.png"
] as const;

const frameChangeTimeline = [320, 680, 1100] as const;
const contentRevealDelay = 1600;

type PlantingAnimationOverlayProps = {
  open: boolean;
  variant?: "save-success" | "planted-success";
  tone?: "feeling" | "warmth";
  onPrimary: () => void;
  onSecondary?: () => void;
};

type Sparkle = {
  id: number;
  dx: number;
  dy: number;
  color: string;
  size: number;
  delay: number;
};

export function PlantingAnimationOverlay({
  open,
  variant = "save-success",
  tone = "feeling",
  onPrimary,
  onSecondary
}: PlantingAnimationOverlayProps) {
  const { t } = useI18n();
  const [frameIndex, setFrameIndex] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Preload images only when opening
      const images = frameSources.map((src) => {
        const image = new Image();
        image.src = src;
        return image;
      });
      // Focus the dialog after render
      requestAnimationFrame(() => dialogRef.current?.focus());
      return () => {
        images.forEach((image) => {
          image.src = "";
        });
        // Restore focus when closing
        previousFocusRef.current?.focus();
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setFrameIndex(0);
      setShowContent(false);
      setSparkles([]);
      return;
    }

    const frameOneTimer = window.setTimeout(() => setFrameIndex(1), frameChangeTimeline[0]);
    const frameTwoTimer = window.setTimeout(() => setFrameIndex(2), frameChangeTimeline[1]);
    const frameThreeTimer = window.setTimeout(() => setFrameIndex(3), frameChangeTimeline[2]);
    const contentTimer = window.setTimeout(() => {
      setShowContent(true);
      // Burst of sparkles with varied sizes and delays
      const colors = ["#ffc2a8", "#ffd7c4", "#ffe5d9", "#ff9aaa", "#ffb3c6"];
      const burst = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        dx: (Math.random() - 0.5) * 120,
        dy: -(Math.random() * 100 + 20),
        color: colors[i % colors.length],
        size: 6 + Math.random() * 6,
        delay: Math.random() * 120
      }));
      setSparkles(burst);
    }, contentRevealDelay);

    return () => {
      window.clearTimeout(frameOneTimer);
      window.clearTimeout(frameTwoTimer);
      window.clearTimeout(frameThreeTimer);
      window.clearTimeout(contentTimer);
    };
  }, [open]);

  const imageAlt = useMemo(() => t("planting.imageAlt"), [t]);
  const titleKey =
    variant === "planted-success"
      ? "planting.planted.title"
      : tone === "warmth"
        ? "planting.saveWarmth.title"
        : "planting.saveFeeling.title";
  const subtitleKey =
    variant === "planted-success"
      ? "planting.planted.subtitle"
      : tone === "warmth"
        ? "planting.saveWarmth.subtitle"
        : "planting.saveFeeling.subtitle";
  const primaryKey =
    variant === "planted-success"
      ? "planting.planted.primary"
      : tone === "warmth"
        ? "planting.saveWarmth.primary"
        : "planting.saveFeeling.primary";
  const secondaryKey =
    variant === "planted-success"
      ? null
      : tone === "warmth"
        ? "planting.saveWarmth.secondary"
        : "planting.saveFeeling.secondary";

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t(titleKey)}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)] px-5 py-6"
      onKeyDown={(e) => { if (e.key === "Escape" && secondaryKey && onSecondary) onSecondary(); }}
    >
      <div className="w-full max-w-[22rem] text-center">
        <div className="relative mx-auto h-[220px] w-[260px]">
          <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-[var(--bg)]">
            {frameSources.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={index === frameIndex ? imageAlt : ""}
                aria-hidden={index !== frameIndex}
                className={cn(
                  "absolute inset-0 h-full w-full object-contain transition-opacity duration-150 ease-out",
                  index === frameIndex ? "opacity-100" : "opacity-0"
                )}
              />
            ))}
          </div>
          {/* Sparkle burst — start from lower-left of the image */}
          {sparkles.map((s) => (
            <span
              key={s.id}
              className="sparkle-dot"
              style={{
                left: "38%",
                top: "62%",
                background: s.color,
                "--dx": `${s.dx}px`, "--dy": `${s.dy}px`,
                "--size": `${s.size}px`,
                "--delay": `${s.delay}ms`
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div
          className={cn(
            "transition-all duration-300 ease-out",
            showContent ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          )}
        >
          <p className="font-display text-[26px] font-bold leading-[34px] text-[var(--ink)]">{t(titleKey)}</p>
          <p className="mt-2 text-[15px] leading-[24px] text-[var(--muted)]">{t(subtitleKey)}</p>

          <div className="mt-6 flex flex-col items-center">
            <Button type="button" className="h-[52px] w-full max-w-[312px]" onClick={onPrimary}>
              {t(primaryKey)}
            </Button>
            {secondaryKey && onSecondary && (
              <Button
                type="button"
                variant="ghost"
                className="mt-3 min-h-0 rounded-none px-0 py-0 text-[15px] font-semibold text-[#6d5c53] hover:border-transparent hover:bg-transparent hover:text-[#4a3b34]"
                onClick={onSecondary}
              >
                {t(secondaryKey)}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
