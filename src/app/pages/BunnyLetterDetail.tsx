import { ArrowLeft, Mail } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useI18n } from "../i18n";
import { GardenPlantVariant, getLetterById } from "../lib/storage";
import { routes } from "../routes";

const assets: Record<GardenPlantVariant, string> = {
  daisy: "/garden-assets/prepped/warmth-flower-daisy.png", tulip: "/garden-assets/prepped/warmth-flower-blossom.png", sunflower: "/garden-assets/prepped/warmth-flower-sunflower.png", cherry_blossom: "/garden-assets/prepped/warmth-flower-blossom.png", rose: "/garden-assets/prepped/warmth-flower-blossom.png", lavender: "/garden-assets/prepped/warmth-flower-bell.png", hibiscus: "/garden-assets/prepped/warmth-flower-daisy.png",
  sprout: "/garden-assets/prepped/feeling-sapling.png", leaf: "/garden-assets/prepped/feeling-tree-branch.png", clover: "/garden-assets/prepped/feeling-bush.png", small_tree: "/garden-assets/prepped/feeling-tree-round.png", pine: "/garden-assets/prepped/feeling-tree-round.png", four_leaf: "/garden-assets/prepped/feeling-bush.png", cactus: "/garden-assets/prepped/feeling-bush.png", palm: "/garden-assets/prepped/feeling-tree-branch.png", bamboo: "/garden-assets/prepped/feeling-tree-branch.png", mushroom: "/garden-assets/prepped/feeling-tree-droop.png"
};

export default function BunnyLetterDetail() {
  const { id } = useParams();
  const { language, t } = useI18n();
  const letter = id ? getLetterById(id) : null;
  if (!letter) return <Navigate to={routes.collection} replace />;
  const date = new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", { year: "numeric", month: "long", day: "numeric" }).format(new Date(letter.createdAt));

  return (
    <AppShell wide>
      <Link to={routes.collection} className="letter-back"><ArrowLeft />{t("letter.back")}</Link>
      <article className="letter-paper">
        <Mail className="mx-auto h-7 w-7 text-[#c99b52]" />
        <p className="letter-type">{t(`letter.type.${letter.letterType}`)}</p>
        <h1>{t(`letter.subject.${letter.letterType}`)}</h1>
        <time>{date}</time>
        <div className="letter-rule"><span>{t("letter.from")}</span></div>
        <div className="letter-plants">{letter.seeds.map((seed) => <div key={seed.id}><img src={assets[seed.plantVariant]} alt="" /><span>{t(`garden.variant.${seed.plantVariant}`)}</span></div>)}</div>
        <div className="letter-body"><p>{t(`letter.body.${letter.letterType}.${letter.templateIndex}`)}</p></div>
        <img src="/assets/v2/rabbits/writing.png" alt="" className="mx-auto mt-8 h-24 w-24 object-contain opacity-90" />
      </article>
    </AppShell>
  );
}
