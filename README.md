# Techs Uruguay

Landing editorial y panel privado para empresas tech uruguayas.

## Rutas

- `/` landing pública
- `/admin` panel privado de edición

## Admin

- Autenticación por correo y contraseña de Supabase.
- Los cambios se publican online para todos los visitantes.
- Permite agregar, editar, eliminar, importar/exportar empresas y subir logos JPG, PNG o WebP de hasta 5 MB.
- Seguí [la guía de activación](docs/ONLINE_ADMIN_SETUP.md) antes del primer deploy.

## Datos

- Fuente original: `Techs Uruguay.xlsx`
- Documento de referencia: `Techs Uruguay.md`
- Datos normalizados: `src/data/techsuruguay.json`

## Producción y métricas

- Definí **NEXT_PUBLIC_SITE_URL** con el dominio público para generar canonical, robots y sitemap.
- El favicon, Apple icon y vista previa social usan **public/LogoTransp.png**.
- Vercel Web Analytics está integrado con **@vercel/analytics**.
- Después del primer deploy, activá **Web Analytics** desde el dashboard del proyecto en Vercel y volvé a desplegar.

## Logos

Cuando tengas los logos, podés:

- subirlos a `public/logos/`
- o pegar una `logoUrl` por empresa desde el admin
