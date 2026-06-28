import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, Settings, Sparkles } from "lucide-react";
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
  const inJournal = location.pathname.startsWith("/journal-entry/") || location.pathname.startsWith("/diary-layout/") || location.pathname.startsWith("/bunny-letter/");
  const showTabBar = !isSettings && !inJournal;

  useEffect(() => {
    return () => {
      if (bunnyTapResetRef.current !== null) window.clearTimeout(bunnyTapResetRef.current);
      if (bunnyTimerRef.current !== null) window.clearTimeout(bunnyTimerRef.current);
    };
  }, []);

  const showBunnyMessage = () => {
    const lines = [t("home.bunnyHelloAgain"), t("home.bunnyThanksForVisiting"), t("home.bunnyNiceToSeeYou")];
    setBunnyMessage(lines[Math.floor(Math.random() * lines.length)]);
    if (bunnyTimerRef.current !== null) window.clearTimeout(bunnyTimerRef.current);
    bunnyTimerRef.current = window.setTimeout(() => setBunnyMessage(null), 1000);
  };

  const handleBunnyTap = () => {
    bunnyTapCountRef.current += 1;
    if (bunnyTapResetRef.current !== null) window.clearTimeout(bunnyTapResetRef.current);
    if (bunnyTapCountRef.current >= 3) {
      bunnyTapCountRef.current = 0;
      showBunnyMessage();
      return;
    }
    bunnyTapResetRef.current = window.setTimeout(() => { bunnyTapCountRef.current = 0; }, 900);
  };

  return (
    <main className="relative min-h-[100dvh] overflow-x-clip px-4 pb-[92px] pt-3 text-[var(--ink)] sm:px-6 sm:pb-[100px] sm:pt-5">
      {isSettings && (
        <Link to={routes.home} className="absolute left-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-[#d9cdc5]/50 bg-white/82 text-[#6f6158] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:bg-white active:scale-[0.98] sm:left-5 sm:top-6 sm:h-12 sm:w-12" aria-label={t("common.home")}>
          <HomeIcon className="h-5 w-5" />
        </Link>
      )}
      {!isSettings && (
        <Link to={routes.settings} className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-[#d9cdc5]/50 bg-white/82 text-[#6f6158] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:bg-white active:scale-[0.98] sm:right-5 sm:top-6 sm:h-12 sm:w-12" aria-label={t("nav.settings")}>
          <Settings className="h-5 w-5" />
        </Link>
      )}

      <div className={cn("mx-auto flex w-full flex-col", wide ? "max-w-[1040px]" : "max-w-[520px]", showBrand ? "min-h-[calc(100dvh-52px)] justify-center py-6 sm:justify-start sm:py-0" : "min-h-[calc(100dvh-52px)] pt-3 sm:pt-4")}>
        {showBrand && (
          <div className="sticky top-0 z-10 -mx-4 flex flex-col items-center gap-3 bg-[#faf9f7]/95 px-4 pb-4 pt-3 text-center backdrop-blur-sm sm:static sm:mx-0 sm:bg-transparent sm:px-4 sm:pb-5 sm:pt-0 sm:backdrop-blur-none">
            <button type="button" onClick={handleBunnyTap} className="relative grid h-[6.25rem] w-[8.75rem] place-items-center outline-none transition-transform duration-200 ease-out hover:-translate-y-0.5 sm:h-[10.5rem] sm:w-[13.5rem]" aria-label={t("app.title")}>
              <Mascot variant="reading" className="h-[6.25rem] w-[8.75rem] object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.035)] sm:h-[10.5rem] sm:w-[13.5rem]" />
              <Sparkles className="absolute right-0 top-3 h-3 w-3 text-[#e6c779] sm:right-4 sm:top-7 sm:h-4 sm:w-4" />
              {bunnyMessage && (
                <span className="pointer-events-none absolute left-[calc(100%+0.35rem)] top-[44%] z-10 inline-flex max-w-[6.9rem] -translate-y-1/2 items-center rounded-[14px] border border-[#e8dfd6] bg-[#fffdf9]/96 px-2.5 py-1.5 text-left text-[10px] font-medium leading-[1.2] text-[#7c6f67] shadow-[0_4px_14px_rgba(0,0,0,0.06)] sm:left-[calc(100%+0.55rem)] sm:max-w-[8rem] sm:rounded-[16px] sm:px-3 sm:text-xs">
                  <span className="absolute -left-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-b border-l border-[#e8dfd6] bg-[#fffdf9]/96" />
                  <span className="relative">{bunnyMessage}</span>
                </span>
              )}
            </button>
            <p className="font-display -mt-2 text-[1.66rem] font-semibold leading-[0.95] text-[#241b18] sm:-mt-1 sm:text-[2.9rem] sm:font-bold">{t("app.title")}</p>
            <p className="font-hand -mt-1 max-w-[14rem] text-[10px] italic leading-[1.2] text-[#7f746e] sm:max-w-[18rem] sm:text-sm sm:leading-5">{t("app.tagline")}</p>
            {brandAction}
          </div>
        )}

        {(title || subtitle) && (
          <section className="relative mb-2 px-1 sm:mb-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center">
                <Mascot variant={headerMascotVariant} className="h-20 w-20 object-contain" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                {title && <h1 className="text-[22px] font-extrabold tracking-tight leading-[1.1] text-[var(--ink)]">{title}</h1>}
                {subtitle && <p className="mt-1 whitespace-pre-line text-sm leading-[1.5] text-[#9b8f87] sm:text-[15px]">{subtitle}</p>}
              </div>
            </div>
          </section>
        )}

        <div className="flex-1">{children}</div>
      </div>

      {/* Bottom tab bar */}
      {showTabBar && (
        <nav className="bunny-tabbar" aria-label={t("garden.nav.label")}>
          {[
            { to: routes.home, label: t("nav.home") },
            { to: routes.bunnyGarden, label: t("garden.nav.garden") },
            { to: routes.collection, label: t("garden.nav.collection") },
            { to: routes.pastJournals, label: t("garden.nav.memories") },
          ].map((tab) => {
            const active = location.pathname === tab.to || (tab.to === routes.collection && location.pathname.startsWith("/bunny-letter/"));
            return (
              <Link key={tab.to} to={tab.to} className={active ? "active" : ""}>
                {tab.to === routes.home && (
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
                )}
                {tab.to === routes.bunnyGarden && (
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 21V9"/><path d="M12 9C9 5 5 5 3 8c3 0 6 2 9 6"/><path d="M12 9c3-4 7-4 9-1-3 0-6 2-9 6"/></svg>
                )}
                {tab.to === routes.collection && (
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.9-5.4 2.9 1-6-4.4-4.3 6.1-.9z"/></svg>
                )}
                {tab.to === routes.pastJournals && (
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="5" y="4" width="14" height="16" rx="3"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>
                )}
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </main>
  );
}
