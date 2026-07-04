import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "../i18n";
import { Mascot } from "./Mascot";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

type Slide = {
  mascotVariant?: "happy" | "writing" | "listening" | "garden" | "warmth" | "reading";
  mascotLarge?: boolean;
  titleKey: string;
  subtitleKey: string;
};

const SLIDES: Slide[] = [
  { mascotVariant: "happy", mascotLarge: true, titleKey: "onboarding.slide1.title", subtitleKey: "onboarding.slide1.subtitle" },
  { mascotVariant: "writing", titleKey: "onboarding.slide2.title", subtitleKey: "onboarding.slide2.subtitle" },
  { mascotVariant: "listening", titleKey: "onboarding.slide3.title", subtitleKey: "onboarding.slide3.subtitle" },
  { mascotVariant: "garden", titleKey: "onboarding.slide4.title", subtitleKey: "onboarding.slide4.subtitle" },
  { mascotVariant: "warmth", titleKey: "onboarding.slide5.title", subtitleKey: "onboarding.slide5.subtitle" },
  { titleKey: "onboarding.slide6.title", subtitleKey: "onboarding.slide6.subtitle" },
  { mascotVariant: "reading", titleKey: "onboarding.slide7.title", subtitleKey: "onboarding.slide7.subtitle" },
];

type Props = {
  open: boolean;
  onComplete: () => void;
};

export function OnboardingOverlay({ open, onComplete }: Props) {
  const { t } = useI18n();
  const [slideIndex, setSlideIndex] = useState(0);
  const animatingRef = useRef(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const goTo = useCallback((index: number) => {
    if (animatingRef.current) return;
    if (index < 0 || index >= SLIDES.length) return;
    animatingRef.current = true;
    setSlideIndex(index);
    setTimeout(() => { animatingRef.current = false; }, 350);
  }, []);

  const goNext = useCallback(() => goTo(slideIndex + 1), [goTo, slideIndex]);
  const goPrev = useCallback(() => goTo(slideIndex - 1), [goTo, slideIndex]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg)] px-4 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label={t(SLIDES[slideIndex]?.titleKey || "onboarding.slide1.title")}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
      }}
      onTouchMove={(e) => {
        const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
        const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
        if (deltaX > deltaY) e.preventDefault();
      }}
      onTouchEnd={(e) => {
        const endX = e.changedTouches[0].clientX;
        const deltaX = endX - touchStartX.current;
        if (Math.abs(deltaX) < 50) return;
        if (deltaX < 0) goNext();
        else goPrev();
      }}
    >
      {/* Skip button */}
      <div className="flex shrink-0 justify-end pt-2 sm:pt-3">
        <button
          type="button"
          onClick={onComplete}
          className="rounded-full px-4 py-2 text-sm font-bold text-[#9b8f87] transition hover:bg-white/60 hover:text-[#6f6158] active:scale-[0.97]"
        >
          {t("onboarding.skip")}
        </button>
      </div>

      {/* Slide track */}
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div
          className="flex transition-transform duration-400 ease-out will-change-transform"
          style={{ transform: `translateX(-${slideIndex * 100}%)` }}
        >
          {SLIDES.map((slide, i) => (
            <div key={i} className="flex w-full shrink-0 items-center justify-center px-2">
              <div className="flex w-full max-w-[400px] flex-col items-center text-center">
                {/* Mascot */}
                {slide.mascotLarge && slide.mascotVariant && (
                  <div className="relative mb-6">
                    <Mascot variant={slide.mascotVariant} className="h-[200px] w-[200px] object-contain drop-shadow-[0_14px_20px_rgba(129,74,64,0.17)] sm:h-[220px] sm:w-[220px]" />
                  </div>
                )}
                {!slide.mascotLarge && slide.mascotVariant && (
                  <div className="mb-5 flex w-full items-center justify-center gap-0 -ml-4 sm:-ml-6">
                    <Mascot variant={slide.mascotVariant} className="mr-2 h-[90px] w-[90px] shrink-0 object-contain sm:mr-3 sm:h-[100px] sm:w-[100px]" />
                    <div className="min-w-0 flex-1 max-w-[260px] sm:max-w-[290px]">
                      <h2 className="font-display text-xl font-bold leading-[1.2] text-[var(--ink)] sm:text-2xl">{t(slide.titleKey)}</h2>
                      <p className="mt-2 text-sm leading-[1.6] text-[#9b8f87] sm:text-[15px]">{t(slide.subtitleKey)}</p>
                    </div>
                  </div>
                )}
                {/* Slide 5: no mascot, centered text */}
                {!slide.mascotVariant && (
                  <>
                    <h2 className="font-display text-[26px] font-bold leading-[1.15] text-[var(--ink)] sm:text-[30px]">{t(slide.titleKey)}</h2>
                    <p className="mt-3 max-w-[260px] text-sm leading-[1.6] text-[#9b8f87] sm:text-[15px]">{t(slide.subtitleKey)}</p>
                  </>
                )}
                {/* Slide 1-4 with centered mascot: text below */}
                {slide.mascotLarge && (
                  <div className="text-center">
                    <h2 className="font-display text-[22px] font-bold leading-[1.2] text-[var(--ink)] sm:text-[26px]">{t(slide.titleKey)}</h2>
                    <p className="mt-2 max-w-[260px] text-sm leading-[1.6] text-[#9b8f87] sm:text-[15px]">{t(slide.subtitleKey)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots + bottom controls */}
      <div className="flex shrink-0 flex-col items-center gap-4 pb-8 pt-2 sm:pb-10">
        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === slideIndex ? "w-6 bg-[var(--pink)]" : "w-2 bg-[#d9cdc5]/60 hover:bg-[#d9cdc5]"
              )}
            />
          ))}
        </div>

        {/* Next / Start button */}
        <div className="flex w-full max-w-[320px] items-center justify-center gap-3">
          {slideIndex > 0 && (
            <button
              type="button"
              onClick={goPrev}
              className="grid h-12 w-12 place-items-center rounded-full border border-[#d9cdc5]/50 bg-white/82 text-[#6f6158] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:bg-white active:scale-[0.97]"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {slideIndex < SLIDES.length - 1 ? (
            <Button type="button" onClick={goNext} className="flex-1">
              {t("onboarding.next")}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={onComplete} className="w-full py-3 text-base font-bold">
              {t("onboarding.start")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
