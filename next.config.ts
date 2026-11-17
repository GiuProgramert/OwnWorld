import type { NextConfig } from "next";

// Las rutas de finanzas se movieron a /protected/finance. Estos redirects existen solo para
// marcadores, historial y PWA instalada con URLs viejas: ningún link interno puede depender de ellos.
const financeSegments = [
  "accounts",
  "movements",
  "movement-types",
  "budgets",
  "debts",
  "transfers",
];

// Parámetros del dashboard: una regla por parámetro (varias condiciones en un `has` son AND).
const dashboardParams = [
  "accountId",
  "startDate",
  "endDate",
  "dailyRange",
  "dailyStart",
  "dailyEnd",
  "dailyTypes",
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...financeSegments.map((segment) => ({
        source: `/protected/${segment}/:path*`,
        destination: `/protected/finance/${segment}/:path*`,
        permanent: false,
      })),
      ...dashboardParams.map((key) => ({
        source: "/protected",
        has: [{ type: "query" as const, key }],
        destination: "/protected/finance",
        permanent: false,
      })),
    ];
  },
};

export default nextConfig;
