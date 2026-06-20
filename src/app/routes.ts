export const routes = {
  home: "/",
  emotionRescue: "/emotion-rescue",
  dailyWarmth: "/daily-warmth",
  bunnyGarden: "/bunny-garden",
  collection: "/collection",
  letter: (id: string) => `/bunny-letter/${id}`,
  pastJournals: "/past-journals",
  journalEntry: (id: string) => `/journal-entry/${id}`,
  settings: "/settings"
};
