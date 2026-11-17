"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getSidebarItems, isNavItemActive } from "@/lib/apps/registry";
import { ChevronLeft } from "lucide-react";
import AppLogo from "@/components/app-logo";
import AppIcon from "@/components/apps/app-icon";
import AppSwitcher from "@/components/apps/app-switcher";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(true);
  const { items, basePath } = getSidebarItems(pathname);

  return (
    <aside
      className={cn(
        "hidden md:block sticky top-5 h-[calc(100dvh-2.5rem)] transition-all duration-500 shrink-0 bg-card border-r border-border rounded-md",
        open ? "w-64" : "w-20"
      )}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-b-foreground/10">
          <Link href="/protected" className="flex items-center gap-2 min-w-0">
            <div className="ml-1">
              <AppLogo size={open ? 28 : 24} />
            </div>
            <span
              className={cn(
                "font-semibold truncate",
                open ? "mx-auto" : "sr-only"
              )}
            >
              OwnWorld
            </span>
          </Link>

          <button
            aria-label={open ? "Cerrar sidebar" : "Abrir sidebar"}
            onClick={() => setOpen((s) => !s)}
            className="p-1 rounded hover:bg-accent/10 shrink-0"
          >
            <ChevronLeft className={cn("w-5 h-5 transition-all duration-300", open && "rotate-180")} />
          </button>
        </div>

        <AppSwitcher collapsed={!open} />

        <nav className="flex-1 overflow-auto py-2">
          <ul className="space-y-1 p-2">
            {items.map((item) => {
              const active = isNavItemActive(pathname, item.href, basePath);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md hover:bg-accent/5",
                      active ? "bg-accent/10 font-medium" : ""
                    )}
                  >
                    <span
                      className={cn(
                        "text-muted-foreground flex-none transition-all duration-300",
                        open ? "" : "mx-auto"
                      )}
                    >
                      <AppIcon icon={item.icon} logo={item.logo} size={20} />
                    </span>
                    {open && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t text-xs text-muted-foreground">
          {open ? "Versión 0.1" : "v0.1"}
        </div>
      </div>
    </aside>
  );
}
