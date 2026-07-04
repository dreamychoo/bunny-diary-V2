import { ArrowLeft, Mail } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useI18n } from "../i18n";
import { gardenPlantAssets, getLetterById } from "../lib/storage";
import { routes } from "../routes";

export default function BunnyLetterDetail() {
  const { id } = useParams();
  const { language, t } = useI18n();
  const letter = id ? getLetterById(id) : null;
  if (!letter) return <Navigate to={routes.collection} replace />;
  const date = new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", { year: "numeric", month: "long", day: "numeric" }).format(new Date(letter.createdAt));

  return (
    <AppShell wide>
      <Link to={routes.collection} className="letter-back" aria-label={t("letter.back")}><ArrowLeft />{t("letter.back")}</Link>
      <article className="letter-paper">
        <Mail className="mx-auto h-7 w-7 text-[#c99b52]" />
        <p className="letter-type">{t(`letter.type.${letter.letterType}`)}</p>
        <h1>{t(`letter.subject.${letter.letterType}`)}</h1>
        <time>{date}</time>
        <div className="letter-rule"><span>{t("letter.from")}</span></div>
        <div className="letter-plants">{letter.seeds.map((seed) => <div key={seed.id}><img src={gardenPlantAssets[seed.plantVariant]} alt="" /><span>{t(`garden.variant.${seed.plantVariant}`)}</span></div>)}</div>
        <div className="letter-body"><p>{t(`letter.body.${letter.letterType}.${letter.templateIndex}`)}</p></div>
        <img src="/assets/v2/rabbits/writing.png" alt="" className="mx-auto mt-8 h-24 w-24 object-contain opacity-90" />
        <div className="mt-8 flex justify-center">
          <Link to={routes.collection} className="inline-flex h-12 items-center rounded-[999px] border-0 bg-gradient-to-b from-[var(--pink-2)] to-[var(--pink)] px-7 text-[15px] font-extrabold text-white shadow-[0_8px_20px_rgba(255,111,134,0.30),inset_0_1px_rgba(255,255,255,0.35)]">
            {t("letter.back")}
          </Link>
        </div>
      </article>
    </AppShell>
  );
}
