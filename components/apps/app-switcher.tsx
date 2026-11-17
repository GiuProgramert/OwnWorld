"use client";

import { ChevronsUpDown, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import AppIcon from "@/components/apps/app-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apps, getCurrentApp, launcherPath } from "@/lib/apps/registry";
import { cn } from "@/lib/utils";

export default function AppSwitcher({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const currentApp = getCurrentApp(pathname);

  if (!currentApp) {
    return null;
  }

  return (
    <div className="border-b border-b-foreground/10 p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Cambiar de app"
            className={cn(
              "flex w-full items-center gap-3 rounded-md p-2 hover:bg-accent/5",
              collapsed && "justify-center"
            )}
          >
            <AppIcon
              icon={currentApp.icon}
              logo={currentApp.logo}
              size={20}
              alt={collapsed ? currentApp.name : ""}
              className="flex-none text-muted-foreground"
            />
            {!collapsed && (
              <>
                <span className="flex-1 truncate text-left font-medium">
                  {currentApp.name}
                </span>
                <ChevronsUpDown className="h-4 w-4 flex-none text-muted-foreground" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-52">
          <DropdownMenuItem asChild>
            <Link href={launcherPath} className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Todas las apps
            </Link>
          </DropdownMenuItem>
          {apps.map((app) => {
            return (
              <DropdownMenuItem key={app.id} asChild>
                <Link href={app.basePath} className="flex items-center gap-2">
                  <AppIcon icon={app.icon} logo={app.logo} size={16} />
                  {app.name}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
