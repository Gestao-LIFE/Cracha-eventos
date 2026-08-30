/* ============================================================
   Conexão com o Supabase (banco dos cadastros do evento)

   A "anon key" abaixo é PÚBLICA por natureza — ela só permite o
   que as políticas de RLS liberam:
     • qualquer visitante pode CADASTRAR-SE (insert em cracha_participantes)
     • ler os cadastros exige login de um e-mail listado em cracha_admins
   Trocar de projeto Supabase = trocar as duas linhas de SUPABASE.
   ============================================================ */
window.CRACHA_SUPABASE = {
  url: 'https://chtjuiyphotyyjehwnkg.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodGp1aXlwaG90eXlqZWh3bmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwOTAwNDEsImV4cCI6MjEwMjY2NjA0MX0.wXM35imWyeFPzqEP8vaeCtaTXULOGVOe06qvGh3Z9zE',

  TABELA_PARTICIPANTES: 'cracha_participantes',
  TABELA_CONFIG: 'cracha_config',

  /* Cria o cliente. Requer o script @supabase/supabase-js carregado antes. */
  client(options){
    if(typeof supabase === 'undefined' || !supabase.createClient){
      throw new Error('Biblioteca do Supabase não carregou. Verifique a conexão com a internet.');
    }
    return supabase.createClient(this.url, this.anonKey, options);
  }
};

/* ============================================================
   Opções dos campos do formulário (usadas na inscrição e no painel).
   Para mudar as alternativas, edite apenas estas listas.
   ============================================================ */
window.CRACHA_OPCOES = {
  faturamento: [
    'Até R$ 50 mil',
    'R$ 50 a 100 mil',
    'R$ 100 a 300 mil',
    'R$ 300 a 500 mil',
    'Acima de R$ 500 mil'
  ],
  segmento: [
    'Restaurante',
    'Bar',
    'Lanchonete / Hamburgueria',
    'Pizzaria',
    'Padaria / Confeitaria',
    'Cafeteria',
    'Churrascaria',
    'Delivery',
    'Outro'
  ],
  funcao: [
    'Dono',
    'Gerente',
    'Garçom',
    'Outro'
  ]
};
