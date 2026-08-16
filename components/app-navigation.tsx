"use client";

import Link from "next/link";
import { CarFront, LayoutDashboard, Plus, Store } from "lucide-react";
import { usePathname } from "next/navigation";

interface AppNavigationProps {
  vehicleHref: string;
  addHref: string;
  addLabel: string;
}

const destinations = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, match: (path: string) => path === "/dashboard" },
  { href: "vehicle", label: "Vehicles", icon: CarFront, match: (path: string) => path.startsWith("/vehicles") },
  { href: "/shops", label: "Repair shops", icon: Store, match: (path: string) => path.startsWith("/shops") },
] as const;

export function DesktopNavigation({ vehicleHref }: Pick<AppNavigationProps, "vehicleHref">) {
  const pathname = usePathname();

  return <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
    {destinations.map(({ href, label, icon: Icon, match }) => {
      const resolvedHref = href === "vehicle" ? vehicleHref : href;
      const active = match(pathname);
      return <Link className={`nav-link${active ? " nav-link-active" : ""}`} href={resolvedHref} aria-current={active ? "page" : undefined} key={label}>
        <Icon size={16}/>{label}
      </Link>;
    })}
  </nav>;
}

export function MobileNavigation({ vehicleHref, addHref, addLabel }: AppNavigationProps) {
  const pathname = usePathname();
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, active: pathname === "/dashboard" },
    { href: vehicleHref, label: "Vehicles", icon: CarFront, active: pathname.startsWith("/vehicles") && pathname !== addHref },
    { href: addHref, label: addLabel, icon: Plus, active: pathname === addHref },
    { href: "/shops", label: "Shops", icon: Store, active: pathname.startsWith("/shops") },
  ];

  return <nav className="mobile-nav md:hidden" aria-label="Mobile navigation">
    {links.map(({ href, label, icon: Icon, active },index) => <Link className={`mobile-nav-link${active ? " mobile-nav-link-active" : ""}${index===2?" mobile-nav-add":""}`} href={href} aria-current={active ? "page" : undefined} key={label}>
      <Icon size={19}/><span>{label}</span>
    </Link>)}
  </nav>;
}
