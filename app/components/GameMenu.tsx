import Link from "next/link";
import { HUDPanel } from "./ui/HUDPanel";
import { HomeIcon, UsersIcon, ClipboardIcon, UserGroupIcon, SparklesIcon, Cog6ToothIcon, ShoppingBagIcon, TrophyIcon, UserCircleIcon, Squares2X2Icon } from "@heroicons/react/24/solid";

const menuItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/feed", label: "Feed", icon: Squares2X2Icon },
  { href: "/friends", label: "Friends", icon: UsersIcon },
  { href: "/quests", label: "Quests", icon: ClipboardIcon },
  { href: "/party", label: "Party", icon: UserGroupIcon },
  { href: "/battle", label: "Battle", icon: SparklesIcon },
  { href: "/crafting", label: "Crafting", icon: Cog6ToothIcon },
  { href: "/inventory", label: "Inventory", icon: ShoppingBagIcon },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBagIcon },
  { href: "/leaderboards", label: "Leaderboards", icon: TrophyIcon },
  { href: "/profile", label: "Profile", icon: UserCircleIcon },
];

export function GameMenu() {
  return (
    <HUDPanel className="flex flex-col gap-2 py-6 px-2 bg-white/10 dark:bg-portal-dark/30 border-0 shadow-xl items-center justify-start min-h-[70vh] w-20 fixed top-8 left-4 z-40">
      {menuItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="group flex flex-col items-center justify-center p-2 rounded-xl hover:bg-portal/20 dark:hover:bg-magic/20 transition-all duration-200 relative"
        >
          <Icon className="w-7 h-7 text-yellow-300 group-hover:text-magic drop-shadow-glow transition-all duration-200" />
          <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs bg-black/80 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-10 whitespace-nowrap">
            {label}
          </span>
        </Link>
      ))}
    </HUDPanel>
  );
}
