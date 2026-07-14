"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  cloneCompanies,
  formatFounded,
  formatInitials,
  formatMoney,
  formatMoneyShort,
  normalizeCompanies,
  sortCompanies,
  TECHSURUGUAY_COMPANIES,
  TECHSURUGUAY_STORAGE_KEY,
  type TechUruguayCompany,
} from "@/src/lib/techsuruguay";

type RankedCompany = TechUruguayCompany & { position: number };

function getRankedCompanies(companies: TechUruguayCompany[]): RankedCompany[] {
  return sortCompanies(companies).map((company, index) => ({
    ...company,
    position: index + 1,
  }));
}

function sizePreset(position: number) {
  if (position === 1) {
    return {
      card: "min-h-[320px] grid-cols-[220px_minmax(0,1fr)_220px]",
      rankNumber: "text-[120px]",
      logo: "h-20 w-20 text-2xl",
      title: "text-2xl sm:text-3xl",
      meta: "text-sm",
      body: "text-sm sm:text-base",
      sideTitle: "text-2xl sm:text-3xl",
      compact: false,
    };
  }

  if (position <= 5) {
    if (position <= 3) {
      return {
        card: "min-h-[250px] grid-cols-[170px_minmax(0,1fr)_190px]",
        rankNumber: "text-[86px]",
        logo: "h-16 w-16 text-xl",
        title: "text-xl sm:text-2xl",
        meta: "text-sm",
        body: "text-sm",
        sideTitle: "text-xl sm:text-2xl",
        compact: false,
      };
    }

    return {
      card: "min-h-[220px] grid-cols-[150px_minmax(0,1fr)_175px]",
      rankNumber: "text-[86px]",
      logo: "h-16 w-16 text-xl",
      title: "text-xl sm:text-2xl",
      meta: "text-sm",
      body: "text-sm",
      sideTitle: "text-xl sm:text-2xl",
      compact: false,
    };
  }

  if (position <= 10) {
    return {
      card: "min-h-[210px] grid-cols-[130px_minmax(0,1fr)_170px]",
      rankNumber: "text-[64px]",
      logo: "h-14 w-14 text-lg",
      title: "text-lg sm:text-xl",
      meta: "text-xs sm:text-sm",
      body: "text-sm",
      sideTitle: "text-lg sm:text-xl",
      compact: true,
    };
  }

  return {
    card: "min-h-[180px] grid-cols-[96px_minmax(0,1fr)_160px]",
    rankNumber: "text-[46px]",
    logo: "h-12 w-12 text-base",
    title: "text-lg",
    meta: "text-xs",
    body: "text-sm",
    sideTitle: "text-lg",
    compact: true,
  };
}

function rankPreset(position: number, valuation: number | null | undefined) {
  const noData = valuation == null || !Number.isFinite(valuation) || valuation <= 0;

  if (noData) {
    return {
      rail: "from-amber-50 via-stone-100 to-amber-100",
      square: "bg-slate-950 text-stone-800",
      positionText: "text-stone-800",
      valuationText: "text-stone-200",
    };
  }

  if (position === 1) {
    return {
      rail: "from-amber-200 via-yellow-100 to-amber-500",
      square: "bg-slate-950 text-slate-950",
      positionText: "text-slate-950",
      valuationText: "text-sky-100",
    };
  }

  if (position === 2) {
    return {
      rail: "from-slate-100 via-slate-200 to-slate-400",
      square: "bg-slate-950 text-slate-950",
      positionText: "text-slate-950",
      valuationText: "text-slate-100",
    };
  }

  if (position === 3) {
    return {
      rail: "from-orange-300 via-orange-200 to-amber-700",
      square: "bg-slate-950 text-slate-950",
      positionText: "text-slate-950",
      valuationText: "text-orange-100",
    };
  }

  if (position <= 5) {
    return {
      rail: "from-cyan-100 via-sky-100 to-slate-300",
      square: "bg-slate-950 text-slate-950",
      positionText: "text-slate-950",
      valuationText: "text-sky-100",
    };
  }

  if (position <= 10) {
    return {
      rail: "from-sky-500 via-cyan-300 to-slate-900",
      square: "bg-slate-950 text-cyan-100",
      positionText: "text-cyan-100",
      valuationText: "text-cyan-100",
    };
  }

  if (position <= 20) {
    return {
      rail: "from-indigo-500 via-sky-500 to-slate-900",
      square: "bg-slate-950 text-indigo-100",
      positionText: "text-indigo-100",
      valuationText: "text-indigo-100",
    };
  }

  return {
    rail: "from-slate-700 via-slate-900 to-black",
    square: "bg-slate-950 text-slate-100",
    positionText: "text-slate-100",
    valuationText: "text-slate-100",
  };
}

function CompanyLogo({ company, className }: { company: TechUruguayCompany; className: string }) {
  if (company.logoUrl) {
    return (
      <img
        src={company.logoUrl}
        alt={`Logo de ${company.name}`}
        className="h-full w-full object-cover"
      />
    );
  }

  return <span>{formatInitials(company.name)}</span>;
}

function RankedCard({ company }: { company: RankedCompany }) {
  const preset = sizePreset(company.position);
  const rank = rankPreset(company.position, company.valuation);
  const founders = Array.isArray(company.founders) ? company.founders : [];

  return (
    <article
      className={[
        "grid overflow-hidden border border-sky-200/10 bg-slate-950/48 shadow-[0_24px_80px_rgba(8,17,31,0.26)]",
        preset.card,
      ].join(" ")}
    >
      <div
        className={[
          "flex items-center justify-center bg-gradient-to-br px-4 py-4",
          rank.rail,
        ].join(" ")}
      >
        <span
          className={["font-black leading-none tracking-tight", rank.positionText, preset.rankNumber].join(" ")}
        >
          {company.position}
        </span>
      </div>

      <div className="border-x border-sky-200/10 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div className="flex items-start gap-4">
          <div
            className={[
              "flex shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-sky-200/12 bg-gradient-to-br from-sky-200 via-sky-100 to-red-950/30 font-semibold text-slate-950",
              preset.logo,
            ].join(" ")}
          >
            <CompanyLogo company={company} className={preset.logo} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className={[
                    preset.title,
                    "font-semibold text-slate-50 underline decoration-sky-300/40 underline-offset-4 hover:text-sky-50",
                  ].join(" ")}
                >
                  {company.name}
                </a>
              ) : (
                <h3 className={[preset.title, "font-semibold text-slate-50"].join(" ")}>
                  {company.name}
                </h3>
              )}
            </div>

            <p className={["mt-1 font-semibold text-slate-200", preset.meta].join(" ")}>
              {company.sector || "Sin sector"} · {formatFounded(company.founded)} ·{" "}
              {formatMoney(company.valuation)}
            </p>

            <p className={["mt-4 max-w-4xl leading-7 text-slate-300", preset.body].join(" ")}>
              {company.description || "Descripción pendiente."}
            </p>
          </div>
        </div>

        <div className={["mt-5 grid gap-3", preset.compact ? "md:grid-cols-1" : "md:grid-cols-2"].join(" ")}>
          <div className="rounded-2xl border border-sky-200/10 bg-slate-950/45 p-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-sky-200/75">Servicios</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {company.services.slice(0, preset.compact ? 3 : 5).map((service) => (
                <li key={service} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-red-300/10 bg-slate-950/45 p-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-red-200/75">Miembros</p>
            {founders.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {founders.slice(0, preset.compact ? 3 : 5).map((founder) => (
                  <li key={`${founder.name}-${founder.role}`} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300" />
                    <span>
                      <span className="font-medium text-slate-50">{founder.name}</span>
                      {founder.role ? <span className="text-slate-400"> · {founder.role}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Sin miembros cargados.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center border-l border-sky-200/10 bg-slate-950/72 px-5 py-5 text-right">
        <div className="text-center">
          <p className={["text-xs uppercase tracking-[0.28em]", rank.valuationText].join(" ")}>Valoración</p>
          <p className={["mt-3 font-semibold", rank.valuationText, preset.sideTitle].join(" ")}>
            {formatMoneyShort(company.valuation)}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function TechUruguayLanding() {
  const [companies, setCompanies] = useState<TechUruguayCompany[]>(() =>
    cloneCompanies(TECHSURUGUAY_COMPANIES),
  );

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(TECHSURUGUAY_STORAGE_KEY);
      if (stored) {
        setCompanies(normalizeCompanies(JSON.parse(stored)));
      }
    } catch {
      setCompanies(cloneCompanies(TECHSURUGUAY_COMPANIES));
    }
  }, []);

  const ranked = useMemo(() => getRankedCompanies(companies), [companies]);

  const stats = useMemo(() => {
    const totalCompanies = ranked.length;
    const totalSectors = new Set(ranked.map((company) => company.sector || "Sin sector")).size;
    const totalWebsites = ranked.filter((company) => Boolean(company.website)).length;
    return { totalCompanies, totalSectors, totalWebsites };
  }, [ranked]);

  return (
    <div className="min-h-screen text-slate-50">git
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <section className="text-center">
          <h1 className="font-display text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
            Techs Uruguay
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            Ranking editorial de empresas tech uruguayas ordenadas por valoración.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <span className="rounded-full border border-sky-200/10 bg-slate-950/40 px-4 py-2 text-slate-200">
              {stats.totalCompanies} empresas
            </span>
            <span className="rounded-full border border-sky-200/10 bg-slate-950/40 px-4 py-2 text-slate-200">
              {stats.totalSectors} sectores
            </span>
          </div>
        </section>

        <section className="mt-10 space-y-4">
          {ranked.map((company) => (
            <RankedCard key={company.name} company={company} />
          ))}
        </section>
      </main>
    </div>
  );
}
