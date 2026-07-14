"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  cloneCompanies,
  formatBucketLabel,
  formatFounded,
  formatInitials,
  formatMoney,
  normalizeCompanies,
  parseFounderList,
  parseLineList,
  serializeFounderList,
  sortCompanies,
  TECHSURUGUAY_ADMIN_PASSWORD,
  TECHSURUGUAY_ADMIN_SESSION_KEY,
  TECHSURUGUAY_ADMIN_USER,
  TECHSURUGUAY_COMPANIES,
  TECHSURUGUAY_STORAGE_KEY,
  type TechUruguayCompany,
} from "@/src/lib/techsuruguay";

function saveDraft(companies: TechUruguayCompany[]) {
  window.localStorage.setItem(TECHSURUGUAY_STORAGE_KEY, JSON.stringify(companies));
}

function loadDraft(): TechUruguayCompany[] {
  try {
    const stored = window.localStorage.getItem(TECHSURUGUAY_STORAGE_KEY);
    if (stored) {
      return normalizeCompanies(JSON.parse(stored));
    }
  } catch {
    // Keep source data.
  }

  return cloneCompanies(TECHSURUGUAY_COMPANIES);
}

function exportJson(companies: TechUruguayCompany[]) {
  const blob = new Blob([JSON.stringify(companies, null, 2)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "techsuruguay-draft.json";
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function ensureSession() {
  return window.sessionStorage.getItem(TECHSURUGUAY_ADMIN_SESSION_KEY) === "1";
}

export default function TechUruguayAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState<TechUruguayCompany[]>(() =>
    cloneCompanies(TECHSURUGUAY_COMPANIES),
  );
  const [selectedName, setSelectedName] = useState(TECHSURUGUAY_COMPANIES[0]?.name ?? "");
  const [notice, setNotice] = useState("Los cambios se guardan en este navegador.");

  useEffect(() => {
    if (ensureSession()) {
      setAuthenticated(true);
      setCompanies(loadDraft());
    }
  }, []);

  useEffect(() => {
    if (!authenticated && companies.length > 0) {
      setSelectedName(companies[0].name);
    }
  }, [authenticated, companies]);

  const sortedCompanies = useMemo(() => sortCompanies(companies), [companies]);
  const selectedCompany =
    companies.find((company) => company.name === selectedName) ?? companies[0] ?? null;

  const filteredCompanies = sortedCompanies.filter((company) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;

    return (
      company.name.toLowerCase().includes(term) ||
      (company.sector || "").toLowerCase().includes(term) ||
      company.founders.some((founder) => founder.name.toLowerCase().includes(term))
    );
  });

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username === TECHSURUGUAY_ADMIN_USER && password === TECHSURUGUAY_ADMIN_PASSWORD) {
      window.sessionStorage.setItem(TECHSURUGUAY_ADMIN_SESSION_KEY, "1");
      setAuthenticated(true);
      setCompanies(loadDraft());
      setError("");
      setNotice("Sesión abierta. El editor quedó listo.");
      return;
    }

    setError("Usuario o contraseña incorrectos.");
  }

  function handleLogout() {
    window.sessionStorage.removeItem(TECHSURUGUAY_ADMIN_SESSION_KEY);
    setAuthenticated(false);
    setNotice("Sesión cerrada.");
  }

  function updateSelected(patch: Partial<TechUruguayCompany>) {
    if (!selectedCompany) return;

    const nextCompanies = companies.map((company) =>
      company.name === selectedCompany.name ? { ...company, ...patch } : company,
    );

    setCompanies(nextCompanies);
    saveDraft(nextCompanies);
    setNotice("Cambios guardados en localStorage.");
  }

  function handleTextField(
    key: keyof Pick<TechUruguayCompany, "name" | "sector" | "website" | "description" | "logoUrl">,
  ) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      updateSelected({ [key]: value } as Partial<TechUruguayCompany>);
      if (key === "name") {
        setSelectedName(value);
      }
    };
  }

  function handleNumberField(event: ChangeEvent<HTMLInputElement>) {
    updateSelected({
      founded: event.target.value ? Number(event.target.value) : null,
    });
  }

  function handleValuationField(event: ChangeEvent<HTMLInputElement>) {
    updateSelected({
      valuation: event.target.value ? Number(event.target.value) : null,
    });
  }

  function handleServicesField(event: ChangeEvent<HTMLTextAreaElement>) {
    updateSelected({ services: parseLineList(event.target.value) });
  }

  function handleFoundersField(event: ChangeEvent<HTMLTextAreaElement>) {
    updateSelected({ founders: parseFounderList(event.target.value) });
  }

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result ?? "[]"));
        const normalized = normalizeCompanies(parsed);
        setCompanies(normalized);
        saveDraft(normalized);
        setSelectedName(normalized[0]?.name ?? "");
        setNotice("JSON importado y guardado.");
      } catch {
        setNotice("No se pudo importar el JSON.");
      }
    };
    reader.readAsText(file);
  }

  function handleReset() {
    const fresh = cloneCompanies(TECHSURUGUAY_COMPANIES);
    setCompanies(fresh);
    saveDraft(fresh);
    setSelectedName(fresh[0]?.name ?? "");
    setNotice("Restaurado al estado original del Excel.");
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen px-4 py-10 text-stone-100 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
          <form
            onSubmit={handleLogin}
            className="w-full rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:p-8"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-amber-200/70">
              Admin Techs Uruguay
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-stone-50">
              Acceso para editar la base
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              Ingresá con el usuario y la contraseña del panel. Los cambios se guardan en este
              navegador y se pueden exportar a JSON.
            </p>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">
                  Usuario
                </span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-200/50"
                  placeholder="admin"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">
                  Contraseña
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-200/50"
                  placeholder="techsuruguay"
                />
              </label>
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-amber-200 px-5 py-3 font-semibold text-stone-950 transition hover:bg-amber-100"
            >
              Entrar al admin
            </button>

            <Link
              href="/"
              className="mt-4 block text-center text-sm text-stone-400 transition hover:text-amber-100"
            >
              Volver a la landing
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-stone-100">
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-amber-200/70">
              Panel privado
            </p>
            <h1 className="mt-1 text-xl font-semibold text-stone-50">Techs Uruguay Admin</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200 transition hover:border-amber-200/40 hover:text-amber-100"
            >
              Ver landing
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-amber-200 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 text-sm text-stone-300 sm:p-5">
          {notice}
        </div>

        <div className="mt-6 grid gap-8 xl:grid-cols-[0.42fr_0.58fr]">
          <aside className="rounded-[32px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-stone-500">Empresas</p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-50">{companies.length}</h2>
              </div>
              <label className="w-full max-w-[220px]">
                <span className="sr-only">Buscar empresa</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar empresa..."
                  className="w-full rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-200/50"
                />
              </label>
            </div>

            <div className="mt-5 space-y-2">
              {filteredCompanies.map((company) => {
                const active = company.name === selectedName;

                return (
                  <button
                    key={company.name}
                    type="button"
                    onClick={() => setSelectedName(company.name)}
                    className={[
                      "flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left transition",
                      active
                        ? "border-amber-200/40 bg-amber-200/10"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
                    ].join(" ")}
                  >
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-stone-950/55 text-sm font-semibold text-amber-100">
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl ?? ""}
                          alt={company.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        formatInitials(company.name)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-50">{company.name}</p>
                      <p className="truncate text-xs text-stone-400">
                        {company.sector || "Sin sector"} · {formatBucketLabel(company.valuation)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="space-y-6">
            {selectedCompany ? (
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-stone-500">
                      Editor principal
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-stone-50">
                      {selectedCompany.name}
                    </h2>
                    <p className="mt-1 text-sm text-stone-400">
                        {selectedCompany.sector || "Sin sector"} ·{" "}
                      {formatBucketLabel(selectedCompany.valuation)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => exportJson(companies)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200 transition hover:border-amber-200/40 hover:text-amber-100"
                    >
                      Exportar JSON
                    </button>
                    <label className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200 transition hover:border-amber-200/40 hover:text-amber-100">
                      Importar JSON
                      <input
                        type="file"
                        accept="application/json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="rounded-full bg-rose-300/90 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-rose-200"
                    >
                      Restaurar base
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">
                      Nombre
                    </span>
                    <input
                      value={selectedCompany.name}
                      onChange={handleTextField("name")}
                      className="w-full rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-200/50"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">
                      Rubro
                    </span>
                    <input
                      value={selectedCompany.sector}
                      onChange={handleTextField("sector")}
                      className="w-full rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-200/50"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">
                      Fundación
                    </span>
                    <input
                      type="number"
                      value={selectedCompany.founded ?? ""}
                      onChange={handleNumberField}
                      className="w-full rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-200/50"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">
                      Valoración
                    </span>
                    <input
                      type="number"
                      value={selectedCompany.valuation ?? ""}
                      onChange={handleValuationField}
                      className="w-full rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-200/50"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">
                      Web
                    </span>
                    <input
                      value={selectedCompany.website}
                      onChange={handleTextField("website")}
                      className="w-full rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-200/50"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">
                      Logo URL
                    </span>
                    <input
                      value={selectedCompany.logoUrl ?? ""}
                      onChange={handleTextField("logoUrl")}
                      placeholder="https://..."
                      className="w-full rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-200/50"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">
                      Descripci?n
                    </span>
                    <textarea
                      value={selectedCompany.description}
                      onChange={handleTextField("description")}
                      rows={5}
                      className="w-full rounded-3xl border border-white/10 bg-stone-950/60 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-200/50"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">
                      Servicios
                    </span>
                    <textarea
                      value={selectedCompany.services.join("\n")}
                      onChange={handleServicesField}
                      rows={7}
                      placeholder="Una línea por servicio"
                      className="w-full rounded-3xl border border-white/10 bg-stone-950/60 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-200/50"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">
                      Miembros
                    </span>
                    <textarea
                      value={serializeFounderList(selectedCompany.founders)}
                      onChange={handleFoundersField}
                      rows={7}
                      placeholder="Nombre | Cargo"
                      className="w-full rounded-3xl border border-white/10 bg-stone-950/60 px-4 py-3 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-200/50"
                    />
                  </label>
                </div>

                <div className="mt-6 rounded-[28px] border border-white/10 bg-stone-950/45 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-stone-500">
                    Preview
                  </p>
                  <div className="mt-4 flex flex-col gap-4 lg:flex-row">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-stone-200 via-amber-200 to-stone-500 text-2xl font-semibold text-stone-950">
                      {selectedCompany.logoUrl ? (
                        <img
                          src={selectedCompany.logoUrl ?? ""}
                          alt={selectedCompany.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        formatInitials(selectedCompany.name)
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-stone-50">{selectedCompany.name}</h3>
                      <p className="mt-1 text-sm text-stone-400">
                        {selectedCompany.sector || "Sin sector"} · {formatFounded(selectedCompany.founded)}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-stone-300">
                        {selectedCompany.description || "Descripción pendiente."}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.28em] text-stone-500">
                        {formatMoney(selectedCompany.valuation)} ·{" "}
                        {formatBucketLabel(selectedCompany.valuation)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-stone-300">
                No hay empresa seleccionada.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
