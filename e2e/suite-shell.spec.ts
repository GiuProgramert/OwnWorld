import { devices, expect, test, type Page } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { qaSupabase, uniqueName } from "./helpers/supabase";

const TRANSFER_TYPE_ID = "e7f1b48a-be01-48a5-9982-5a4d4025493c";
const OLD_ROUTE = /\/protected\/(accounts|movements|movement-types|budgets|debts|transfers)/;

const sidebar = (page: Page) => page.locator("aside");

function todayAsuncion() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Asuncion" }).format(new Date());
}

test.describe("lanzador y navegación de la suite", () => {
  test("P.1 — /protected muestra el lanzador, no el dashboard", async ({ page }) => {
    await page.goto("/protected");

    await expect(page.getByRole("heading", { level: 1, name: "Apps" })).toBeVisible();
    const tile = page.getByRole("link", { name: /OwnMonetaryApp/ }).first();
    await expect(tile).toBeVisible();
    await expect(page.getByText("Cuentas, movimientos, presupuestos y deudas")).toBeVisible();
    await expect(page).toHaveTitle("OwnWorld");
    await expect(page.getByText("Gastos por tipo")).toHaveCount(0);
  });

  test("P.2 — el tile OwnMonetaryApp lleva al dashboard y el sidebar lista los 6 ítems", async ({
    page,
  }) => {
    await page.goto("/protected");
    await page.getByRole("link", { name: /OwnMonetaryApp.*Cuentas, movimientos/ }).click();

    await expect(page).toHaveURL(/\/protected\/finance$/);
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();

    const nav = sidebar(page);
    for (const label of [
      "Dashboard",
      "Cuentas",
      "Movimientos",
      "Tipos de movimientos",
      "Presupuestos",
      "Deudas",
    ]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(nav.getByRole("link", { name: "Dashboard", exact: true })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  test("P.3 — sidebar en el lanzador lista apps y el logo vuelve al lanzador", async ({ page }) => {
    await page.goto("/protected");
    const nav = sidebar(page);

    await expect(nav.getByText("OwnWorld")).toBeVisible();
    await expect(nav.getByRole("link", { name: "OwnMonetaryApp", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Cuentas", exact: true })).toHaveCount(0);

    await page.goto("/protected/finance/accounts");
    await nav.getByRole("link", { name: "OwnWorld" }).click();
    await expect(page).toHaveURL(/\/protected$/);
    await expect(page.getByRole("heading", { level: 1, name: "Apps" })).toBeVisible();
  });

  test("P.7 (desktop) — el switcher de app abre Todas las apps y OwnMonetaryApp", async ({ page }) => {
    await page.goto("/protected/finance");
    await sidebar(page).getByRole("button", { name: "Cambiar de app" }).click();

    await expect(page.getByRole("menuitem", { name: "Todas las apps" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "OwnMonetaryApp" })).toBeVisible();
  });
});

test.describe("C-1 — app finanzas con nombre y logo propios", () => {
  test("C-1 — el lanzador, el sidebar y el switcher muestran OwnMonetaryApp con /apps/finance/logo.svg", async ({
    page,
  }) => {
    // next/image puede servirlo como /_next/image?url=%2Fapps%2Ffinance%2Flogo.svg.
    const logo = (scope: ReturnType<Page["locator"]>) =>
      scope.locator('img[src*="apps%2Ffinance%2Flogo.svg"], img[src*="/apps/finance/logo.svg"]');

    await page.goto("/protected");
    const tile = page.getByRole("link", { name: /OwnMonetaryApp.*Cuentas, movimientos/ });
    await expect(tile).toBeVisible();
    await expect(logo(tile)).toBeVisible();
    await expect(page.getByText("Finanzas", { exact: true })).toHaveCount(0);
    const item = sidebar(page).getByRole("link", { name: "OwnMonetaryApp", exact: true });
    await expect(item).toBeVisible();
    await expect(logo(item)).toBeVisible();
    await expect(sidebar(page).getByText("OwnWorld")).toBeVisible();

    await page.goto("/protected/finance");
    const trigger = sidebar(page).getByRole("button", { name: "Cambiar de app" });
    await expect(trigger).toContainText("OwnMonetaryApp");
    await expect(logo(trigger)).toBeVisible();
    await expect(sidebar(page).getByRole("link", { name: "Cuentas", exact: true })).toBeVisible();

    await trigger.click();
    await expect(logo(page.getByRole("menuitem", { name: "OwnMonetaryApp" }))).toBeVisible();
    await page.keyboard.press("Escape");

    await sidebar(page).getByRole("button", { name: "Cerrar sidebar" }).click();
    await expect(trigger).not.toContainText("OwnMonetaryApp");
    await expect(logo(trigger)).toBeVisible();
    await expect(trigger.locator("img")).toHaveAttribute("alt", "OwnMonetaryApp");
  });
});

test.describe("C-2 — logos nuevos de OwnWorld", () => {
  test("C-2 — el logo de OwnWorld y el de OwnMonetaryApp son archivos distintos y existen", async ({
    page,
    request,
  }) => {
    await page.goto("/protected/finance");
    const ownWorldLogo = sidebar(page).locator('a[href="/protected"] img').first();
    const financeLogo = sidebar(page)
      .getByRole("button", { name: "Cambiar de app" })
      .locator("img");

    await expect(ownWorldLogo).toBeVisible();
    await expect(financeLogo).toBeVisible();
    const worldSrc = decodeURIComponent((await ownWorldLogo.getAttribute("src")) ?? "");
    const financeSrc = decodeURIComponent((await financeLogo.getAttribute("src")) ?? "");
    expect(worldSrc).toContain("/icon.svg");
    expect(financeSrc).toContain("/apps/finance/logo.svg");
    expect(worldSrc).not.toContain("/apps/finance/logo.svg");

    for (const path of [
      "/icon.svg",
      "/apps/finance/logo.svg",
      "/icon-192.png",
      "/icon-512.png",
      "/favicon.ico",
      "/apple-icon.png",
    ]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
    }

    const manifest = await (await request.get("/manifest.webmanifest")).json();
    for (const icon of manifest.icons as { src: string }[]) {
      expect((await request.get(icon.src)).status(), icon.src).toBe(200);
    }
  });
});

test.describe("redirecciones de URLs viejas", () => {
  test("P.6 — rutas viejas redirigen conservando el query; /protected sin query no", async ({
    page,
  }) => {
    await page.goto("/protected/movements");
    await expect(page).toHaveURL(/\/protected\/finance\/movements/);

    await page.goto("/protected/movement-types/create");
    await expect(page).toHaveURL(/\/protected\/finance\/movement-types\/create$/);

    await page.goto("/protected/movements?accountId=all");
    await expect(page).toHaveURL(/\/protected\/finance\/movements\?accountId=all$/);

    await page.goto("/protected?accountId=all&dailyRange=30d");
    await expect(page).toHaveURL(/\/protected\/finance\?accountId=all&dailyRange=30d$/);

    await page.goto("/protected");
    await expect(page).toHaveURL(/\/protected$/);
    await expect(page.getByRole("heading", { level: 1, name: "Apps" })).toBeVisible();
  });
});

test.describe("mobile", () => {
  // defaultBrowserType no se puede fijar dentro de un describe.
  const pixel: Partial<(typeof devices)["Pixel 7"]> = { ...devices["Pixel 7"] };
  delete pixel.defaultBrowserType;
  test.use(pixel);

  test("P.7 (mobile) — sin barra en el lanzador; barra y menú con Apps en finanzas", async ({
    page,
  }) => {
    const bar = page.getByRole("navigation", { name: "Navegación principal" });

    await page.goto("/protected");
    await expect(page.getByRole("heading", { level: 1, name: "Apps" })).toBeVisible();
    await expect(bar).toHaveCount(0);

    await page.goto("/protected/finance");
    await expect(bar).toBeVisible();
    for (const label of ["Inicio", "Cuentas", "Movs.", "Topes", "Menú"]) {
      await expect(bar.getByText(label, { exact: true })).toBeVisible();
    }

    await bar.getByRole("button", { name: "Abrir menú" }).click();
    await expect(page.getByRole("menuitem", { name: "Tipos de movimientos" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Deudas" })).toBeVisible();
    await expect(page.getByText("Apps", { exact: true })).toBeVisible();
    await page.getByRole("menuitem", { name: "Todas las apps" }).click();
    await expect(page).toHaveURL(/\/protected$/);
  });
});

test.describe("navegación de finanzas sin URLs viejas", () => {
  let supabase: SupabaseClient;
  let accountId: string | undefined;
  let debtId: string | undefined;
  let typeId: string;
  let typeName: string;
  const accountName = uniqueName("suite-shell", "cuenta");
  const debtName = uniqueName("suite-shell", "deuda");
  const description = uniqueName("suite-shell", "mov");

  test.beforeAll(async () => {
    supabase = await qaSupabase();
    const { data, error } = await supabase
      .from("movement_types")
      .select("id, name")
      .neq("id", TRANSFER_TYPE_ID)
      .limit(1);
    if (error || !data?.length) {
      throw new Error(error?.message ?? "No hay tipos de movimiento");
    }
    typeId = data[0].id;
    typeName = data[0].name;
  });

  test.afterAll(async () => {
    // Borrar la cuenta borra sus movimientos en cascada.
    if (debtId) {
      await supabase.from("debts").delete().eq("id", debtId);
    }
    if (accountId) {
      await supabase.from("accounts").delete().eq("id", accountId);
    }
  });

  test("P.4 — crear y editar una cuenta nunca pasa por una URL sin /finance", async ({ page }) => {
    const visited: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        visited.push(frame.url());
      }
    });

    await page.goto("/protected/finance/accounts/create");
    await page.getByLabel("Nombre").fill(accountName);
    await page.getByRole("button", { name: /Crear/ }).first().click();
    await expect(page).toHaveURL(/\/protected\/finance\/accounts$/);

    const row = page.getByRole("row").filter({ hasText: accountName });
    await expect(row).toBeVisible();

    await row.getByRole("link", { name: "Editar cuenta" }).click();
    await expect(page).toHaveURL(/\/protected\/finance\/accounts\/edit\/[0-9a-f-]+$/);
    await page.locator("a:has(svg.lucide-chevron-left)").first().click();
    await expect(page).toHaveURL(/\/protected\/finance\/accounts$/);

    const { data, error } = await supabase
      .from("accounts")
      .select("id")
      .eq("name", accountName)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    accountId = data.id;

    expect(visited.filter((url) => OLD_ROUTE.test(url))).toEqual([]);
  });

  test("P.5 — crear movimiento redirige con accountId y Pagar vuelve al dashboard", async ({
    page,
  }) => {
    test.skip(!accountId, "depende de la cuenta creada en P.4");

    await page.goto("/protected/finance/movements/create");
    await page.getByLabel("Descripción").fill(description);
    await page.getByLabel("Monto").fill("1000");
    await page.locator("#type").click();
    await page.getByRole("option", { name: "Débito" }).click();
    await page.locator("#account_id").click();
    await page.getByRole("option", { name: accountName }).click();
    await page.locator("#movement_type_id").click();
    await page.getByRole("option", { name: typeName, exact: true }).first().click();
    await page.getByRole("button", { name: "Crear", exact: true }).click();
    await expect(page).toHaveURL(
      new RegExp(`/protected/finance/movements\\?accountId=${accountId}$`)
    );
    await expect(page.getByRole("row").filter({ hasText: description })).toBeVisible();

    const { data: debt, error } = await supabase
      .from("debts")
      .insert({
        name: debtName,
        kind: "service",
        amount_mode: "fixed",
        amount: 2000,
        movement_type_id: typeId,
        first_due_date: todayAsuncion(),
      })
      .select("id")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    debtId = debt.id;

    await page.goto("/protected/finance");
    const card = page.getByText("Vencimientos", { exact: true }).locator("xpath=../..");
    const pay = card.getByRole("link", { name: "Pagar" }).first();
    await expect(card).toContainText(debtName);
    const href = await card
      .getByText(debtName)
      .locator("xpath=ancestor::*[.//a[normalize-space()='Pagar']][1]")
      .getByRole("link", { name: "Pagar" })
      .getAttribute("href");
    expect(href).toBe(`/protected/finance/debts/${debtId}/pay?returnTo=%2Fprotected%2Ffinance`);
    await expect(pay).toBeVisible();
  });
});
