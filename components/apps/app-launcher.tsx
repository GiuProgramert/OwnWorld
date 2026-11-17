import Link from "next/link";

import AppIcon from "@/components/apps/app-icon";
import { Card } from "@/components/ui/card";
import { apps } from "@/lib/apps/registry";

export default function AppLauncher() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {apps.map((app) => {
        return (
          <Link key={app.id} href={app.basePath} className="block">
            <Card className="flex h-full flex-col items-center gap-3 p-5 text-center transition-colors hover:bg-accent/5">
              {app.logo ? (
                <AppIcon icon={app.icon} logo={app.logo} size={64} />
              ) : (
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-white"
                  style={{ backgroundColor: app.color }}
                >
                  <AppIcon icon={app.icon} size={32} />
                </span>
              )}
              <span className="font-medium">{app.name}</span>
              <span className="text-sm text-muted-foreground">
                {app.description}
              </span>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
