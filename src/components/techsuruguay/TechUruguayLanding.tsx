"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  cloneCompanies,
  formatFounded,
  formatInitials,
  formatMoney,
  sortCompanies,
  TECHSURUGUAY_COMPANIES,
  type TechUruguayCompany,
} from "@/src/lib/techsuruguay";
import { getOnlineCompanies } from "@/src/lib/online-companies";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/src/lib/supabase/client";

type RankedCompany = TechUruguayCompany & { position: number };

function getRankedCompanies(companies: TechUruguayCompany[]): RankedCompany[] {
  return sortCompanies(companies).map((company, index) => ({ ...company, position: index + 1 }));
}

function CompanyLogo({ company }: { company: TechUruguayCompany }) {
  if (company.logoUrl) {
    return <img src={company.logoUrl} loading="lazy" decoding="async" alt={`Logo de ${company.name}`} className="h-full w-full object-cover" />;
  }

  return <span aria-hidden="true">{formatInitials(company.name)}</span>;
}

function RankingRow({
  company,
  expanded,
  onToggle,
}: {
  company: RankedCompany;
  expanded: boolean;
  onToggle: () => void;
}) {
  const detailsId = `empresa-${company.position}`;

  return (
    <li className={expanded ? "ranking-item is-open" : "ranking-item"}>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={detailsId}
        onClick={onToggle}
        className="ranking-row"
      >
        <span className="ranking-position">{String(company.position).padStart(2, "0")}</span>
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/[0.07] text-xs font-bold text-cyan-100">
            <CompanyLogo company={company} />
          </span>
          <span className="min-w-0 text-left">
            <span className="block truncate text-base font-semibold tracking-[-0.02em] text-white sm:text-lg">{company.name}</span>
            <span className="mt-0.5 block truncate text-xs text-slate-400 md:hidden">{company.sector || "Sin clasificar"}</span>
          </span>
        </span>
        <span className="ranking-cell ranking-type">{company.sector || "Sin clasificar"}</span>
        <span className="ranking-cell ranking-founded">{formatFounded(company.founded)}</span>
        <span className="ranking-cell ranking-money">{formatMoney(company.valuation)}</span>
        <span className="ranking-chevron" aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>

      {expanded ? (
        <div id={detailsId} className="ranking-details">
          <div className="grid gap-7 md:grid-cols-[minmax(0,1.45fr)_minmax(220px,0.85fr)]">
            <div>
              <p className="ranking-detail-label">Acerca de</p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                {company.description || "Esta empresa todavía no tiene una descripción publicada."}
              </p>
              {company.services.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {company.services.map((service) => (
                    <span key={service} className="rounded-full border border-cyan-200/15 bg-cyan-100/[0.06] px-3 py-1 text-xs text-cyan-100">
                      {service}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="border-t border-white/10 pt-6 md:border-l md:border-t-0 md:pl-7 md:pt-0">
              <p className="ranking-detail-label">Integrantes</p>
              {company.founders.length ? (
                <ul className="mt-3 space-y-3">
                  {company.founders.map((founder) => (
                    <li key={`${founder.name}-${founder.role}`}>
                      <p className="text-sm font-medium text-white">{founder.name}</p>
                      {founder.role ? <p className="mt-0.5 text-sm text-slate-400">{founder.role}</p> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Sin integrantes cargados.</p>
              )}
              {company.website ? (
                <a href={company.website} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 underline decoration-cyan-300/40 underline-offset-4 transition hover:text-white">
                  Visitar sitio <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
}

export default function TechUruguayLanding() {
  const [companies, setCompanies] = useState<TechUruguayCompany[]>(() => cloneCompanies(TECHSURUGUAY_COMPANIES));
  const [openName, setOpenName] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    getOnlineCompanies(createSupabaseBrowserClient())
      .then((onlineCompanies) => {
        if (onlineCompanies?.length) setCompanies(onlineCompanies);
      })
      .catch(() => {
        // Keep the bundled ranking available if the public database is temporarily unavailable.
      });
  }, []);

  const ranked = useMemo(() => getRankedCompanies(companies), [companies]);
  const sectors = useMemo(() => new Set(ranked.map((company) => company.sector || "Sin clasificar")).size, [ranked]);

  return (
    <div className="site-shell min-h-dvh text-slate-50">
      <main className="mobile-safe-area mx-auto max-w-7xl pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/45 px-5 py-8 shadow-[0_32px_100px_rgba(2,8,23,0.32)] backdrop-blur-sm sm:rounded-[36px] sm:px-9 sm:py-11">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_45%,rgba(34,211,238,0.18),transparent_47%)]" />
          <div className="relative max-w-4xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-200/80 sm:text-xs">Ecosistema tecnológico uruguayo</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-white sm:text-6xl">El ranking que sigue a las techs de Uruguay.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Una lectura rápida y ordenada de las empresas que están construyendo tecnología desde Uruguay.</p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5 text-sm">
              <p><span className="font-semibold text-white">{ranked.length}</span> <span className="text-slate-400">empresas</span></p>
              <p><span className="font-semibold text-white">{sectors}</span> <span className="text-slate-400">tipos de empresa</span></p>
              <p className="text-slate-400">Hacé clic en una fila para ver el detalle.</p>
            </div>
          </div>
        </section>

        <section className="mt-8 sm:mt-10" aria-labelledby="ranking-title">
          <div className="mb-4 flex items-end justify-between gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-200/75">Clasificación</p>
              <h2 id="ranking-title" className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">Empresas en foco</h2>
            </div>
            <p className="hidden text-right text-xs text-slate-400 sm:block">Datos consultados desde la base editorial.</p>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/55 shadow-[0_24px_80px_rgba(2,8,23,0.22)] sm:rounded-[30px]">
            <div className="ranking-header" aria-hidden="true">
              <span>Pos.</span><span>Empresa</span><span className="ranking-type">Tipo</span><span className="ranking-founded">Fundación</span><span className="ranking-money">Valoración</span><span />
            </div>
            <ol className="divide-y divide-white/10">
              {ranked.map((company) => (
                <RankingRow
                  key={company.name}
                  company={company}
                  expanded={openName === company.name}
                  onToggle={() => setOpenName((current) => current === company.name ? null : company.name)}
                />
              ))}
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}
