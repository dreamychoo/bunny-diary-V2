import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { I18nProvider } from "./i18n";
import { isOnboardingDone, markOnboardingDone, migrateLegacyEntries } from "./lib/storage";
import { routes } from "./routes";
import Home from "./pages/Home";
import { OnboardingOverlay } from "./components/OnboardingOverlay";

const BunnyGarden = lazy(() => import("./pages/BunnyGarden"));
const CollectionRoom = lazy(() => import("./pages/CollectionRoom"));
const BunnyLetterDetail = lazy(() => import("./pages/BunnyLetterDetail"));
const EmotionRescue = lazy(() => import("./pages/EmotionRescue"));
const DailyWarmth = lazy(() => import("./pages/DailyWarmth"));
const JournalEntryDetail = lazy(() => import("./pages/JournalEntryDetail"));
const PastJournalList = lazy(() => import("./pages/PastJournalList"));
const DiaryLayout = lazy(() => import("./pages/DiaryLayout"));
const Settings = lazy(() => import("./pages/Settings"));

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="mx-auto mt-20 max-w-[200px] text-center font-display text-sm text-[#8d817a]">🐇</div>}>
      {children}
    </Suspense>
  );
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    migrateLegacyEntries();
    setShowOnboarding(!isOnboardingDone());
    setCheckingOnboarding(false);
  }, []);

  function handleOnboardingComplete() {
    markOnboardingDone();
    setShowOnboarding(false);
  }

  return (
    <I18nProvider>
      {!checkingOnboarding && showOnboarding && (
        <OnboardingOverlay open={showOnboarding} onComplete={handleOnboardingComplete} />
      )}
      <Routes>
        <Route path={routes.home} element={<Home />} />
        <Route path={routes.bunnyGarden} element={<Lazy><BunnyGarden /></Lazy>} />
        <Route path={routes.collection} element={<Lazy><CollectionRoom /></Lazy>} />
        <Route path="/bunny-letter/:id" element={<Lazy><BunnyLetterDetail /></Lazy>} />
        <Route path={routes.emotionRescue} element={<Lazy><EmotionRescue /></Lazy>} />
        <Route path={routes.dailyWarmth} element={<Lazy><DailyWarmth /></Lazy>} />
        <Route path={routes.pastJournals} element={<Lazy><PastJournalList /></Lazy>} />
        <Route path={routes.diaryLayout(":id")} element={<Lazy><DiaryLayout /></Lazy>} />
        <Route path="/journal-entry/:id" element={<Lazy><JournalEntryDetail /></Lazy>} />
        <Route path="/journal-entry" element={<Navigate to={routes.pastJournals} replace />} />
        <Route path={routes.settings} element={<Lazy><Settings /></Lazy>} />
        <Route path="*" element={<Navigate to={routes.home} replace />} />
      </Routes>
    </I18nProvider>
  );
}
