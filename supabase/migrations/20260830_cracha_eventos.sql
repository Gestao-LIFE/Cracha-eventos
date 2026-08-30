-- =====================================================================
-- Crachás de Evento — inscrição por QR Code, painel e impressão automática
--
-- Como usar num projeto Supabase novo:
--   Dashboard → SQL Editor → cole este arquivo inteiro → Run.
-- Depois, cadastre o primeiro administrador (troque o e-mail):
--   insert into public.cracha_admins (email) values ('voce@exemplo.com');
-- e crie a conta pela tela de login do admin.html.
--
-- As tabelas usam o prefixo cracha_ para conviver com outros sistemas
-- no mesmo projeto Supabase.
-- =====================================================================

-- ---------- Administradores (quem pode ver/editar os cadastros) ----------
create table if not exists public.cracha_admins (
  email      text primary key,
  criado_em  timestamptz not null default now()
);

comment on table public.cracha_admins is
  'E-mails autorizados a acessar o painel de crachás. Basta inserir a linha e criar o usuário em Authentication.';

-- ---------- Participantes ----------
create table if not exists public.cracha_participantes (
  id           uuid primary key default gen_random_uuid(),
  criado_em    timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  nome         text not null,
  empresa      text,
  faturamento  text,
  segmento     text,
  funcao       text,
  sistema      text,
  origem       text not null default 'qr',
  impresso_em  timestamptz,
  constraint cracha_nome_preenchido check (length(btrim(nome)) between 2 and 120),
  constraint cracha_empresa_tam     check (empresa is null or length(empresa) <= 120),
  constraint cracha_faturamento_tam check (faturamento is null or length(faturamento) <= 60),
  constraint cracha_segmento_tam    check (segmento is null or length(segmento) <= 60),
  constraint cracha_funcao_tam      check (funcao is null or length(funcao) <= 60),
  constraint cracha_sistema_tam     check (sistema is null or length(sistema) <= 80),
  constraint cracha_origem_valida   check (origem in ('qr','admin'))
);

comment on column public.cracha_participantes.origem is 'qr = veio do formulário no celular; admin = cadastrado na recepção.';
comment on column public.cracha_participantes.impresso_em is 'Preenchido quando o crachá é enviado à impressora. NULL = na fila.';

create index if not exists cracha_participantes_criado_em_idx
  on public.cracha_participantes (criado_em desc);

-- fila de impressão: só as linhas ainda não impressas
create index if not exists cracha_participantes_fila_idx
  on public.cracha_participantes (criado_em)
  where impresso_em is null;

-- ---------- Configurações do evento ----------
create table if not exists public.cracha_config (
  chave         text primary key,
  valor         text,
  publico       boolean not null default true,
  atualizado_em timestamptz not null default now()
);

comment on column public.cracha_config.publico is
  'true = pode ser lido sem login (usado pela página de inscrição).';

insert into public.cracha_config (chave, valor, publico) values
  ('evento_nome',           'Evento Gestão Life',                        true),
  ('whatsapp_link',         '',                                          true),
  ('mensagem_confirmacao',  'Cadastro concluído! Retire seu crachá na recepção.', true)
on conflict (chave) do nothing;

-- ---------- atualizado_em automático ----------
create or replace function public.cracha_touch_atualizado_em()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists cracha_participantes_touch on public.cracha_participantes;
create trigger cracha_participantes_touch
  before update on public.cracha_participantes
  for each row execute function public.cracha_touch_atualizado_em();

drop trigger if exists cracha_config_touch on public.cracha_config;
create trigger cracha_config_touch
  before update on public.cracha_config
  for each row execute function public.cracha_touch_atualizado_em();

-- ---------- Helper: o usuário logado é admin? ----------
create or replace function public.cracha_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.cracha_admins a
     where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.cracha_is_admin() from public;
grant execute on function public.cracha_is_admin() to authenticated;

-- =====================================================================
-- RLS — quem pode fazer o quê
-- =====================================================================
alter table public.cracha_admins        enable row level security;
alter table public.cracha_participantes enable row level security;
alter table public.cracha_config        enable row level security;

-- --- admins: só administradores enxergam e mexem na lista ---
drop policy if exists cracha_admins_select on public.cracha_admins;
create policy cracha_admins_select on public.cracha_admins
  for select to authenticated
  using (public.cracha_is_admin());

drop policy if exists cracha_admins_insert on public.cracha_admins;
create policy cracha_admins_insert on public.cracha_admins
  for insert to authenticated
  with check (public.cracha_is_admin());

drop policy if exists cracha_admins_delete on public.cracha_admins;
create policy cracha_admins_delete on public.cracha_admins
  for delete to authenticated
  using (
    public.cracha_is_admin()
    and lower(email) <> lower(coalesce(auth.jwt() ->> 'email', ''))  -- não se remove
  );

-- --- participantes ---
-- Qualquer visitante pode se cadastrar pelo QR, mas não pode marcar como impresso.
drop policy if exists cracha_participantes_insert_publico on public.cracha_participantes;
create policy cracha_participantes_insert_publico on public.cracha_participantes
  for insert to anon, authenticated
  with check (impresso_em is null and origem = 'qr');

-- Admin logado: leitura, cadastro manual, edição e exclusão.
drop policy if exists cracha_participantes_select_admin on public.cracha_participantes;
create policy cracha_participantes_select_admin on public.cracha_participantes
  for select to authenticated
  using (public.cracha_is_admin());

drop policy if exists cracha_participantes_insert_admin on public.cracha_participantes;
create policy cracha_participantes_insert_admin on public.cracha_participantes
  for insert to authenticated
  with check (public.cracha_is_admin());

drop policy if exists cracha_participantes_update_admin on public.cracha_participantes;
create policy cracha_participantes_update_admin on public.cracha_participantes
  for update to authenticated
  using (public.cracha_is_admin())
  with check (public.cracha_is_admin());

drop policy if exists cracha_participantes_delete_admin on public.cracha_participantes;
create policy cracha_participantes_delete_admin on public.cracha_participantes
  for delete to authenticated
  using (public.cracha_is_admin());

-- --- config ---
drop policy if exists cracha_config_select_publico on public.cracha_config;
create policy cracha_config_select_publico on public.cracha_config
  for select to anon, authenticated
  using (publico);

drop policy if exists cracha_config_select_admin on public.cracha_config;
create policy cracha_config_select_admin on public.cracha_config
  for select to authenticated
  using (public.cracha_is_admin());

drop policy if exists cracha_config_update_admin on public.cracha_config;
create policy cracha_config_update_admin on public.cracha_config
  for update to authenticated
  using (public.cracha_is_admin())
  with check (public.cracha_is_admin());

drop policy if exists cracha_config_insert_admin on public.cracha_config;
create policy cracha_config_insert_admin on public.cracha_config
  for insert to authenticated
  with check (public.cracha_is_admin());

-- =====================================================================
-- Tempo real: o painel recebe cada novo cadastro na hora
-- =====================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'cracha_participantes'
  ) then
    alter publication supabase_realtime add table public.cracha_participantes;
  end if;
end
$$;
