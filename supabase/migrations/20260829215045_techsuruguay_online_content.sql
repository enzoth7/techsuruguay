create table public.site_content (
  key text primary key check (key = 'companies'),
  content jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

insert into public.site_content (key) values ('companies');

grant select on public.site_content to anon, authenticated;
grant update on public.site_content to authenticated;
grant select on public.admin_users to authenticated;

alter table public.site_content enable row level security;
alter table public.admin_users enable row level security;

create policy "Anyone can read published companies"
on public.site_content for select
to anon, authenticated
using (true);

create policy "Admins can update published companies"
on public.site_content for update
to authenticated
using (
  key = 'companies'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
)
with check (
  key = 'companies'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

create policy "Users can verify their own admin access"
on public.admin_users for select
to authenticated
using (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-logos',
  'company-logos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Anyone can view company logos"
on storage.objects for select
to public
using (bucket_id = 'company-logos');

create policy "Admins can upload company logos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'company-logos'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

create policy "Admins can replace company logos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'company-logos'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
)
with check (
  bucket_id = 'company-logos'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

create policy "Admins can delete company logos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'company-logos'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);
