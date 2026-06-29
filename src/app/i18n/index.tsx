import { createContext, useContext, useMemo, useState } from "react";
import { getSettings, saveLanguage } from "../lib/storage";
import { Language, translations } from "./translations";

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => getSettings().language);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    saveLanguage(nextLanguage);
  }

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key: string, params?: Record<string, string | number>) => {
        const currentTranslations = translations[language] as Record<string, string>;
        const fallbackTranslations = translations.en as Record<string, string>;
        const template = String(currentTranslations[key] ?? fallbackTranslations[key] ?? key);
        if (!params) return template;
        return Object.entries(params).reduce<string>(
          (message, [name, value]) => message.split(`{${name}}`).join(String(value)),
          template
        );
      }
    }),
    [language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
