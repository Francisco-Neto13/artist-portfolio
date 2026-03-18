revoke all on table "public"."profiles" from "anon", "authenticated";

drop policy if exists "public_read_profiles" on "public"."profiles";
drop policy if exists "admin_all_profiles" on "public"."profiles";

comment on table "public"."profiles" is 'Deprecated: replaced by public.site_profile for public portfolio content.';
