create table if not exists "public"."site_profile" (
  "slug" text primary key default 'main',
  "full_name" text default 'Atmisuki'::text,
  "bio" text,
  "location" text default 'USA'::text,
  "avatar_url" text,
  "social_links" jsonb default '{"mail": "#", "twitter": "#", "instagram": "#"}'::jsonb,
  "languages" jsonb default '[]'::jsonb,
  "hobbies" jsonb default '[]'::jsonb,
  "commission_status" text default 'open'::text,
  "updated_at" timestamp with time zone default now(),
  constraint "site_profile_singleton_slug" check ("slug" = 'main')
);

alter table "public"."site_profile" enable row level security;

insert into "public"."site_profile" (
  "slug",
  "full_name",
  "bio",
  "location",
  "avatar_url",
  "social_links",
  "languages",
  "hobbies",
  "commission_status",
  "updated_at"
)
select
  'main',
  coalesce("full_name", 'Atmisuki'),
  "bio",
  coalesce("location", 'USA'),
  "avatar_url",
  coalesce("social_links", '{"mail": "#", "twitter": "#", "instagram": "#"}'::jsonb),
  coalesce("languages", '[]'::jsonb),
  coalesce("hobbies", '[]'::jsonb),
  coalesce("commission_status", 'open'),
  coalesce("updated_at", now())
from "public"."profiles"
order by "updated_at" desc nulls last
limit 1
on conflict ("slug") do nothing;

grant delete, insert, references, select, trigger, truncate, update
on table "public"."site_profile"
to "anon", "authenticated", "service_role";

drop policy if exists "admin_all_site_profile" on "public"."site_profile";
create policy "admin_all_site_profile"
on "public"."site_profile"
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_site_profile" on "public"."site_profile";
create policy "public_read_site_profile"
on "public"."site_profile"
as permissive
for select
to public
using (true);
