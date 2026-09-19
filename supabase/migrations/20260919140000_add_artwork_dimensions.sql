-- Dimensoes das obras, para a galeria parar de embaralhar.
--
-- A grade e um masonry de colunas CSS (`columns-2 lg:columns-4`). Sem saber a
-- altura de cada card antes da imagem chegar, o navegador monta tudo com altura
-- zero, e a cada imagem que termina ele REBALANCEIA as colunas inteiras — itens
-- pulam de coluna, o titulo aparece antes da arte, e a pagina se reorganiza na
-- frente de quem esta olhando. Sao 24 obras com 14 proporcoes diferentes (de
-- 0.45 a 2.57), entao nao existe um valor unico que sirva.
--
-- Guardar largura e altura e o que Pinterest, Unsplash e Flickr fazem, e e o
-- que permite reservar o espaco via `aspect-ratio` antes do primeiro byte.
--
-- As colunas sao anulaveis de proposito: obra antiga sem medida continua
-- funcionando, so volta a se comportar como antes ate alguem reenviar.

alter table "public"."artworks"
  add column if not exists "width" integer,
  add column if not exists "height" integer;

comment on column "public"."artworks"."width" is 'Largura em pixels do arquivo enviado; alimenta o aspect-ratio do card.';
comment on column "public"."artworks"."height" is 'Altura em pixels do arquivo enviado; alimenta o aspect-ratio do card.';

-- Medida negativa ou zero quebraria o aspect-ratio no CSS.
alter table "public"."artworks"
  drop constraint if exists "artworks_dimensoes_positivas";
alter table "public"."artworks"
  add constraint "artworks_dimensoes_positivas"
  check (
    ("width" is null or "width" > 0) and
    ("height" is null or "height" > 0)
  );

-- Backfill das obras que ja estavam no ar. As medidas foram lidas dos proprios
-- arquivos no Storage. Novos envios preenchem sozinhos (ver useUploadLogic).
--  deixa a migracao idempotente e impede que ela
-- sobrescreva o que um reenvio posterior tenha corrigido.
update "public"."artworks" as a
set "width" = v.w, "height" = v.h
from (values
  (48, 2048, 1157),
  (49, 2048, 1185),
  (50, 1536, 2048),
  (69, 1823, 1823),
  (70, 1536, 2048),
  (71, 2048, 1174),
  (76, 1346, 2048),
  (77, 922, 2048),
  (78, 2048, 798),
  (79, 2048, 1132),
  (80, 1346, 2048),
  (81, 1346, 2048),
  (82, 2048, 1080),
  (83, 2048, 1536),
  (84, 2048, 1152),
  (85, 2048, 1448),
  (86, 2048, 1010),
  (87, 1823, 1823),
  (88, 1346, 2048),
  (89, 1346, 2048),
  (90, 1346, 2048),
  (91, 1346, 2048),
  (92, 1346, 2048),
  (93, 1346, 2048)
) as v(id, w, h)
where a."id" = v.id
  and (a."width" is null or a."height" is null);
