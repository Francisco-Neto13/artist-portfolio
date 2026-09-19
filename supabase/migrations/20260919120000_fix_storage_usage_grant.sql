-- Conserta o medidor de armazenamento do dashboard.
--
-- As migracoes 20260315162548 e 20260315170000 revogaram o execute de
-- `get_storage_usage()` de public, anon E authenticated, e nunca devolveram
-- para ninguem. O StorageMeter chama essa funcao pelo client autenticado do
-- admin, entao ela sempre respondia "permission denied" — e o componente
-- engolia o erro e mostrava 0%, que parece um bucket vazio.
--
-- A revogacao estava certa no espirito (uso de storage nao e informacao
-- publica), errada no alcance. A correcao nao e reabrir para `authenticated`:
-- e a propria funcao conferir quem chamou.

-- `security definer` le storage.objects, que o usuario comum nao alcanca — por
-- isso a checagem de admin tem de estar DENTRO da funcao. Sem ela, devolver o
-- execute para `authenticated` entregaria o tamanho do bucket a qualquer conta
-- logada, admin ou nao.
create or replace function "public"."get_storage_usage"()
returns bigint
language sql
stable
security definer
set search_path = 'public', 'storage'
as $function$
  select case
    when public.is_admin() then (
      select coalesce(sum((metadata->>'size')::bigint), 0)
      from storage.objects
      where bucket_id = 'gallery'
    )
    else null
  end;
$function$;

-- `null` e nao `0`: quem nao e admin recebe "nao sei", nao "esta vazio". Zero
-- seria um dado falso, e foi exatamente esse zero que escondeu o bug por meses.

revoke all on function "public"."get_storage_usage"() from public;
revoke execute on function "public"."get_storage_usage"() from anon;
grant execute on function "public"."get_storage_usage"() to authenticated;

comment on function "public"."get_storage_usage"() is
  'Bytes usados no bucket gallery. Devolve null para quem nao e admin.';
