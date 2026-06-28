import { ArrowLeft, Mail } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useI18n } from "../i18n";
import { GardenPlantVariant, getLetterById } from "../lib/storage";
import { routes } from "../routes";

const assets: Record<GardenPlantVariant, string> = {
  daisy: "/assets/v2/plants/daisy.png", tulip: "/assets/v2/plants/tulip.png", sunflower: "/assets/v2/plants/sunflower.png", cherry_blossom: "/assets/v2/plants/cherry-tree.png", rose: "/assets/v2/plants/red-rose.png", lavender: "/assets/v2/plants/lavender.png", hibiscus: "/assets/v2/plants/pink-rose.png",
  sprout: "/assets/v2/plants/clover.png", leaf: "/assets/v2/plants/lotus-leaves.png", clover: "/assets/v2/plants/clover.png", small_tree: "/assets/v2/plants/green-tree.png", pine: "/assets/v2/plants/green-tree.png", four_leaf: "/assets/v2/plants/clover.png", cactus: "/assets/v2/plants/cactus.png", palm: "/assets/v2/plants/green-tree.png", bamboo: "/assets/v2/plants/grass.png", mushroom: "/assets/v2/plants/mushroom.png"
};

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
        <div className="letter-plants">{letter.seeds.map((seed) => <div key={seed.id}><img src={assets[seed.plantVariant]} alt="" /><span>{t(`garden.variant.${seed.plantVariant}`)}</span></div>)}</div>
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
