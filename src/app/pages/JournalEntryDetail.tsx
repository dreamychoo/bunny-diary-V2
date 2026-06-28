import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, ImageIcon, Leaf, Pencil, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Mascot } from "../components/Mascot";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../components/ui/utils";
import { useI18n } from "../i18n";
import { deleteEntry, emotionKeys, getEntryById, getEntryGardenAttachment, getAllEntries, setEmotionEntries, setWarmthEntries, moodKeys, symptomKeys, weatherKeys } from "../lib/storage";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const entry = id ? getEntryById(id) : null;
  const gardenAttachment = entry ? getEntryGardenAttachment(entry.id) : null;

  const isWithin48h = entry ? Date.now() - new Date(entry.timestamp).getTime() < 48 * 60 * 60 * 1000 : false;

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

  function startEditing() {
    const text = entry.type === "warmth"
      ? `${entry.gratitude}${entry.success ? "\n" + entry.success : ""}`
      : `${entry.whatHappened}${entry.childhood ? "\n\n" + entry.childhood : ""}${entry.beliefs ? "\n\n" + entry.beliefs : ""}`;
    setEditText(text.trim());
    setIsEditing(true);
    setConfirmingDelete(false);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditText("");
  }

  function saveEdit() {
    if (!entry || !editText.trim()) return;
    const allEntries = getAllEntries();
    const updated = allEntries.map((e) => {
      if (e.id !== entry.id) return e;
      if (entry.type === "warmth") {
        return { ...e, gratitude: editText, success: "" };
      }
      const lines = editText.split("\n\n");
      return {
        ...e,
        whatHappened: lines[0] || "",
        childhood: lines[1] || "",
        beliefs: lines[2] || ""
      };
    });
    setEmotionEntries(updated.filter((e): e is import("../lib/storage").EmotionEntry => e.type === "emotion"));
    setWarmthEntries(updated.filter((e): e is import("../lib/storage").WarmthEntry => e.type === "warmth"));
    setIsEditing(false);
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
            {isWithin48h && !isEditing && (
              <p className="mt-2 text-[11px] font-medium text-[#8a9f78]">{t("detail.editableHint")}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <Button variant="garden" onClick={saveEdit}>
                  <Save className="h-4 w-4" />
                  {t("detail.saveEdit")}
                </Button>
                <Button variant="ghost" onClick={cancelEditing}>
                  <X className="h-4 w-4" />
                  {t("detail.cancelEdit")}
                </Button>
              </>
            ) : confirmingDelete ? (
              <div className="flex flex-wrap gap-2 rounded-3xl bg-[#fff3f1] p-2">
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
              <>
                {isWithin48h && (
                  <Button variant="secondary" onClick={startEditing}>
                    <Pencil className="h-4 w-4" />
                    {t("detail.edit")}
                  </Button>
                )}
                <Button variant="danger" onClick={() => { setConfirmingDelete(true); setIsEditing(false); }}>
                  <Trash2 className="h-4 w-4" />
                  {t("common.delete")}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {entry.type === "emotion" ? (
            isEditing ? (
              <div className="rounded-[18px] bg-[#ffffff] p-5">
                <p className="text-sm font-bold text-[#4a3b34]">{t("detail.whatHappened")}</p>
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="mt-2 min-h-[10rem] border-[#e7ddd3] bg-[#fffdfb]"
                />
              </div>
            ) : (
              <>
                <Field label={t("detail.emotions")} value={entry.emotions.map((emotion) => optionLabel(emotion, "emotionKey", emotionKeys, t)).join(", ")} />
                <Field label={t("detail.symptoms")} value={entry.symptoms.map((symptom) => optionLabel(symptom, "symptomKey", symptomKeys, t)).join(", ")} />
                <Field label={t("detail.intensity")} value={`${entry.intensity}/10`} />
                <Field label={t("detail.whatHappened")} value={entry.whatHappened} />
                <Field label={t("detail.childhood")} value={entry.childhood} />
                <Field label={t("detail.belief")} value={entry.beliefs} />
              </>
            )
          ) : (
            isEditing ? (
              <div className="rounded-[18px] bg-[#ffffff] p-5">
                <p className="text-sm font-bold text-[#4a3b34]">{t("detail.gratitude")}</p>
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="mt-2 min-h-[10rem] border-[#e7ddd3] bg-[#fffdfb]"
                />
              </div>
            ) : (
              <>
                <Field label={t("detail.mood")} value={optionLabel(entry.mood, "moodKey", moodKeys, t)} />
                <Field label={t("detail.weather")} value={optionLabel(entry.weather, "weatherKey", weatherKeys, t)} />
                <Field label={t("detail.gratitude")} value={entry.gratitude} />
                <Field label={t("detail.success")} value={entry.success} />
              </>
            )
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
          <Button variant="garden" onClick={() => navigate(routes.diaryLayout(entry.id))}>
            <ImageIcon className="h-4 w-4" />
            {language === "zh" ? "分享卡片" : "Share Card"}
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}
