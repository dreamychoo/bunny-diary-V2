import { Archive, BookOpen, Home, Sprout } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useI18n } from "../i18n";
import { routes } from "../routes";
import { cn } from "./ui/utils";

const items = [
  { to: routes.home, labelKey: "nav.home", icon: Home },
  { to: routes.bunnyGarden, labelKey: "garden.nav.garden", icon: Sprout },
  { to: routes.collection, labelKey: "garden.nav.collection", icon: Archive },
  { to: routes.pastJournals, labelKey: "garden.nav.memories", icon: BookOpen }
] as const;

export function GardenNav() {
  const { t } = useI18n();
  const location = useLocation();

  return (
    <nav className="garden-nav" aria-label={t("garden.nav.label")}>
      {items.map(({ to, labelKey, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => cn("garden-nav__item", (isActive || (to === routes.collection && location.pathname.startsWith("/bunny-letter/"))) && "garden-nav__item--active")}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
          <span>{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
