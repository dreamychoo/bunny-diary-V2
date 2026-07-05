import { FormEvent, useRef, useState } from "react";
import { ArrowLeft, Download, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useI18n } from "../i18n";
import { languageNames, Language } from "../i18n/translations";
import { clearAllDiaryData, exportDiaryData, getSettings, importDiaryData, saveSettings } from "../lib/storage";
import { routes } from "../routes";

export default function Settings() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useI18n();
  const [bunnyName, setBunnyName] = useState(() => getSettings().bunnyName);
  const [message, setMessage] = useState("");
  const [confirmingClear, setConfirmingClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSave(event: FormEvent) {
    event.preventDefault();
    saveSettings({ bunnyName: bunnyName.trim() || "Bunny", language });
    setMessage(t("settings.saved"));
  }

  function handleExport() {
    const { md, json } = exportDiaryData();
    const date = new Date().toISOString().slice(0, 10);
    // Download Markdown (readable)
    const mdBlob = new Blob([`# 小兔日记 · 数据导出\n\n导出时间：${date}\n\n---\n\n${md}`], { type: "text/markdown;charset=utf-8" });
    const mdUrl = URL.createObjectURL(mdBlob);
    const mdLink = document.createElement("a");
    mdLink.href = mdUrl;
    mdLink.download = `bunny-diary-${date}.md`;
    mdLink.click();
    URL.revokeObjectURL(mdUrl);
    // Also offer JSON (for re-import)
    const jsonBlob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement("a");
    jsonLink.href = jsonUrl;
    jsonLink.download = `bunny-diary-${date}.json`;
    jsonLink.click();
    URL.revokeObjectURL(jsonUrl);
  }

  function handleClear() {
    // Auto-export backup before clearing
    try {
      const { md } = exportDiaryData();
      if (md.trim()) {
        const date = new Date().toISOString().slice(0, 10);
        const backup = new Blob([`# 小兔日记 · 数据备份（清除前自动导出）\n\n导出时间：${date}\n\n---\n\n${md}`], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(backup);
        const link = document.createElement("a");
        link.href = url;
        link.download = `bunny-diary-backup-${date}.md`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* backup best-effort */ }
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
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t("settings.exportBodyV2")}</p>
            <Button className="mt-4" variant="secondary" onClick={handleExport}>
              <Download className="h-4 w-4" />
              {t("settings.exportButton")}
            </Button>
          </div>

          <div className="rounded-[20px] bg-[#f4f0fb]/70 p-4">
            <h2 className="text-xl font-bold text-[var(--ink)]">{t("settings.importTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t("settings.importBody")}</p>
            <input type="file" accept=".json" ref={fileRef} className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                const ok = importDiaryData(reader.result as string);
                setMessage(t(ok ? "settings.importSuccess" : "settings.importFailed"));
                if (ok) setBunnyName(getSettings().bunnyName);
              };
              reader.readAsText(file);
              e.target.value = "";
            }} />
            <Button className="mt-4" variant="secondary" onClick={() => fileRef.current?.click()}>
              <Download className="h-4 w-4 rotate-180" />
              {t("settings.importButton")}
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
      <div className="mt-8 flex justify-center">
        <Button variant="ghost" onClick={() => navigate(routes.home)}>
          <ArrowLeft className="h-4 w-4" />
          {t("common.home")}
        </Button>
      </div>
    </AppShell>
  );
}
