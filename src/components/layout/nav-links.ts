import {
  BedDouble,
  Boxes,
  DoorClosed,
  Refrigerator,
  Tv,
  type LucideIcon,
} from "lucide-react";

import { serviceAreas } from "@/data/service-areas";

export type SubNavLink = {
  href: string;
  label: string;
  /** Shown in the desktop dropdown only - the mobile menu and footer stay text-only. */
  icon?: LucideIcon;
};

export type NavItem = {
  href: string;
  label: string;
  children?: readonly SubNavLink[];
};

export const areaNavLinks: SubNavLink[] = serviceAreas.map((area) => ({
  href: `/services/${area.slug}`,
  label: area.name,
}));

export const customFurnitureNavLinks: readonly SubNavLink[] = [
  { href: "/furniture-custom/kitchen-set", label: "Kitchen Set Custom", icon: Refrigerator },
  { href: "/furniture-custom/lemari-custom", label: "Lemari Custom", icon: DoorClosed },
  { href: "/furniture-custom/lemari-bawah-tangga", label: "Lemari Bawah Tangga Custom", icon: Boxes },
  { href: "/furniture-custom/backdrop-tv", label: "Backdrop TV Custom", icon: Tv },
  { href: "/furniture-custom/furniture-kamar", label: "Furniture Kamar", icon: BedDouble },
] as const;

/** Primary navigation, shared by the header, the mobile menu and the footer. */
export const navLinks: readonly NavItem[] = [
  { href: "/", label: "Beranda" },
  { href: "/portfolio", label: "Portofolio" },
  {
    href: "/furniture-custom",
    label: "Furniture Custom",
    children: customFurnitureNavLinks,
  },
  {
    href: "/services",
    label: "Layanan Area",
    children: areaNavLinks,
  },
  { href: "/knowledge", label: "Panduan" },
  { href: "/about", label: "Tentang" },
  { href: "/contact", label: "Kontak" },
] as const;

export type NavLink = (typeof navLinks)[number];
