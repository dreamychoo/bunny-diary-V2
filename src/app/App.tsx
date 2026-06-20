import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { I18nProvider } from "./i18n";
import { migrateLegacyEntries } from "./lib/storage";
import { routes } from "./routes";
import Home from "./pages/Home";
import BunnyGarden from "./pages/BunnyGarden";
import CollectionRoom from "./pages/CollectionRoom";
import BunnyLetterDetail from "./pages/BunnyLetterDetail";
import EmotionRescue from "./pages/EmotionRescue";
import DailyWarmth from "./pages/DailyWarmth";
import JournalEntryDetail from "./pages/JournalEntryDetail";
import PastJournalList from "./pages/PastJournalList";
import Settings from "./pages/Settings";

export default function App() {
  useEffect(() => {
    migrateLegacyEntries();
  }, []);

  return (
    <I18nProvider>
      <Routes>
        <Route path={routes.home} element={<Home />} />
        <Route path={routes.bunnyGarden} element={<BunnyGarden />} />
        <Route path={routes.collection} element={<CollectionRoom />} />
        <Route path="/bunny-letter/:id" element={<BunnyLetterDetail />} />
        <Route path={routes.emotionRescue} element={<EmotionRescue />} />
        <Route path={routes.dailyWarmth} element={<DailyWarmth />} />
        <Route path={routes.pastJournals} element={<PastJournalList />} />
        <Route path="/journal-entry/:id" element={<JournalEntryDetail />} />
        <Route path="/journal-entry" element={<Navigate to={routes.pastJournals} replace />} />
        <Route path={routes.settings} element={<Settings />} />
        <Route path="*" element={<Navigate to={routes.home} replace />} />
      </Routes>
    </I18nProvider>
  );
}
