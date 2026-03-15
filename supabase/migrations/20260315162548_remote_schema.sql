create table "public"."artwork_categories" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null unique,
  "created_at" timestamp with time zone default now()
);

alter table "public"."artwork_categories" enable row level security;

create table "public"."artwork_types" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null unique
);

alter table "public"."artwork_types" enable row level security;

create table "public"."artworks" (
  "id" bigint generated always as identity primary key,
  "created_at" timestamp with time zone default now(),
  "title" text not null,
  "category" text,
  "type" text,
  "image_url" text not null
);

alter table "public"."artworks" enable row level security;

create table "public"."commission_tiers" (
  "id" uuid primary key default gen_random_uuid(),
  "title" text not null,
  "price" text not null,
  "description" text,
  "image_url" text,
  "is_active" boolean default true,
  "order_index" integer default 0,
  "created_at" timestamp with time zone not null default timezone('utc'::text, now())
);

alter table "public"."commission_tiers" enable row level security;

create table "public"."profiles" (
  "id" uuid primary key references auth.users(id),
  "full_name" text default 'Atmisuki'::text,
  "bio" text,
  "location" text default 'USA'::text,
  "avatar_url" text,
  "social_links" jsonb default '{"mail": "#", "twitter": "#", "instagram": "#"}'::jsonb,
  "languages" jsonb default '[]'::jsonb,
  "hobbies" jsonb default '[]'::jsonb,
  "updated_at" timestamp with time zone default now(),
  "commission_status" text default 'open'::text
);

alter table "public"."profiles" enable row level security;

create table "public"."admin_users" (
  "user_id" uuid primary key references auth.users(id) on delete cascade,
  "created_at" timestamp with time zone not null default timezone('utc'::text, now())
);

alter table "public"."admin_users" enable row level security;

set check_function_bodies = off;

create or replace function "public"."is_admin"()
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $function$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$function$;

create or replace function "public"."get_storage_usage"()
returns bigint
language sql
security definer
as $function$
  select coalesce(sum((metadata->>'size')::bigint), 0)
  from storage.objects
  where bucket_id = 'gallery';
$function$;

grant delete, insert, references, select, trigger, truncate, update
on table "public"."artwork_categories"
to "anon", "authenticated", "service_role";

grant delete, insert, references, select, trigger, truncate, update
on table "public"."artwork_types"
to "anon", "authenticated", "service_role";

grant delete, insert, references, select, trigger, truncate, update
on table "public"."artworks"
to "anon", "authenticated", "service_role";

grant delete, insert, references, select, trigger, truncate, update
on table "public"."commission_tiers"
to "anon", "authenticated", "service_role";

grant delete, insert, references, select, trigger, truncate, update
on table "public"."profiles"
to "anon", "authenticated", "service_role";

grant all
on table "public"."admin_users"
to "service_role";

revoke all on table "public"."admin_users" from public;
revoke all on function "public"."is_admin"() from public;
grant execute on function "public"."is_admin"() to authenticated;
revoke execute on function "public"."get_storage_usage"() from public;
revoke execute on function "public"."get_storage_usage"() from anon;
revoke execute on function "public"."get_storage_usage"() from authenticated;

create policy "admin_all_categories"
on "public"."artwork_categories"
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public_read_categories"
on "public"."artwork_categories"
as permissive
for select
to public
using (true);

create policy "admin_all_types"
on "public"."artwork_types"
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public_read_types"
on "public"."artwork_types"
as permissive
for select
to public
using (true);

create policy "admin_all_artworks"
on "public"."artworks"
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public_read_artworks"
on "public"."artworks"
as permissive
for select
to public
using (true);

create policy "admin_all_tiers"
on "public"."commission_tiers"
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public_read_tiers"
on "public"."commission_tiers"
as permissive
for select
to public
using (true);

create policy "admin_all_profiles"
on "public"."profiles"
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public_read_profiles"
on "public"."profiles"
as permissive
for select
to public
using (true);

create policy "admin_all_gallery_perfil"
on "storage"."objects"
as permissive
for all
to authenticated
using (((bucket_id = any (array['gallery'::text, 'perfil'::text])) and public.is_admin()))
with check (((bucket_id = any (array['gallery'::text, 'perfil'::text])) and public.is_admin()));

create policy "public_read_gallery_perfil"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = any (array['gallery'::text, 'perfil'::text])));
