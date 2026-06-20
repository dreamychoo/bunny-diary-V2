import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Settings, Sparkles } from "lucide-react";
import { useI18n } from "../i18n";
import { routes } from "../routes";
import { Mascot } from "./Mascot";
import type { MascotVariant } from "./Mascot";
import { cn } from "./ui/utils";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerMascotVariant?: MascotVariant;
  showBrand?: boolean;
  brandAction?: React.ReactNode;
  wide?: boolean;
};

export function AppShell({ children, title, subtitle, headerMascotVariant = "reading", showBrand = false, brandAction, wide = false }: AppShellProps) {
  const { t } = useI18n();
  const location = useLocation();
  const isHome = location.pathname === routes.home;
  const isSettings = location.pathname === routes.settings;
  const [bunnyMessage, setBunnyMessage] = useState<string | null>(null);
  const bunnyTapCountRef = useRef(0);
  const bunnyTapResetRef = useRef<number | null>(null);
  const bunnyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (bunnyTapResetRef.current !== null) {
        window.clearTimeout(bunnyTapResetRef.current);
      }
      if (bunnyTimerRef.current !== null) {
        window.clearTimeout(bunnyTimerRef.current);
      }
    };
  }, []);

  const showBunnyMessage = () => {
    const lines = [t("home.bunnyHelloAgain"), t("home.bunnyThanksForVisiting"), t("home.bunnyNiceToSeeYou")];
    const nextMessage = lines[Math.floor(Math.random() * lines.length)];
    setBunnyMessage(nextMessage);

    if (bunnyTimerRef.current !== null) {
      window.clearTimeout(bunnyTimerRef.current);
    }

    bunnyTimerRef.current = window.setTimeout(() => {
      setBunnyMessage(null);
    }, 1000);
  };

  const handleBunnyTap = () => {
    bunnyTapCountRef.current += 1;

    if (bunnyTapResetRef.current !== null) {
      window.clearTimeout(bunnyTapResetRef.current);
    }

    if (bunnyTapCountRef.current >= 3) {
      bunnyTapCountRef.current = 0;
      showBunnyMessage();
      return;
    }

    bunnyTapResetRef.current = window.setTimeout(() => {
      bunnyTapCountRef.current = 0;
    }, 900);
  };

  return (
    <main className="relative min-h-[100dvh] overflow-x-clip px-4 pb-6 pt-3 text-[#4a3b34] sm:px-6 sm:pb-8 sm:pt-6">
      <span className="pointer-events-none absolute right-[7%] top-[21%] h-6 w-12 rotate-[8deg] rounded-[5px] border border-[#dbe7d2] bg-[#f0f6ec]/70 sm:right-[9%]" />
      {!isHome && (
        <Link
          to={routes.home}
          className="absolute left-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-[#d8d3cc] bg-[#ffffff]/88 text-[#6f6158] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:bg-[#ffffff] active:scale-[0.98] sm:left-5 sm:top-6 sm:h-12 sm:w-12"
          aria-label={t("common.home")}
        >
          <Home className="h-5 w-5" />
        </Link>
      )}
      {!isSettings && (
        <Link
          to={routes.settings}
          className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-[#d8d3cc] bg-[#ffffff]/88 text-[#6f6158] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:bg-[#ffffff] active:scale-[0.98] sm:right-5 sm:top-6 sm:h-12 sm:w-12"
          aria-label={t("nav.settings")}
        >
          <Settings className="h-5 w-5" />
        </Link>
      )}

      <div
        className={cn(
          "mx-auto flex w-full flex-col",
          wide ? "max-w-[1040px]" : "max-w-[520px]",
          showBrand
            ? "min-h-[calc(100dvh-52px)] justify-center py-6 sm:justify-start sm:py-0"
            : "min-h-[calc(100dvh-52px)] pt-12 sm:pt-14"
        )}
      >
        {showBrand && (
          <div className="sticky top-0 z-10 -mx-4 flex flex-col items-center gap-3 bg-[#faf9f7]/95 px-4 pb-4 pt-3 text-center backdrop-blur-sm sm:static sm:mx-0 sm:bg-transparent sm:px-4 sm:pb-5 sm:pt-0 sm:backdrop-blur-none">
            <button
              type="button"
              onClick={handleBunnyTap}
              className="relative grid h-[6.25rem] w-[8.75rem] place-items-center outline-none transition-transform duration-200 ease-out hover:-translate-y-0.5 sm:h-[10.5rem] sm:w-[13.5rem]"
              aria-label={t("app.title")}
            >
              <Mascot variant="reading" className="h-[6.25rem] w-[8.75rem] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.035)] sm:h-[10.5rem] sm:w-[13.5rem]" />
              <Sparkles className="absolute right-0 top-3 h-3 w-3 text-[#e6c779] sm:right-4 sm:top-7 sm:h-4 sm:w-4" />
              {bunnyMessage && (
                <span className="pointer-events-none absolute left-[calc(100%+0.35rem)] top-[44%] z-10 inline-flex max-w-[6.9rem] -translate-y-1/2 items-center rounded-[14px] border border-[#e8dfd6] bg-[#fffdf9]/96 px-2.5 py-1.5 text-left text-[10px] font-medium leading-[1.2] text-[#7c6f67] shadow-[0_4px_14px_rgba(0,0,0,0.06)] sm:left-[calc(100%+0.55rem)] sm:max-w-[8rem] sm:rounded-[16px] sm:px-3 sm:text-xs">
                  <span className="absolute -left-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-b border-l border-[#e8dfd6] bg-[#fffdf9]/96" />
                  <span className="relative">{bunnyMessage}</span>
                </span>
              )}
            </button>
            <p className="font-display -mt-2 text-[1.66rem] font-semibold leading-[0.95] text-[#4a3b34] sm:-mt-1 sm:text-[2.9rem] sm:font-bold">
              {t("app.title")}
            </p>
            <p className="font-hand -mt-1 max-w-[14rem] text-[10px] italic leading-[1.2] text-[#7f746e] sm:max-w-[18rem] sm:text-sm sm:leading-5">{t("app.tagline")}</p>
            {brandAction}
          </div>
        )}

        {(title || subtitle) && (
          <section className="relative mb-4 px-1 sm:mb-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16">
                <Mascot variant={headerMascotVariant} className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                {title && <h1 className="font-display text-[1.75rem] font-bold leading-[1.05] tracking-normal text-[#4a3b34] sm:text-[2rem]">{title}</h1>}
                {subtitle && <p className="mt-1 whitespace-pre-line text-sm leading-[1.5] text-[#7f746e] opacity-70 sm:text-[15px]">{subtitle}</p>}
              </div>
            </div>
          </section>
        )}

        <div className="flex-1">{children}</div>
      </div>
    </main>
  );
}
