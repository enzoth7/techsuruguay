# Activar el editor online

El sitio usa Supabase para dos cosas: una base compartida de empresas y un espacio para los logos. Las reglas de acceso dejan la lectura pública, pero sólo una cuenta autorizada puede modificar el contenido.

1. Creá o elegí un proyecto de Supabase y ejecutá la migración de `supabase/migrations/20260829215045_techsuruguay_online_content.sql` desde el SQL Editor o con la CLI vinculada al proyecto.
2. En **Authentication → Users**, creá el usuario con el correo y contraseña que vas a usar en `/admin`.
3. En el SQL Editor, autorizá esa cuenta (reemplazá el correo):

```sql
insert into public.admin_users (user_id)
select id from auth.users
where email = 'tu-correo@ejemplo.com';
```

4. En la configuración de la Data API, exponé las tablas `public.site_content` y `public.admin_users`. La migración ya contiene los permisos y las reglas de seguridad necesarias.
5. En Vercel (o en `.env.local` para desarrollo) cargá las variables de `.env.example`:

```text
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

6. Volvé a desplegar. Ingresá a `/admin`, subí o editá las empresas y presioná **Guardar cambios** para publicarlas.

La primera vez, la pantalla de administración carga automáticamente la base incluida en el proyecto. Para convertirla en la base online, simplemente presioná **Guardar cambios**.
