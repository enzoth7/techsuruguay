"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import {
  cloneCompanies,
  formatFounderCountries,
  formatFounded,
  formatInitials,
  formatMoney,
  mergeCompanies,
  sortCompanies,
  TECHSURUGUAY_COMPANIES,
  type TechUruguayCompany,
} from "@/src/lib/techsuruguay";
import { getOnlineCompanies } from "@/src/lib/online-companies";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/src/lib/supabase/client";
import {
  SUPPORT_ECOSYSTEM_DESCRIPTION,
  SUPPORT_ECOSYSTEM_ID,
  SUPPORT_ECOSYSTEM_TITLE,
  SUPPORT_ORGANIZATIONS,
} from "@/src/lib/support-organizations";

type RankedCompany = TechUruguayCompany & { position: number };
type RankingSort = "position" | "founded";
type SortDirection = "asc" | "desc";

function getRankedCompanies(companies: TechUruguayCompany[]): RankedCompany[] {
  return sortCompanies(companies).map((company, index) => ({ ...company, position: index + 1 }));
}

function getRankTone(position: number) {
  if (position === 1) return "rank-gold";
  if (position === 2) return "rank-silver";
  if (position === 3) return "rank-bronze";
  if (position <= 10) return "rank-red";
  if (position <= 20) return "rank-blue";
  return "rank-graphite";
}

function getPodiumStyle(position: number): CSSProperties {
  const minHeight = position === 1
    ? "clamp(12rem, 24vw, 18.5rem)"
    : position === 2
      ? "clamp(10.5rem, 21vw, 16.5rem)"
      : "clamp(10rem, 20vw, 15.5rem)";
  const shared: CSSProperties = {
    border: "1px solid rgba(15, 23, 42, 0.15)",
    borderRadius: "1.35rem 1.35rem 0.4rem 0.4rem",
    boxShadow: "0 22px 55px rgba(15, 23, 42, 0.18)",
    minHeight,
  };

  if (position === 1) {
    return {
      ...shared,
      borderTop: "6px solid #684200",
      background: "linear-gradient(118deg, rgba(255,255,255,0.58), transparent 34%), linear-gradient(145deg, #fff1a8 0%, #e1b73f 56%, #b77705 100%)",
    };
  }

  if (position === 2) {
    return {
      ...shared,
      borderTop: "6px solid #475569",
      background: "linear-gradient(118deg, rgba(255,255,255,0.95), transparent 38%), linear-gradient(145deg, #ffffff 0%, #eceff2 58%, #cbd2d9 100%)",
    };
  }

  return {
    ...shared,
    borderTop: "6px solid #642a08",
    background: "linear-gradient(118deg, rgba(255,255,255,0.42), transparent 34%), linear-gradient(145deg, #f6c59c 0%, #c8753d 56%, #934514 100%)",
  };
}

function CompanyLogo({ company }: { company: TechUruguayCompany }) {
  if (company.logoUrl) {
    return <img src={company.logoUrl} loading="lazy" decoding="async" alt={`Logo de ${company.name}`} className="h-full w-full object-contain" />;
  }

  return <div aria-hidden="true">{formatInitials(company.name)}</div>;
}

function FounderFlags({ countries, compact = false }: { countries: string[]; compact?: boolean }) {
  const label = formatFounderCountries(countries);

  return (
    <span
      className={`founder-flags${compact ? " is-compact" : ""}`}
      role="img"
      aria-label={`País de origen de los fundadores: ${label}`}
      title={label}
    >
      {countries.map((country) => (
        <span key={country} className={`fi fi-${country.toLocaleLowerCase("en")}`} aria-hidden="true" />
      ))}
    </span>
  );
}

function ValuationInfo({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const tooltipId = mobile ? "valuation-info-mobile" : "valuation-info-desktop";
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeFromOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeFromKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        rootRef.current?.querySelector<HTMLButtonElement>("button")?.blur();
      }
    };

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeFromKeyboard);

    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeFromKeyboard);
    };
  }, [open]);

  return (
    <span ref={rootRef} className={`valuation-info${mobile ? " is-mobile" : ""}`} data-open={open || undefined}>
      {mobile ? <span className="valuation-info-label">Valoración estimada</span> : null}
      <button
        type="button"
        className="valuation-info-trigger"
        aria-label="Qué incluye la valoración estimada"
        aria-expanded={open}
        aria-controls={tooltipId}
        onClick={(event) => {
          if (open) event.currentTarget.blur();
          setOpen(!open);
        }}
      >
        <span aria-hidden="true">?</span>
      </button>
      <span id={tooltipId} role="tooltip" className="valuation-info-tooltip">
        Valoración estimada: incluye rondas de inversión, facturación anual divulgada, etc.
      </span>
    </span>
  );
}

function PodiumCompany({ company, onSelect }: { company: RankedCompany; onSelect: () => void }) {
  return (
    <article className={`podium-entry podium-${company.position} ${getRankTone(company.position)}`} style={getPodiumStyle(company.position)}>
      <button type="button" className="podium-action" onClick={onSelect} aria-label={`Ver a ${company.name} en la posición ${company.position} del ranking`}>
        <p className="podium-rank">P{company.position}</p>
        <div className="podium-logo"><CompanyLogo company={company} /></div>
        <div className="podium-copy">
          <h3>{company.name}</h3>
          <p>{company.sector || "Sin clasificar"}</p>
        </div>
      </button>
    </article>
  );
}

function RankingRow({ company, expanded, onToggle }: { company: RankedCompany; expanded: boolean; onToggle: () => void }) {
  const detailsId = `empresa-${company.position}`;
  const rankTone = getRankTone(company.position);

  return (
    <li id={`ranking-company-${company.position}`} className={`ranking-item ${rankTone}${expanded ? " is-open" : ""}`}>
      <button type="button" aria-expanded={expanded} aria-controls={detailsId} onClick={onToggle} className="ranking-row">
        <div className="ranking-position" style={{ paddingInlineStart: "clamp(0rem, calc((48rem - 100vw) * 999), 0.75rem)" }}>{String(company.position).padStart(2, "0")}</div>
        <div className="ranking-company">
          <div className="ranking-logo"><CompanyLogo company={company} /></div>
          <div className="min-w-0 text-left">
            <div className="ranking-name">{company.name}</div>
            <div className="ranking-mobile-meta">
              <span className="ranking-mobile-valuation">{formatMoney(company.valuation)}</span>
              <FounderFlags countries={company.countries} compact />
            </div>
          </div>
        </div>
        <div className="ranking-cell ranking-type">{company.sector || "Sin clasificar"}</div>
        <div className="ranking-cell ranking-founded">{formatFounded(company.founded)}</div>
        <div className="ranking-cell ranking-country"><FounderFlags countries={company.countries} /></div>
        <div className="ranking-cell ranking-money">{formatMoney(company.valuation)}</div>
        <div className="ranking-chevron" aria-hidden="true">{expanded ? "−" : "+"}</div>
      </button>

      {expanded ? (
        <div id={detailsId} className="ranking-details">
          <dl className="ranking-mobile-facts">
            <div style={{ padding: 0, border: 0, borderRadius: 0, background: "transparent" }}>
              <dt>Tipo de empresa</dt>
              <dd>{company.sector || "Sin clasificar"}</dd>
            </div>
            <div style={{ padding: 0, border: 0, borderRadius: 0, background: "transparent" }}>
              <dt>Año de fundación</dt>
              <dd>{formatFounded(company.founded)}</dd>
            </div>
            <div style={{ padding: 0, border: 0, borderRadius: 0, background: "transparent" }}>
              <dt>País de los fundadores</dt>
              <dd><FounderFlags countries={company.countries} /></dd>
            </div>
          </dl>
          <div className="grid gap-7 md:grid-cols-[minmax(0,1.45fr)_minmax(220px,0.85fr)]">
            <div>
              <p className="ranking-detail-label">Acerca de</p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">{company.description || "Esta empresa todavía no tiene una descripción publicada."}</p>
              {company.services.length ? (
                <ul className="mt-5 grid gap-x-6 gap-y-2 text-sm text-slate-700 sm:grid-cols-2">
                  {company.services.map((service) => <li key={service}>— {service}</li>)}
                </ul>
              ) : null}
            </div>
            <div className="border-t border-slate-900/15 pt-6 md:border-l md:border-t-0 md:pl-7 md:pt-0">
              <p className="ranking-detail-label">Integrantes</p>
              {company.founders.length ? (
                <ul className="mt-3 space-y-3">
                  {company.founders.map((founder) => (
                    <li key={`${founder.name}-${founder.role}`}>
                      <p className="text-sm font-semibold text-slate-950">{founder.name}</p>
                      {founder.role ? <p className="mt-0.5 text-sm text-slate-600">{founder.role}</p> : null}
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-3 text-sm text-slate-600">Sin integrantes cargados.</p>}
              {company.website ? (
                <a href={company.website} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-slate-950 underline decoration-slate-500 underline-offset-4 transition hover:text-red-800">Visitar sitio</a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function SectorFilter({
  sectors,
  selectedSector,
  onSelect,
}: {
  sectors: string[];
  selectedSector: string;
  onSelect: (sector: string) => void;
}) {
  const currentLabel = selectedSector === "all" ? "Tipo" : selectedSector;

  const chooseSector = (event: MouseEvent<HTMLButtonElement>, sector: string) => {
    onSelect(sector);
    event.currentTarget.closest("details")?.removeAttribute("open");
  };

  return (
    <details className="ranking-sector-filter">
      <summary
        className="ranking-sector-trigger"
        aria-label={`Filtrar por tipo de empresa. Selección actual: ${currentLabel}`}
      >
        {currentLabel}
      </summary>
      <div className="ranking-sector-panel" role="group" aria-label="Tipos de empresa">
        <button
          className="ranking-sector-option"
          type="button"
          aria-pressed={selectedSector === "all"}
          onClick={(event) => chooseSector(event, "all")}
        >
          Todos los tipos
        </button>
        {sectors.map((sector) => (
          <button
            className="ranking-sector-option"
            key={sector}
            type="button"
            aria-pressed={selectedSector === sector}
            onClick={(event) => chooseSector(event, sector)}
          >
            {sector}
          </button>
        ))}
      </div>
    </details>
  );
}

function SupportEcosystem() {
  return (
    <section id={SUPPORT_ECOSYSTEM_ID} className="supporters-section" aria-labelledby="supporters-title">
      <div className="supporters-header">
        <h2 id="supporters-title">{SUPPORT_ECOSYSTEM_TITLE}</h2>
        <p className="supporters-intro">{SUPPORT_ECOSYSTEM_DESCRIPTION}</p>
      </div>

      <div className="supporters-marquee" aria-label="Organizaciones que apoyan a emprendimientos en Uruguay">
        <div className="supporters-marquee-track">
          <div className="supporters-marquee-group">
            {SUPPORT_ORGANIZATIONS.map((organization) => (
              <a
                key={organization.name}
                href={organization.website}
                target="_blank"
                rel="noreferrer"
                className={`supporter-logo-link${"darkLogo" in organization ? " is-dark" : ""}`}
                aria-label={`Visitar el sitio de ${organization.name}`}
              >
                <img
                  src={organization.logo}
                  alt={`Logo de ${organization.name}`}
                  loading="lazy"
                  decoding="async"
                  className={"cropLogo" in organization ? "is-cropped" : undefined}
                />
              </a>
            ))}
          </div>
          <div className="supporters-marquee-group" aria-hidden="true">
            {SUPPORT_ORGANIZATIONS.map((organization) => (
              <a
                key={`duplicate-${organization.name}`}
                href={organization.website}
                target="_blank"
                rel="noreferrer"
                tabIndex={-1}
                className={`supporter-logo-link${"darkLogo" in organization ? " is-dark" : ""}`}
              >
                <img
                  src={organization.logo}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={"cropLogo" in organization ? "is-cropped" : undefined}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TechUruguayLanding({ initialCompanies = TECHSURUGUAY_COMPANIES }: { initialCompanies?: TechUruguayCompany[] }) {
  const [companies, setCompanies] = useState<TechUruguayCompany[]>(() => cloneCompanies(initialCompanies));
  const [openName, setOpenName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [rankingSort, setRankingSort] = useState<RankingSort>("position");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    getOnlineCompanies(createSupabaseBrowserClient())
      .then((onlineCompanies) => {
        if (onlineCompanies?.length) setCompanies(mergeCompanies(TECHSURUGUAY_COMPANIES, onlineCompanies));
      })
      .catch(() => { /* Keep the bundled ranking if the public database is unavailable. */ });
  }, []);

  const ranked = useMemo(() => getRankedCompanies(companies), [companies]);
  const podium = useMemo(
    () => [ranked[1], ranked[0], ranked[2]].filter((company): company is RankedCompany => Boolean(company)),
    [ranked],
  );
  const sectors = useMemo(
    () => Array.from(new Set(ranked.map((company) => company.sector || "Sin clasificar"))).sort((a, b) => a.localeCompare(b, "es")),
    [ranked],
  );
  const visibleRanked = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("es");

    return ranked
      .filter((company) => !normalizedQuery || company.name.toLocaleLowerCase("es").includes(normalizedQuery))
      .filter((company) => selectedSector === "all" || (company.sector || "Sin clasificar") === selectedSector)
      .slice()
      .sort((a, b) => {
        if (rankingSort === "founded") {
          const isFoundedAEmpty = a.founded === undefined || a.founded === null;
          const isFoundedBEmpty = b.founded === undefined || b.founded === null;
          const foundedA = a.founded ?? 0;
          const foundedB = b.founded ?? 0;
          if (isFoundedAEmpty || isFoundedBEmpty) {
            if (isFoundedAEmpty === isFoundedBEmpty) return 0;
            return isFoundedAEmpty ? 1 : -1;
          }

          const comparison = foundedA - foundedB || a.position - b.position;
          return sortDirection === "asc" ? comparison : -comparison;
        }

        const comparison = a.position - b.position;
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [ranked, rankingSort, searchQuery, selectedSector, sortDirection]);

  const updateRankingSort = (nextSort: RankingSort) => {
    if (rankingSort === nextSort) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setRankingSort(nextSort);
    setSortDirection("asc");
  };

  const positionDirection = rankingSort === "position" ? sortDirection : "asc";
  const foundedDirection = rankingSort === "founded" ? sortDirection : "asc";

  const openFromPodium = (company: RankedCompany) => {
    setOpenName(company.name);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const rankingItem = document.getElementById(`ranking-company-${company.position}`);
        if (!rankingItem) return;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        rankingItem.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        rankingItem.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
      });
    });
  };

  return (
    <div className="site-shell min-h-dvh">
      <main className="landing-main mobile-safe-area mx-auto max-w-7xl pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-6 lg:px-8">
        <header className="landing-hero">
          <h1>Startups y empresas de tecnología en Uruguay.</h1>
          <p className="landing-intro">Un directorio editorial para explorar empresas tech, startups, fintech y compañías de software de Uruguay, junto con incubadoras, aceleradoras y centros que apoyan la innovación y el emprendimiento.</p>
        </header>

        {podium.length === 3 ? (
          <section className="podium-section" style={{ minHeight: "auto" }} aria-labelledby="podium-title">
            <h2 id="podium-title">Las tres que llevan el liderazgo</h2>
            <div className="podium-grid">{podium.map((company) => <PodiumCompany key={company.name} company={company} onSelect={() => openFromPodium(company)} />)}</div>
          </section>
        ) : null}

        <section className="ranking-section" aria-label="Ranking de empresas">
          <div className="ranking-toolbar">
            <div className="ranking-search">
              <label className="sr-only" htmlFor="ranking-search">Buscar empresa</label>
              <input
                className="ranking-search-input"
                id="ranking-search"
                type="search"
                aria-label="Buscar empresa"
                value={searchQuery}
                placeholder="Escribí el nombre de una empresa"
                autoComplete="off"
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setOpenName(null);
                }}
              />
            </div>
          </div>

          <div className="ranking-header">
            <button
              className={`ranking-header-action${rankingSort === "position" ? " is-active" : ""}`}
              type="button"
              aria-pressed={rankingSort === "position"}
              aria-label={`Ordenar por posición. Orden actual: ${positionDirection === "asc" ? "ascendente" : "descendente"}.`}
              data-direction={positionDirection}
              onClick={() => updateRankingSort("position")}
            >
              Pos.
            </button>
            <div>Empresa</div>
            <div className="ranking-mobile-valuation-heading">
              <ValuationInfo mobile />
            </div>
            <div className="ranking-type ranking-type-filter">
              <SectorFilter
                sectors={sectors}
                selectedSector={selectedSector}
                onSelect={(sector) => {
                  setSelectedSector(sector);
                  setOpenName(null);
                }}
              />
            </div>
            <button
              className={`ranking-founded ranking-header-action${rankingSort === "founded" ? " is-active" : ""}`}
              type="button"
              aria-pressed={rankingSort === "founded"}
              aria-label={`Ordenar por fundación. Orden actual: ${foundedDirection === "asc" ? "ascendente" : "descendente"}.`}
              data-direction={foundedDirection}
              onClick={() => updateRankingSort("founded")}
            >
              Fundación
            </button>
            <div className="ranking-country">País</div>
            <div className="ranking-money ranking-valuation-heading">
              <span>Valoración estimada</span>
              <ValuationInfo />
            </div>
            <div className="ranking-chevron-heading" />
          </div>
          <ol className="ranking-list">
            {visibleRanked.length > 0 ? visibleRanked.map((company) => (
              <RankingRow key={company.name} company={company} expanded={openName === company.name} onToggle={() => setOpenName((current) => current === company.name ? null : company.name)} />
            )) : (
              <li className="ranking-empty" aria-live="polite">No encontramos empresas con esos filtros.</li>
            )}
          </ol>
        </section>

        <SupportEcosystem />

        <footer
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "4rem",
            paddingTop: "1.5rem",
          }}
        >
          <a
            href="https://www.enzothome.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-950 underline decoration-slate-500 underline-offset-4 transition hover:text-red-800"
            style={{ gap: "0.75rem" }}
          >
            <img
              src="/LogoET.png"
              alt=""
              width={32}
              height={32}
              style={{ width: "2rem", height: "2rem", flex: "none", borderRadius: "0.35rem", objectFit: "cover" }}
            />
            Página hecha por Enzo Thome
          </a>
        </footer>
      </main>
    </div>
  );
}
