import { FormEvent, useState } from "react";
import { Download, Save, Trash2 } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useI18n } from "../i18n";
import { languageNames, Language } from "../i18n/translations";
import { clearAllDiaryData, exportDiaryData, getSettings, saveSettings } from "../lib/storage";

export default function Settings() {
  const { language, setLanguage, t } = useI18n();
  const [bunnyName, setBunnyName] = useState(() => getSettings().bunnyName);
  const [message, setMessage] = useState("");
  const [confirmingClear, setConfirmingClear] = useState(false);

  function handleSave(event: FormEvent) {
    event.preventDefault();
    saveSettings({ bunnyName: bunnyName.trim() || "Bunny", language });
    setMessage(t("settings.saved"));
  }

  function handleExport() {
    const data = exportDiaryData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bunny-diary-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    clearAllDiaryData();
    setBunnyName("Bunny");
    setLanguage("en");
    setConfirmingClear(false);
    setMessage(t("settings.cleared"));
  }

  return (
    <AppShell title={t("settings.title")} subtitle={t("settings.subtitle")} headerMascotVariant="waiting">
      <div className="grid gap-5">
        <Card className="p-6">
          <form onSubmit={handleSave} className="grid gap-4">
            <div>
              <Label htmlFor="bunnyName">{t("settings.bunnyName")}</Label>
              <Input id="bunnyName" value={bunnyName} onChange={(event) => setBunnyName(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="language">{t("settings.language")}</Label>
              <select
                id="language"
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value as Language);
                  setMessage("");
                }}
                className="mt-2 h-11 w-full rounded-[16px] border border-[rgba(217,205,197,0.5)] bg-[rgba(255,255,255,0.8)] px-4 text-sm font-bold text-[var(--ink)] shadow-[inset_0_2px_0_rgba(78,59,49,0.03)] outline-none transition focus:border-[var(--pink)] focus:ring-4 focus:ring-[var(--pink-soft)] sm:max-w-xs"
              >
                <option value="en">{languageNames.en}</option>
                <option value="zh">{languageNames.zh}</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit">
                <Save className="h-4 w-4" />
                {t("settings.save")}
              </Button>
              {message && <p className="text-sm font-bold text-[#728a64]">{message}</p>}
            </div>
          </form>
        </Card>

        <Card className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="rounded-[20px] bg-[var(--pink-soft)] p-4">
            <h2 className="text-xl font-bold text-[var(--ink)]">{t("settings.exportTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t("settings.exportBody")}</p>
            <Button className="mt-4" variant="secondary" onClick={handleExport}>
              <Download className="h-4 w-4" />
              {t("settings.exportButton")}
            </Button>
          </div>

          <div className="rounded-[20px] bg-[#fff0f2]/70 p-4">
            <h2 className="text-xl font-bold text-[var(--ink)]">{t("settings.clearTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t("settings.clearBody")}</p>
            {confirmingClear ? (
              <div className="mt-4 flex flex-wrap gap-2 rounded-3xl bg-[#fff3f1] p-2">
                <Button variant="danger" onClick={handleClear}>
                  <Trash2 className="h-4 w-4" />
                  {t("settings.confirmClear")}
                </Button>
                <Button variant="ghost" onClick={() => setConfirmingClear(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            ) : (
              <Button className="mt-4" variant="danger" onClick={() => setConfirmingClear(true)}>
                <Trash2 className="h-4 w-4" />
                {t("settings.clearButton")}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
