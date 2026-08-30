/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedCompanies } from "@/src/lib/published-companies";
import { siteConfig } from "@/src/lib/site";
import { slugifyCompanyName, sortCompanies } from "@/src/lib/techsuruguay";

type CompanyPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

async function getCompany(slug: string) {
  const companies = sortCompanies(await getPublishedCompanies());
  const company = companies.find((item) => slugifyCompanyName(item.name) === slug);

  return { company, position: company ? companies.indexOf(company) + 1 : null };
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { company } = await getCompany(slug);

  if (!company) return {};

  const title = `${company.name}: empresa ${company.sector || "tecnológica"} de Uruguay`;
  const description = company.description || `${company.name} forma parte del directorio de startups y empresas de tecnología de Uruguay.`;
  const canonical = `/empresas/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      locale: siteConfig.locale,
      url: canonical,
      title,
      description,
      images: company.logoUrl ? [{ url: company.logoUrl, alt: `Logo de ${company.name}` }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: company.logoUrl ? [company.logoUrl] : undefined,
    },
  };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const { company, position } = await getCompany(slug);

  if (!company || !position) notFound();

  const profileUrl = new URL(`/empresas/${slug}`, siteConfig.url).toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${profileUrl}#organization`,
    name: company.name,
    url: profileUrl,
    sameAs: company.website || undefined,
    description: company.description || undefined,
    foundingDate: company.founded ? String(company.founded) : undefined,
    industry: company.sector || undefined,
    logo: company.logoUrl ? new URL(company.logoUrl, siteConfig.url).toString() : undefined,
    areaServed: {
      "@type": "Country",
      name: siteConfig.countryName,
    },
    knowsAbout: company.services.length ? company.services : undefined,
  };

  return (
    <div className="site-shell min-h-dvh">
      <main className="landing-main mobile-safe-area mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-950 underline decoration-slate-500 underline-offset-4 transition hover:text-red-800">
        Volver al ranking de empresas tech uruguayas
      </Link>

      <article className="company-profile">
        <header className="company-profile-header">
          {company.logoUrl ? <img src={company.logoUrl} alt={`Logo de ${company.name}`} width={128} height={128} className="company-profile-logo" /> : null}
          <div>
            <p className="section-kicker">Posición editorial {String(position).padStart(2, "0")}</p>
            <h1>{company.name}: empresa {company.sector || "tecnológica"} de Uruguay</h1>
            <p>{company.description || "Esta empresa todavía no tiene una descripción editorial publicada."}</p>
          </div>
        </header>

        <dl className="company-profile-facts">
          <div><dt>Tipo de empresa</dt><dd>{company.sector || "Sin clasificar"}</dd></div>
          <div><dt>Año de fundación</dt><dd>{company.founded ?? "Sin datos"}</dd></div>
          <div><dt>Valoración estimada</dt><dd>{company.valuation ? `U$S ${company.valuation.toLocaleString("es-UY")}` : "Sin datos"}</dd></div>
        </dl>

        {company.services.length ? (
          <section className="company-profile-section" aria-labelledby="services-title">
            <h2 id="services-title">Servicios y áreas de trabajo</h2>
            <ul>{company.services.map((service) => <li key={service}>{service}</li>)}</ul>
          </section>
        ) : null}

        <section className="company-profile-section" aria-labelledby="team-title">
          <h2 id="team-title">Equipo e integrantes</h2>
          {company.founders.length ? (
            <ul>{company.founders.map((founder) => <li key={`${founder.name}-${founder.role}`}>{founder.name}{founder.role ? ` — ${founder.role}` : ""}</li>)}</ul>
          ) : <p>Sin integrantes publicados en esta ficha.</p>}
        </section>

        {company.website ? (
          <a href={company.website} target="_blank" rel="noreferrer" className="company-profile-link">
            Visitar sitio oficial de {company.name}
          </a>
        ) : null}
      </article>
      </main>
    </div>
  );
}
