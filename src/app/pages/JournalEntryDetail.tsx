import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Leaf, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Mascot } from "../components/Mascot";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useI18n } from "../i18n";
import { deleteEntry, emotionKeys, getEntryById, getEntryGardenAttachment, moodKeys, symptomKeys, weatherKeys } from "../lib/storage";
import { routes } from "../routes";

function formatDate(timestamp: string, language: string) {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(timestamp));
}

function optionLabel(value: string, prefix: string, knownValues: readonly string[], t: (key: string) => string) {
  return knownValues.includes(value) ? t(`${prefix}.${value}`) : value;
}

function Field({ label, value }: { label: string; value?: string | number }) {
  const content = String(value ?? "");
  if (!content) return null;

  return (
    <div className="hand-line rounded-[18px] bg-[#ffffff] p-5">
      <p className="text-sm font-bold text-[#4a3b34]">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#7f6b62]">{content}</p>
    </div>
  );
}

function detailTone(type: "emotion" | "warmth") {
  return type === "emotion"
    ? "border-[#e5c8c4]/60 bg-[#f8efee]"
    : "border-[#e6c779]/60 bg-[#fbf3dc]";
}

export default function JournalEntryDetail() {
  const { language, t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const entry = id ? getEntryById(id) : null;
  const gardenAttachment = entry ? getEntryGardenAttachment(entry.id) : null;

  if (!entry) {
    return (
      <AppShell title={t("detail.notFoundTitle")} subtitle={t("detail.notFoundSubtitle")} headerMascotVariant="waiting">
        <Card className="border-[#afc3d8]/60 bg-[#eef5fb] p-6 text-center">
          <Mascot variant="empty" className="mx-auto mb-4 w-24 opacity-80" />
          <p className="text-sm leading-7 text-[#7f746e]">{t("detail.notFoundBody")}</p>
          <Link className="mt-5 inline-block" to={routes.pastJournals}>
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              {t("common.backToPastJournals")}
            </Button>
          </Link>
        </Card>
      </AppShell>
    );
  }

  function handleDelete() {
    if (!entry) return;
    deleteEntry(entry.id);
    navigate(routes.pastJournals);
  }

  return (
    <AppShell
      title={entry.type === "emotion" ? t("detail.emotionTitle") : t("detail.warmthTitle")}
      headerMascotVariant={entry.type === "emotion" ? "listening" : "warmth"}
    >
      <Card className={`p-6 ${detailTone(entry.type)}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d8d3cc]/45 bg-[#ffffff] px-4 py-2 text-sm font-bold">
              <CalendarDays className="h-4 w-4" />
              {formatDate(entry.timestamp, language)}
            </p>
            <p className="mt-3 break-all text-sm text-[#7f746e]">
              {t("common.entryId")}: {entry.id}
            </p>
          </div>
          {confirmingDelete ? (
            <div className="flex flex-wrap gap-2 rounded-3xl bg-[#fff3f1] p-2 sm:justify-end">
              {gardenAttachment?.seed && <p className="w-full px-2 text-left text-xs leading-5 text-[#8a615a]">{t("detail.deleteGardenWarning")}</p>}
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                {t("common.deleteForever")}
              </Button>
              <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>
                {t("common.cancel")}
              </Button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="h-4 w-4" />
              {t("common.delete")}
            </Button>
          )}
        </div>

        <div className="mt-6 grid gap-4">
          {entry.type === "emotion" ? (
            <>
              <Field label={t("detail.emotions")} value={entry.emotions.map((emotion) => optionLabel(emotion, "emotionKey", emotionKeys, t)).join(", ")} />
              <Field label={t("detail.symptoms")} value={entry.symptoms.map((symptom) => optionLabel(symptom, "symptomKey", symptomKeys, t)).join(", ")} />
              <Field label={t("detail.intensity")} value={`${entry.intensity}/10`} />
              <Field label={t("detail.whatHappened")} value={entry.whatHappened} />
              <Field label={t("detail.childhood")} value={entry.childhood} />
              <Field label={t("detail.belief")} value={entry.beliefs} />
            </>
          ) : (
            <>
              <Field label={t("detail.mood")} value={optionLabel(entry.mood, "moodKey", moodKeys, t)} />
              <Field label={t("detail.weather")} value={optionLabel(entry.weather, "weatherKey", weatherKeys, t)} />
              <Field label={t("detail.gratitude")} value={entry.gratitude} />
              <Field label={t("detail.success")} value={entry.success} />
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="ghost" onClick={() => navigate(routes.pastJournals)}>
            <ArrowLeft className="h-4 w-4" />
            {t("common.backToPastJournals")}
          </Button>
          <Button variant="secondary" onClick={() => navigate(routes.bunnyGarden)}>
            <Leaf className="h-4 w-4" />
            {t("common.viewGarden")}
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}
