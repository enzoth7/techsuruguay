import rawCompanies from "@/src/data/techsuruguay.json";

export type TechUruguayFounder = {
  name: string;
  role: string;
};

export type TechUruguayCompany = {
  name: string;
  sector: string;
  founded: number | null;
  website: string;
  services: string[];
  description: string;
  valuation: number | null;
  founders: TechUruguayFounder[];
  logoUrl?: string;
};

export type RevenueBucketId =
  | "under-100k"
  | "100k-500k"
  | "500k-1m"
  | "1m-3m"
  | "3m-10m"
  | "10m-15m"
  | "15m-plus"
  | "1b-plus"
  | "sin-dato";

export type RevenueBucket = {
  id: RevenueBucketId;
  label: string;
  shortLabel: string;
};

export const TECHSURUGUAY_STORAGE_KEY = "techsuruguay-draft-v1";
export const TECHSURUGUAY_ADMIN_SESSION_KEY = "techsuruguay-admin-session-v1";
export const TECHSURUGUAY_ADMIN_USER = "admin";
export const TECHSURUGUAY_ADMIN_PASSWORD = "techsuruguay";

export const TECHSURUGUAY_REVENUE_BUCKETS: RevenueBucket[] = [
  { id: "under-100k", label: "Menos de 100.000", shortLabel: "< 100.000" },
  { id: "100k-500k", label: "100.000 a 500.000", shortLabel: "100k - 500k" },
  { id: "500k-1m", label: "500.000 a 1 millón", shortLabel: "500k - 1M" },
  { id: "1m-3m", label: "1 millón a 3 millones", shortLabel: "1M - 3M" },
  { id: "3m-10m", label: "3 millones a 10 millones", shortLabel: "3M - 10M" },
  { id: "10m-15m", label: "10 millones a 15 millones", shortLabel: "10M - 15M" },
  { id: "15m-plus", label: "15 millones para arriba", shortLabel: "15M+" },
  { id: "1b-plus", label: "Mil millones para arriba", shortLabel: "1B+" },
  { id: "sin-dato", label: "Sin dato", shortLabel: "Sin dato" },
];

export const TECHSURUGUAY_COMPANIES = rawCompanies as TechUruguayCompany[];

export function cloneCompanies(companies: TechUruguayCompany[]): TechUruguayCompany[] {
  return companies.map((company) => ({
    ...company,
    services: Array.isArray(company.services) ? [...company.services] : [],
    founders: Array.isArray(company.founders) ? company.founders.map((founder) => ({ ...founder })) : [],
  }));
}

export function normalizeCompanies(input: unknown): TechUruguayCompany[] {
  if (!Array.isArray(input)) {
    return cloneCompanies(TECHSURUGUAY_COMPANIES);
  }

  return input.map((raw) => {
    const company = raw as Partial<TechUruguayCompany>;

    return {
      name: String(company.name ?? "").trim(),
      sector: String(company.sector ?? "").trim(),
      founded:
        typeof company.founded === "number" && Number.isFinite(company.founded)
          ? Math.round(company.founded)
          : null,
      website: String(company.website ?? "").trim(),
      services: Array.isArray(company.services)
        ? company.services.map((service) => String(service).trim()).filter(Boolean)
        : [],
      description: String(company.description ?? "").trim(),
      valuation:
        typeof company.valuation === "number" && Number.isFinite(company.valuation) && company.valuation > 0
          ? company.valuation
          : null,
      founders: Array.isArray(company.founders)
        ? company.founders
            .map((founder) => ({
              name: String(founder?.name ?? "").trim(),
              role: String(founder?.role ?? "").trim(),
            }))
            .filter((founder) => founder.name || founder.role)
        : [],
      logoUrl: String((company as { logoUrl?: string }).logoUrl ?? "").trim() || undefined,
    };
  });
}

export function getRevenueBucket(valuation: number | null | undefined): RevenueBucketId {
  if (valuation == null || !Number.isFinite(valuation) || valuation <= 0) {
    return "sin-dato";
  }
  if (valuation < 100_000) return "under-100k";
  if (valuation < 500_000) return "100k-500k";
  if (valuation < 1_000_000) return "500k-1m";
  if (valuation < 3_000_000) return "1m-3m";
  if (valuation < 10_000_000) return "3m-10m";
  if (valuation < 15_000_000) return "10m-15m";
  if (valuation < 1_000_000_000) return "15m-plus";
  return "1b-plus";
}

export function getBucketMeta(bucketId: RevenueBucketId): RevenueBucket {
  return (
    TECHSURUGUAY_REVENUE_BUCKETS.find((bucket) => bucket.id === bucketId) ??
    TECHSURUGUAY_REVENUE_BUCKETS[TECHSURUGUAY_REVENUE_BUCKETS.length - 1]
  );
}

export function formatMoney(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) {
    return "SIN DATOS";
  }

  return `U$S ${new Intl.NumberFormat("es-UY", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export function formatMoneyShort(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) {
    return "SIN DATOS";
  }

  if (value >= 1_000_000_000) {
    return `U$S ${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `U$S ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `U$S ${(value / 1_000).toFixed(0)}K`;
  }
  return formatMoney(value);
}

export function formatBucketLabel(value: number | null | undefined): string {
  return getBucketMeta(getRevenueBucket(value)).label;
}

export function formatFounded(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "Sin año";
  }

  return String(value);
}

export function formatInitials(name: string): string {
  const parts = name
    .replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ0-9 ]/g, " ")
    .split(" ")
    .filter(Boolean);

  if (parts.length === 0) return "TU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function parseLineList(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseFounderList(value: string): TechUruguayFounder[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [name, role] = item.split("|").map((part) => part.trim());
      return {
        name: name ?? "",
        role: role ?? "",
      };
    })
    .filter((founder) => founder.name || founder.role);
}

export function serializeFounderList(founders: TechUruguayFounder[]): string {
  return founders
    .map((founder) => `${founder.name}${founder.role ? ` | ${founder.role}` : ""}`)
    .join("\n");
}

export function sortCompanies(companies: TechUruguayCompany[]): TechUruguayCompany[] {
  return [...companies].sort((left, right) => {
    const leftValue = left.valuation && left.valuation > 0 ? left.valuation : Number.POSITIVE_INFINITY;
    const rightValue = right.valuation && right.valuation > 0 ? right.valuation : Number.POSITIVE_INFINITY;

    if (Number.isFinite(leftValue) && Number.isFinite(rightValue) && leftValue !== rightValue) {
      return rightValue - leftValue;
    }

    if (Number.isFinite(leftValue) && !Number.isFinite(rightValue)) {
      return -1;
    }

    if (!Number.isFinite(leftValue) && Number.isFinite(rightValue)) {
      return 1;
    }

    return left.name.localeCompare(right.name, "es");
  });
}
