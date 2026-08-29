"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  cloneCompanies,
  createBlankCompany,
  formatBucketLabel,
  formatFounded,
  formatInitials,
  formatMoney,
  normalizeCompanies,
  parseFounderList,
  parseLineList,
  serializeFounderList,
  sortCompanies,
  TECHSURUGUAY_COMPANIES,
  type TechUruguayCompany,
} from "@/src/lib/techsuruguay";
import { getOnlineCompanies, isCurrentUserAdmin, saveOnlineCompanies } from "@/src/lib/online-companies";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/src/lib/supabase/client";

const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function uniqueName(companies: TechUruguayCompany[]) {
  const base = "Nueva empresa";
  if (!companies.some((company) => company.name === base)) return base;
  let index = 2;
  while (companies.some((company) => company.name === `${base} ${index}`)) index += 1;
  return `${base} ${index}`;
}

function downloadJson(companies: TechUruguayCompany[]) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(companies, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "techsuruguay-empresas.json";
  link.click();
  URL.revokeObjectURL(url);
}

function logoExtension(file: File) {
  return file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
}

export default function TechUruguayAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("Iniciá sesión para administrar las empresas publicadas.");
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState<TechUruguayCompany[]>(() => cloneCompanies(TECHSURUGUAY_COMPANIES));
  const [selectedName, setSelectedName] = useState(TECHSURUGUAY_COMPANIES[0]?.name ?? "");
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function loadCompanies() {
    const published = await getOnlineCompanies(createSupabaseBrowserClient());
    const next = published && published.length ? published : cloneCompanies(TECHSURUGUAY_COMPANIES);
    const hasPublishedCompanies = next === published;
    setCompanies(next);
    setSelectedName(next[0]?.name ?? "");
    setHasChanges(!hasPublishedCompanies);
  }

  useEffect(() => {
    async function restoreSession() {
      if (!isSupabaseConfigured()) {
        setChecking(false);
        return;
      }
      try {
        const client = createSupabaseBrowserClient();
        const { data: sessionData } = await client.auth.getSession();
        if (!sessionData.session) return;

        const { data, error: userError } = await client.auth.getUser();
        if (userError) throw userError;
        if (data.user && (await isCurrentUserAdmin(client, data.user.id))) {
          setAuthenticated(true);
          await loadCompanies();
          setNotice("Sesión restaurada. Los cambios se publican para todos los visitantes.");
        }
      } catch {
        setError("No se pudo verificar la sesión. Volvé a ingresar.");
      } finally {
        setChecking(false);
      }
    }
    void restoreSession();
  }, []);

  const selected = companies.find((company) => company.name === selectedName) ?? companies[0] ?? null;
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sortCompanies(companies);
    return sortCompanies(companies).filter((company) =>
      company.name.toLowerCase().includes(term) ||
      company.sector.toLowerCase().includes(term) ||
      company.founders.some((founder) => founder.name.toLowerCase().includes(term)),
    );
  }, [companies, query]);

  function updateSelected(patch: Partial<TechUruguayCompany>) {
    if (!selected) return;
    setCompanies((current) => current.map((company) => company.name === selected.name ? { ...company, ...patch } : company));
    setHasChanges(true);
  }

  function textField(key: keyof Pick<TechUruguayCompany, "name" | "sector" | "website" | "description" | "logoUrl">) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      updateSelected({ [key]: value } as Partial<TechUruguayCompany>);
      if (key === "name") setSelectedName(value);
    };
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!isSupabaseConfigured()) {
      setError("Falta completar la conexión de Supabase antes de iniciar sesión.");
      return;
    }
    try {
      const client = createSupabaseBrowserClient();
      const { data, error: loginError } = await client.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      if (!data.user || !(await isCurrentUserAdmin(client, data.user.id))) {
        await client.auth.signOut();
        throw new Error("Tu cuenta no tiene permiso para administrar este sitio.");
      }
      await loadCompanies();
      setPassword("");
      setAuthenticated(true);
      setNotice("Sesión iniciada. Guardá para publicar los cambios online.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión.");
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      await saveOnlineCompanies(createSupabaseBrowserClient(), normalizeCompanies(companies));
      setHasChanges(false);
      setNotice("Cambios publicados correctamente. Ya se ven en la página pública.");
    } catch (caught) {
      setError(caught instanceof Error ? `No se pudieron publicar los cambios: ${caught.message}` : "No se pudieron publicar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = normalizeCompanies(JSON.parse(String(reader.result ?? "[]")));
        setCompanies(imported);
        setSelectedName(imported[0]?.name ?? "");
        setHasChanges(true);
        setNotice("Archivo importado. Revisá los datos y guardá para publicarlo.");
      } catch {
        setError("No se pudo leer ese archivo JSON.");
      }
    };
    reader.readAsText(file);
  }

  async function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ALLOWED_LOGO_TYPES.has(file.type)) {
      setError("El logo debe ser una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      setError("El logo no puede pesar más de 5 MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const client = createSupabaseBrowserClient();
      const path = `logos/${crypto.randomUUID()}.${logoExtension(file)}`;
      const { error: uploadError } = await client.storage.from("company-logos").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) throw uploadError;
      updateSelected({ logoUrl: client.storage.from("company-logos").getPublicUrl(path).data.publicUrl });
      setNotice("Logo cargado. Guardá los cambios para asociarlo a la empresa.");
    } catch (caught) {
      setError(caught instanceof Error ? `No se pudo cargar el logo: ${caught.message}` : "No se pudo cargar el logo.");
    } finally {
      setUploading(false);
    }
  }

  if (checking) return <div className="min-h-screen px-6 py-10 text-stone-200">Verificando acceso…</div>;

  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-10 text-stone-100">
        <section className="rounded-[32px] border border-amber-200/20 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.4)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-amber-200/70">Admin Techs Uruguay</p>
          <h1 className="mt-4 text-3xl font-semibold text-stone-50">Falta conectar el administrador</h1>
          <p className="mt-3 text-sm leading-6 text-stone-300">El panel ya está preparado para editar, publicar y subir logos online. Falta definir las variables de Supabase en el entorno y aplicar la migración incluida en el proyecto.</p>
          <Link href="/" className="mt-6 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200">Volver a la landing</Link>
        </section>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10 text-stone-100">
        <form onSubmit={handleLogin} className="w-full rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.4)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-amber-200/70">Admin Techs Uruguay</p>
          <h1 className="mt-4 text-3xl font-semibold text-stone-50">Acceso para editar la base</h1>
          <p className="mt-3 text-sm leading-6 text-stone-300">Ingresá con el correo y contraseña de tu cuenta autorizada.</p>
          <label className="mt-6 block"><span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">Correo</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-stone-100 outline-none focus:border-amber-200/50" /></label>
          <label className="mt-4 block"><span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">Contraseña</span><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-stone-100 outline-none focus:border-amber-200/50" /></label>
          {error ? <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}
          <button type="submit" className="mt-6 w-full rounded-full bg-amber-200 px-5 py-3 font-semibold text-stone-950">Entrar al admin</button>
          <Link href="/" className="mt-4 block text-center text-sm text-stone-400">Volver a la landing</Link>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen text-stone-100">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"><div><p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-amber-200/70">Panel privado</p><h1 className="mt-1 text-xl font-semibold text-stone-50">Techs Uruguay Admin</h1></div><div className="flex gap-2"><Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200">Ver landing</Link><button type="button" onClick={() => { void createSupabaseBrowserClient().auth.signOut(); setAuthenticated(false); }} className="rounded-full bg-amber-200 px-4 py-2 text-sm font-semibold text-stone-950">Salir</button></div></div></header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 text-sm text-stone-300">{notice}</div>
        {error ? <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}
        <div className="mt-6 grid gap-8 xl:grid-cols-[0.42fr_0.58fr]">
          <aside className="rounded-[32px] border border-white/10 bg-white/5 p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.34em] text-stone-500">Empresas</p><h2 className="mt-2 text-2xl font-semibold text-stone-50">{companies.length}</h2></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar empresa..." aria-label="Buscar empresa" className="w-full max-w-[220px] rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-sm text-stone-100 outline-none focus:border-amber-200/50" /></div>
            <div className="mt-5 max-h-[65vh] space-y-2 overflow-y-auto pr-1">{filtered.map((company) => <button key={company.name} type="button" onClick={() => setSelectedName(company.name)} className={["flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left", company.name === selectedName ? "border-amber-200/40 bg-amber-200/10" : "border-white/10 bg-white/5 hover:bg-white/10"].join(" ")}><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-stone-950/55 text-sm font-semibold text-amber-100">{company.logoUrl ? <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" /> : formatInitials(company.name)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-stone-50">{company.name}</p><p className="truncate text-xs text-stone-400">{company.sector || "Sin sector"} · {formatBucketLabel(company.valuation)}</p></div></button>)}</div>
          </aside>
          <section>{selected ? <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 lg:flex-row"><div><p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-stone-500">Editor principal</p><h2 className="mt-2 text-2xl font-semibold text-stone-50">{selected.name}</h2></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { const company = createBlankCompany({ name: uniqueName(companies) }); setCompanies([...companies, company]); setSelectedName(company.name); setHasChanges(true); }} className="rounded-full bg-emerald-200 px-4 py-2 text-sm font-semibold text-stone-950">Agregar empresa</button><button type="button" onClick={() => downloadJson(companies)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200">Exportar JSON</button><label className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200">Importar JSON<input type="file" accept="application/json" onChange={importJson} className="hidden" /></label><button type="button" onClick={() => { if (window.confirm(`¿Eliminar “${selected.name}”? Podés salir sin guardar para cancelar.`)) { const next = companies.filter((company) => company.name !== selected.name); setCompanies(next); setSelectedName(next[0]?.name ?? ""); setHasChanges(true); } }} className="rounded-full bg-rose-300 px-4 py-2 text-sm font-semibold text-stone-950">Eliminar</button></div></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Nombre"><input value={selected.name} onChange={textField("name")} className="input" /></Field><Field label="Rubro"><input value={selected.sector} onChange={textField("sector")} className="input" /></Field>
              <Field label="Fundación"><input type="number" value={selected.founded ?? ""} onChange={(event) => updateSelected({ founded: event.target.value ? Number(event.target.value) : null })} className="input" /></Field><Field label="Valoración"><input type="number" value={selected.valuation ?? ""} onChange={(event) => updateSelected({ valuation: event.target.value ? Number(event.target.value) : null })} className="input" /></Field>
              <Field label="Web" full><input value={selected.website} onChange={textField("website")} className="input" /></Field><Field label="URL del logo" full><input value={selected.logoUrl ?? ""} onChange={textField("logoUrl")} placeholder="https://..." className="input" /></Field>
              <div className="rounded-2xl border border-dashed border-white/15 bg-stone-950/35 p-4 md:col-span-2"><p className="text-xs uppercase tracking-[0.28em] text-stone-500">Subir logo</p><div className="mt-3 flex flex-wrap items-center gap-3"><label className="cursor-pointer rounded-full bg-sky-200 px-4 py-2 text-sm font-semibold text-stone-950">{uploading ? "Subiendo…" : "Elegir imagen"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => void uploadLogo(event)} className="hidden" /></label><p className="text-sm text-stone-400">JPG, PNG o WebP · máximo 5 MB</p></div></div>
              <Field label="Descripción" full><textarea value={selected.description} onChange={textField("description")} rows={5} className="input rounded-3xl" /></Field><Field label="Servicios" full><textarea value={selected.services.join("\n")} onChange={(event) => updateSelected({ services: parseLineList(event.target.value) })} rows={7} placeholder="Una línea por servicio" className="input rounded-3xl" /></Field><Field label="Miembros" full><textarea value={serializeFounderList(selected.founders)} onChange={(event) => updateSelected({ founders: parseFounderList(event.target.value) })} rows={7} placeholder="Nombre | Cargo" className="input rounded-3xl" /></Field>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-stone-950/45 p-5"><p className="text-sm text-stone-300">{hasChanges ? "Tenés cambios sin publicar." : "Todos los cambios están publicados."}</p><button type="button" disabled={!hasChanges || saving} onClick={() => void save()} className="rounded-full bg-amber-200 px-5 py-3 text-sm font-semibold text-stone-950 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Publicando…" : "Guardar cambios"}</button></div>
            <div className="mt-6 rounded-[28px] border border-white/10 bg-stone-950/45 p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-stone-500">Vista previa</p><div className="mt-4 flex gap-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-amber-200 text-2xl font-semibold text-stone-950">{selected.logoUrl ? <img src={selected.logoUrl} alt={selected.name} className="h-full w-full object-cover" /> : formatInitials(selected.name)}</div><div><h3 className="text-xl font-semibold text-stone-50">{selected.name}</h3><p className="mt-1 text-sm text-stone-400">{selected.sector || "Sin sector"} · {formatFounded(selected.founded)}</p><p className="mt-3 text-sm leading-6 text-stone-300">{selected.description || "Descripción pendiente."}</p><p className="mt-3 text-xs uppercase tracking-[0.28em] text-stone-500">{formatMoney(selected.valuation)} · {formatBucketLabel(selected.valuation)}</p></div></div></div>
          </div> : <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-stone-300">No hay empresa seleccionada.</div>}</section>
        </div>
      </main>
    </div>
  );
}

function Field({ label, full = false, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return <label className={full ? "block md:col-span-2" : "block"}><span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">{label}</span>{children}</label>;
}
