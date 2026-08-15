"use client";

import { useEffect, useMemo, useState } from "react";
import {
  cloneCompanies,
  formatFounded,
  formatInitials,
  formatMoney,
  formatMoneyShort,
  normalizeCompanies,
  mergeCompanies,
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
      card: "lg:min-h-[320px] lg:grid-cols-[220px_minmax(0,1fr)_220px]",
      rankNumber: "text-4xl lg:text-[120px]",
      logo: "h-16 w-16 text-xl sm:h-20 sm:w-20 sm:text-2xl",
      title: "text-xl sm:text-3xl",
      meta: "text-sm",
      body: "text-base",
      sideTitle: "text-2xl sm:text-3xl",
      compact: false,
    };
  }

  if (position <= 5) {
    if (position <= 3) {
      return {
        card: "lg:min-h-[250px] lg:grid-cols-[170px_minmax(0,1fr)_190px]",
        rankNumber: "text-4xl lg:text-[86px]",
        logo: "h-16 w-16 text-xl",
        title: "text-xl sm:text-2xl",
        meta: "text-sm",
        body: "text-base",
        sideTitle: "text-xl sm:text-2xl",
        compact: false,
      };
    }

    return {
      card: "lg:min-h-[220px] lg:grid-cols-[150px_minmax(0,1fr)_175px]",
      rankNumber: "text-4xl lg:text-[86px]",
      logo: "h-16 w-16 text-xl",
      title: "text-xl sm:text-2xl",
      meta: "text-sm",
      body: "text-base",
      sideTitle: "text-xl sm:text-2xl",
      compact: false,
    };
  }

  if (position <= 10) {
    return {
      card: "lg:min-h-[210px] lg:grid-cols-[130px_minmax(0,1fr)_170px]",
      rankNumber: "text-4xl lg:text-[64px]",
      logo: "h-14 w-14 text-lg",
      title: "text-lg sm:text-xl",
      meta: "text-xs sm:text-sm",
      body: "text-base",
      sideTitle: "text-lg sm:text-xl",
      compact: true,
    };
  }

  return {
    card: "lg:min-h-[180px] lg:grid-cols-[96px_minmax(0,1fr)_160px]",
    rankNumber: "text-3xl lg:text-[46px]",
    logo: "h-12 w-12 text-base",
    title: "text-lg",
    meta: "text-xs",
    body: "text-base",
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
        loading="lazy"
        decoding="async"
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
        "grid min-w-0 grid-cols-1 overflow-hidden rounded-[28px] border border-sky-200/10 bg-slate-950/48 shadow-[0_24px_80px_rgba(8,17,31,0.26)] sm:rounded-[32px]",
        preset.card,
      ].join(" ")}
    >
      <div
        className={[
          "flex min-h-16 items-center justify-between bg-gradient-to-br px-4 py-3 sm:px-5 lg:min-h-0 lg:justify-center lg:px-4 lg:py-4",
          rank.rail,
        ].join(" ")}
      >
        <span
          className={[
            "text-[10px] font-semibold uppercase tracking-[0.24em] lg:hidden",
            rank.positionText,
          ].join(" ")}
          aria-hidden="true"
        >
          Puesto en el ranking
        </span>
        <span
          className={["font-black leading-none tracking-tight", rank.positionText, preset.rankNumber].join(" ")}
        >
          <span className="sr-only">Puesto </span>
          {company.position}
        </span>
      </div>

      <div className="min-w-0 border-y border-sky-200/10 px-4 py-5 sm:px-5 lg:border-x lg:border-y-0 lg:px-6 lg:py-6">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
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
                    "inline-flex min-h-11 max-w-full touch-manipulation items-center break-words font-semibold leading-tight text-slate-50 underline decoration-sky-300/40 underline-offset-4 transition hover:text-sky-50 active:opacity-75 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300 [overflow-wrap:anywhere]",
                  ].join(" ")}
                >
                  {company.name}
                </a>
              ) : (
                <h3
                  className={[
                    preset.title,
                    "break-words font-semibold leading-tight text-slate-50 [overflow-wrap:anywhere]",
                  ].join(" ")}
                >
                  {company.name}
                </h3>
              )}
            </div>

            <p
              className={[
                "mt-1 break-words font-semibold leading-5 text-slate-200 [overflow-wrap:anywhere]",
                preset.meta,
              ].join(" ")}
            >
              {company.sector || "Sin sector"} · {formatFounded(company.founded)} ·{" "}
              {formatMoney(company.valuation)}
            </p>

            <p
              className={[
                "mt-3 max-w-4xl break-words leading-6 text-slate-300 sm:mt-4 sm:leading-7 [overflow-wrap:anywhere]",
                preset.body,
              ].join(" ")}
            >
              {company.description || "Descripción pendiente."}
            </p>
          </div>
        </div>

        <div className={["mt-5 grid gap-3", preset.compact ? "md:grid-cols-1" : "md:grid-cols-2"].join(" ")}>
          <div className="rounded-2xl border border-sky-200/10 bg-slate-950/45 p-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-sky-200/75">Servicios</p>
            <ul className="mt-3 space-y-2 text-base text-slate-200 sm:text-sm">
              {company.services.slice(0, preset.compact ? 3 : 5).map((service) => (
                <li key={service} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                  <span className="break-words [overflow-wrap:anywhere]">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-red-300/10 bg-slate-950/45 p-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-red-200/75">Miembros</p>
            {founders.length > 0 ? (
              <ul className="mt-3 space-y-2 text-base text-slate-200 sm:text-sm">
                {founders.slice(0, preset.compact ? 3 : 5).map((founder) => (
                  <li key={`${founder.name}-${founder.role}`} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300" />
                    <span className="break-words [overflow-wrap:anywhere]">
                      <span className="font-medium text-slate-50">{founder.name}</span>
                      {founder.role ? <span className="text-slate-400"> · {founder.role}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-base text-slate-400 sm:text-sm">Sin miembros cargados.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center bg-slate-950/72 px-4 py-4 sm:px-5 lg:justify-center lg:border-l lg:py-5">
        <div className="flex w-full items-center justify-between gap-4 lg:block lg:text-center">
          <p className={["text-xs uppercase tracking-[0.28em]", rank.valuationText].join(" ")}>Valoración</p>
          <p className={["font-semibold lg:mt-3", rank.valuationText, preset.sideTitle].join(" ")}>
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
        setCompanies(mergeCompanies(cloneCompanies(TECHSURUGUAY_COMPANIES), normalizeCompanies(JSON.parse(stored))));
      }
    } catch {
      setCompanies(cloneCompanies(TECHSURUGUAY_COMPANIES));
    }
  }, []);

  const ranked = useMemo(() => getRankedCompanies(companies), [companies]);

  const stats = useMemo(() => {
    const totalCompanies = ranked.length;
    const totalSectors = new Set(ranked.map((company) => company.sector || "Sin sector")).size;
    return { totalCompanies, totalSectors };
  }, [ranked]);

  return (
    <div className="min-h-dvh text-slate-50">
      <main className="mobile-safe-area mx-auto max-w-7xl pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pt-14">
        <section className="text-center">
          <h1 className="font-display text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
            Techs Uruguay
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            Ranking editorial de empresas tech uruguayas ordenadas por valoración.
          </p>

          <div className="mx-auto mt-7 grid max-w-sm grid-cols-2 gap-2 text-sm sm:mt-8 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-3">
            <span className="flex min-h-11 items-center justify-center rounded-full border border-sky-200/10 bg-slate-950/40 px-3 py-2 text-center text-slate-200 sm:px-4">
              {stats.totalCompanies} empresas
            </span>
            <span className="flex min-h-11 items-center justify-center rounded-full border border-sky-200/10 bg-slate-950/40 px-3 py-2 text-center text-slate-200 sm:px-4">
              {stats.totalSectors} sectores
            </span>
          </div>
        </section>

        <section className="mt-8 space-y-4 sm:mt-10" aria-label="Ranking de empresas tech de Uruguay">
          {ranked.map((company) => (
            <RankedCard key={company.name} company={company} />
          ))}
        </section>
      </main>
    </div>
  );
}
