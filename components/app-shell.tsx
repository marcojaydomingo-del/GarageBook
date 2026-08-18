import Link from "next/link";
import { ChevronDown, CircleUserRound, HelpCircle, LogOut, ShieldCheck } from "lucide-react";
import { Brand } from "./brand";
import { logout } from "@/app/auth/actions";
import { DesktopNavigation, MobileNavigation } from "./app-navigation";
import { ThemeToggle } from "./theme-toggle";

export function AppShell({children,vehicleId}:Readonly<{children:React.ReactNode;vehicleId?:string}>){
  const vehicleHref=vehicleId?`/vehicles/${vehicleId}`:"/dashboard";
  const addHref=vehicleId?`/vehicles/${vehicleId}/maintenance/new`:"/vehicles/new";
  const addLabel=vehicleId?"Add record":"Add vehicle";
  return <div className="app-frame min-h-screen"><header className="app-header"><div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between px-4 lg:px-7"><Brand/><DesktopNavigation vehicleHref={vehicleHref}/><div className="flex items-center gap-3"><ThemeToggle/><details className="account-menu"><summary aria-label="Open account menu"><CircleUserRound size={18}/><span>Account</span><ChevronDown size={14}/></summary><div className="account-menu-panel"><Link href="/contact"><HelpCircle size={16}/>Help and contact</Link><Link href="/privacy"><ShieldCheck size={16}/>Privacy</Link><form action={logout}><button type="submit"><LogOut size={16}/>Log out</button></form></div></details></div></div></header><main className="app-content mx-auto max-w-[1480px] px-4 py-6 pb-28 md:pb-9 lg:px-7 lg:py-7">{children}</main><MobileNavigation vehicleHref={vehicleHref} addHref={addHref} addLabel={addLabel}/></div>;
}
