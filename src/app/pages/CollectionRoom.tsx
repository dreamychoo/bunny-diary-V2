import { Archive, ChevronRight, Mail, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { GardenNav } from "../components/GardenNav";
import { useI18n } from "../i18n";
import { GardenPlantVariant, GardenSeed, getGardenState } from "../lib/storage";
import { routes } from "../routes";

const assets: Record<GardenPlantVariant, string> = {
  daisy: "/garden-assets/prepped/warmth-flower-daisy.png",
  tulip: "/garden-assets/prepped/warmth-flower-blossom.png",
  sunflower: "/garden-assets/prepped/warmth-flower-sunflower.png",
  cherry_blossom: "/garden-assets/prepped/warmth-flower-blossom.png",
  rose: "/garden-assets/prepped/warmth-flower-blossom.png",
  lavender: "/garden-assets/prepped/warmth-flower-bell.png",
  hibiscus: "/garden-assets/prepped/warmth-flower-daisy.png",
  sprout: "/garden-assets/prepped/feeling-sapling.png",
  leaf: "/garden-assets/prepped/feeling-tree-branch.png",
  clover: "/garden-assets/prepped/feeling-bush.png",
  small_tree: "/garden-assets/prepped/feeling-tree-round.png",
  pine: "/garden-assets/prepped/feeling-tree-round.png",
  four_leaf: "/garden-assets/prepped/feeling-bush.png",
  cactus: "/garden-assets/prepped/feeling-bush.png",
  palm: "/garden-assets/prepped/feeling-tree-branch.png",
  bamboo: "/garden-assets/prepped/feeling-tree-branch.png",
  mushroom: "/garden-assets/prepped/feeling-tree-droop.png"
};

function groupPlants(seeds: GardenSeed[]) {
  const groups = new Map<GardenPlantVariant, GardenSeed[]>();
  seeds.forEach((seed) => groups.set(seed.plantVariant, [...(groups.get(seed.plantVariant) ?? []), seed]));
  return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
}

function formatDate(timestamp: string, language: string) {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", { month: "short", day: "numeric" }).format(new Date(timestamp));
}

export default function CollectionRoom() {
  const { language, t } = useI18n();
  const garden = getGardenState();
  const groups = groupPlants(garden.collectedSeeds);

  return (
    <AppShell title={t("collection.title")} subtitle={t("collection.subtitle")} headerMascotVariant="reading" wide>
      <div className="collection-layout">
        <section className="collection-panel">
          <header className="collection-section-heading"><Archive /><h2>{t("collection.plants")}</h2></header>
          {groups.length ? <div className="collection-plant-list">{groups.map(([variant, seeds]) => {
            const seedType = seeds[0].seedType;
            return <article key={variant} className="collection-plant-row">
              <img src={assets[variant]} alt="" />
              <div className="min-w-0 flex-1"><h3>{t(`garden.variant.${variant}`)}</h3><span className={seedType === "warmth" ? "plant-kind plant-kind--warm" : "plant-kind plant-kind--worry"}>{t(seedType === "warmth" ? "garden.v3.warmPlant" : "garden.v3.worryPlant")}</span></div>
              <strong>× {seeds.length}</strong>
            </article>;
          })}</div> : <div className="collection-empty"><Sprout /><p>{t("collection.emptyPlants")}</p></div>}
        </section>

        <section className="collection-panel">
          <header className="collection-section-heading collection-section-heading--mail"><Mail /><h2>{t("collection.mailbox")}</h2></header>
          {garden.letters.length ? <div className="mail-list">{garden.letters.map((letter) => (
            <Link key={letter.id} to={routes.letter(letter.id)} className="mail-row">
              <span className="mail-icon"><Mail /></span>
              <div className="min-w-0 flex-1"><h3>{formatDate(letter.createdAt, language)} · {t(`letter.type.${letter.letterType}`)}</h3><p>{t(`letter.subject.${letter.letterType}`)}</p></div>
              <ChevronRight />
            </Link>
          ))}</div> : <div className="collection-empty"><Mail /><p>{t("collection.emptyLetters")}</p></div>}
          <div className="collection-garden-link"><span>{t("collection.gardenHint")}</span><Link to={routes.bunnyGarden}>{t("collection.goGarden")} <ChevronRight /></Link></div>
        </section>
      </div>
      <GardenNav />
    </AppShell>
  );
}
