import { LogOut } from "lucide-react";
import { Brand } from "./brand";
import { logout } from "@/app/auth/actions";
import { DesktopNavigation, MobileNavigation } from "./app-navigation";
import { ThemeToggle } from "./theme-toggle";

export function AppShell({children,vehicleId}:Readonly<{children:React.ReactNode;vehicleId?:string}>){
  const vehicleHref=vehicleId?`/vehicles/${vehicleId}`:"/dashboard";
  const addHref=vehicleId?`/vehicles/${vehicleId}/maintenance/new`:"/vehicles/new";
  const addLabel=vehicleId?"Add record":"Add vehicle";
  return <div className="app-frame min-h-screen"><header className="app-header"><div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between px-4 lg:px-7"><Brand/><DesktopNavigation vehicleHref={vehicleHref}/><div className="flex items-center gap-2"><ThemeToggle/><form action={logout}><button className="icon-button" aria-label="Log out" title="Log out" type="submit"><LogOut size={17}/></button></form></div></div></header><main className="app-content mx-auto max-w-[1480px] px-4 py-6 pb-28 md:pb-9 lg:px-7 lg:py-7">{children}</main><MobileNavigation vehicleHref={vehicleHref} addHref={addHref} addLabel={addLabel}/></div>;
}
