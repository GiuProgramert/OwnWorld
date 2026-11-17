import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import AppLauncher from "@/components/apps/app-launcher";

export default async function LauncherPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="text-2xl font-semibold">Apps</h1>
      <AppLauncher />
    </div>
  );
}
