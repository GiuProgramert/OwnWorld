import {
  Activity,
  HandCoins,
  Home,
  Shapes,
  Target,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  /** Etiqueta corta para la barra inferior en móvil. */
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  /** Ruta a una imagen de `public/`; si existe se muestra en lugar de `icon`. */
  logo?: string;
  /** `true` = ítem fijo en la barra inferior de móvil; `false` = va al menú "Más". */
  mobilePinned: boolean;
}

export interface AppDefinition {
  /** Unión de literales: cada app nueva la amplía. */
  id: "finance";
  name: string;
  description: string;
  icon: LucideIcon;
  /** Logo propio de la app (ruta a una imagen de `public/`). Sin logo se usa `icon` sobre `color`. */
  logo?: string;
  /** Color de fondo del tile en el lanzador. */
  color: string;
  basePath: string;
  navItems: NavItem[];
}

export const apps: AppDefinition[] = [
  {
    id: "finance",
    name: "OwnMonetaryApp",
    description: "Cuentas, movimientos, presupuestos y deudas",
    icon: Wallet,
    logo: "/apps/finance/logo.svg",
    color: "#0F3D2E",
    basePath: "/protected/finance",
    navItems: [
      {
        label: "Dashboard",
        shortLabel: "Inicio",
        href: "/protected/finance",
        icon: Home,
        mobilePinned: true,
      },
      {
        label: "Cuentas",
        shortLabel: "Cuentas",
        href: "/protected/finance/accounts",
        icon: User,
        mobilePinned: true,
      },
      {
        label: "Movimientos",
        shortLabel: "Movs.",
        href: "/protected/finance/movements",
        icon: Activity,
        mobilePinned: true,
      },
      {
        label: "Tipos de movimientos",
        shortLabel: "Tipos",
        href: "/protected/finance/movement-types",
        icon: Shapes,
        mobilePinned: false,
      },
      {
        label: "Presupuestos",
        shortLabel: "Topes",
        href: "/protected/finance/budgets",
        icon: Target,
        mobilePinned: true,
      },
      {
        label: "Deudas",
        shortLabel: "Deudas",
        href: "/protected/finance/debts",
        icon: HandCoins,
        mobilePinned: false,
      },
    ],
  },
];

export const launcherPath = "/protected";

/** La app cuyo `basePath` es igual al pathname o es prefijo seguido de `/`. */
export function getCurrentApp(pathname: string | null): AppDefinition | undefined {
  if (!pathname) {
    return undefined;
  }

  return apps.find(
    (app) => pathname === app.basePath || pathname.startsWith(app.basePath + "/")
  );
}

export function isNavItemActive(
  pathname: string | null,
  href: string,
  basePath: string
) {
  if (!pathname) {
    return false;
  }

  // El ítem raíz de la app (su dashboard) vive en el `basePath`, así que un startsWith
  // lo marcaría activo en todas las pantallas.
  if (href === basePath) {
    return pathname === basePath;
  }

  return pathname === href || pathname.startsWith(href + "/");
}

export function getSidebarItems(pathname: string | null): {
  items: NavItem[];
  basePath: string;
} {
  const app = getCurrentApp(pathname);

  if (app) {
    return { items: app.navItems, basePath: app.basePath };
  }

  return {
    items: apps.map((a) => ({
      label: a.name,
      shortLabel: a.name,
      href: a.basePath,
      icon: a.icon,
      logo: a.logo,
      mobilePinned: false,
    })),
    basePath: launcherPath,
  };
}
