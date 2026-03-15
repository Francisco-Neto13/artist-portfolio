create table if not exists "public"."admin_users" (
  "user_id" uuid primary key references auth.users(id) on delete cascade,
  "created_at" timestamp with time zone not null default timezone('utc'::text, now())
);

alter table "public"."admin_users" enable row level security;

insert into "public"."admin_users" ("user_id")
select distinct match[1]::uuid
from pg_policies policy
cross join lateral regexp_matches(
  coalesce(policy.qual, '') || ' ' || coalesce(policy.with_check, ''),
  '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})',
  'g'
) as match
where policy.schemaname in ('public', 'storage')
  and policy.policyname in (
    'admin_all_categories',
    'admin_all_types',
    'admin_all_artworks',
    'admin_all_tiers',
    'admin_all_profiles',
    'admin_all_gallery_perfil'
  )
on conflict ("user_id") do nothing;

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

revoke all on table "public"."admin_users" from public;
revoke all on function "public"."is_admin"() from public;
grant execute on function "public"."is_admin"() to authenticated;

create or replace function "public"."get_storage_usage"()
returns bigint
language sql
security definer
as $function$
  select coalesce(sum((metadata->>'size')::bigint), 0)
  from storage.objects
  where bucket_id = 'gallery';
$function$;

revoke execute on function "public"."get_storage_usage"() from public;
revoke execute on function "public"."get_storage_usage"() from anon;
revoke execute on function "public"."get_storage_usage"() from authenticated;

drop policy if exists "admin_all_categories" on "public"."artwork_categories";
create policy "admin_all_categories"
on "public"."artwork_categories"
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_categories" on "public"."artwork_categories";
create policy "public_read_categories"
on "public"."artwork_categories"
as permissive
for select
to public
using (true);

drop policy if exists "admin_all_types" on "public"."artwork_types";
create policy "admin_all_types"
on "public"."artwork_types"
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_types" on "public"."artwork_types";
create policy "public_read_types"
on "public"."artwork_types"
as permissive
for select
to public
using (true);

drop policy if exists "admin_all_artworks" on "public"."artworks";
create policy "admin_all_artworks"
on "public"."artworks"
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_artworks" on "public"."artworks";
create policy "public_read_artworks"
on "public"."artworks"
as permissive
for select
to public
using (true);

drop policy if exists "admin_all_tiers" on "public"."commission_tiers";
create policy "admin_all_tiers"
on "public"."commission_tiers"
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_tiers" on "public"."commission_tiers";
create policy "public_read_tiers"
on "public"."commission_tiers"
as permissive
for select
to public
using (true);

drop policy if exists "admin_all_profiles" on "public"."profiles";
create policy "admin_all_profiles"
on "public"."profiles"
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_profiles" on "public"."profiles";
create policy "public_read_profiles"
on "public"."profiles"
as permissive
for select
to public
using (true);

drop policy if exists "admin_all_gallery_perfil" on "storage"."objects";
create policy "admin_all_gallery_perfil"
on "storage"."objects"
as permissive
for all
to authenticated
using (((bucket_id = any (array['gallery'::text, 'perfil'::text])) and public.is_admin()))
with check (((bucket_id = any (array['gallery'::text, 'perfil'::text])) and public.is_admin()));

drop policy if exists "public_read_gallery_perfil" on "storage"."objects";
create policy "public_read_gallery_perfil"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = any (array['gallery'::text, 'perfil'::text])));
