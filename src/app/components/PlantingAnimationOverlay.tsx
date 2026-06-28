import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    const images = frameSources.map((src) => {
      const image = new Image();
      image.src = src;
      return image;
    });

    return () => {
      images.forEach((image) => {
        image.src = "";
      });
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setFrameIndex(0);
      setShowContent(false);
      return;
    }

    const frameOneTimer = window.setTimeout(() => setFrameIndex(1), frameChangeTimeline[0]);
    const frameTwoTimer = window.setTimeout(() => setFrameIndex(2), frameChangeTimeline[1]);
    const frameThreeTimer = window.setTimeout(() => setFrameIndex(3), frameChangeTimeline[2]);
    const contentTimer = window.setTimeout(() => setShowContent(true), contentRevealDelay);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fdf8f2]/94 px-5 py-6 backdrop-blur-[2px]">
      <div className="w-full max-w-[22rem] text-center">
        <div className="relative mx-auto h-[220px] w-[260px] overflow-hidden">
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
