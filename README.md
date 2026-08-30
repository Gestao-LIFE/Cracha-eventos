# Crachás de Evento — Inscrição por QR Code + Impressão na Zebra ZD220

Sistema web (páginas estáticas, **sem servidor próprio e sem build**) para
credenciar participantes e imprimir **crachás** numa **Zebra ZD220**
(203 dpi, ZPL II, USB).

**O fluxo do evento, em 4 passos:**

1. O participante aponta a câmera para o **cartaz com QR Code** na recepção.
2. Abre o **formulário no celular** (`inscricao.html`): nome, empresa,
   faturamento, segmento, função e sistema que utiliza.
3. Ao enviar, o **crachá é impresso sozinho** na recepção (Nome, Empresa e Função)
   e o celular mostra o botão **Entrar no grupo do WhatsApp**.
4. Toda a equipe acompanha os cadastros no **painel** (`admin.html`), com
   cadastro/edição/exclusão e **exportação para planilha**.

> As três páginas convivem: o `index.html` continua sendo o console de impressão
> manual e em lote (e é o plano B caso a internet caia).

### O que o console `index.html` faz
- Detecta a impressora automaticamente via **Zebra Browser Print**.
- 3 modelos de crachá: **texto** (Nome / Empresa / Cargo, em 3 linhas), **com QR
  Code** e **com código de barras** (matrícula).
- Tamanho padrão **80 × 30 mm** (8 × 3 cm, retângulo) — ajustável.
- Fundo branco com letras pretas (padrão) ou **fundo preto com letras brancas**
  (opção no modelo de texto).
- Entrada **manual** (1 pessoa), **planilha do Google Sheets (link)** ou
  **arquivo `.xlsx`/`.csv`** (1 linha = 1 crachá), com mapeamento de colunas e
  impressão em lote.
- **Pré-visualização** na tela + o **ZPL gerado** visível para conferência.
- **Modo simulação** para testar tudo sem a impressora.

Tudo em português, interface limpa, roda em PC. Funciona aberto localmente
(2 cliques) ou hospedado no **GitHub Pages**.

---

## 1. Instalar o Zebra Browser Print e adicionar a ZD220

A página **não** fala direto com o USB — ela usa o programa **Zebra Browser Print**
como ponte. Faça uma vez:

1. Baixe e instale o **Zebra Browser Print**:
   https://www.zebra.com/us/en/support-downloads/printer-software/browser-print.html
2. Conecte a **ZD220** no USB e ligue. Instale o driver da ZD220 se o Windows pedir.
3. Abra o **Zebra Browser Print** (fica rodando na bandeja do sistema).
4. Copie os arquivos do SDK para a pasta `libs/` — veja [`libs/README.md`](libs/README.md).

> Sem o Browser Print/SDK o app ainda abre, mas só no **Modo simulação**
> (mostra o ZPL em vez de imprimir).

---

## 2. Abrir a aplicação

**Local (mais simples):** dê dois cliques no `index.html`. Ele abre no navegador.

**GitHub Pages:**
1. Suba esta pasta para um repositório no GitHub.
2. *Settings → Pages → Branch: main / root → Save*.
3. Acesse a URL gerada (ex.: `https://seu-usuario.github.io/cracha/`).

> O Browser Print funciona em `http://localhost`, em `file://` e em sites `https://`
> (como o GitHub Pages).

---

## 3. Como usar

1. **Impressora** — ao abrir, o status no topo mostra a impressora conectada
   (verde). Use o seletor se houver mais de uma. **Testar impressora** imprime
   uma etiqueta de teste.
2. **Tamanho do crachá** — vem **80 × 30 mm** (8 × 3 cm). Mude largura/altura em
   **mm** se precisar, e o número de cópias. Há o opcional **Fundo preto**.
   As medidas ficam salvas (localStorage) para a próxima vez.
3. **Modelo** — escolha texto / QR / código de barras.
4. **Entrada de dados:**
   - **Manual:** preencha os campos e clique em **Imprimir crachá**.
   - **Importar planilha:** cole o **link do Google Sheets** (ou carregue um
     arquivo `.xlsx`/`.csv`), confira o **mapeamento de colunas**, marque as
     linhas e clique em **Imprimir selecionadas**.
5. Confira a **pré-visualização** e o **ZPL** à direita antes de imprimir.

Há um arquivo [`exemplo-participantes.csv`](exemplo-participantes.csv) com 5 linhas
para testar a importação (colunas: Nome, Cargo, Empresa, Codigo, QR).

### Conectar a uma planilha do Google Sheets

1. Monte a planilha com uma coluna por campo. Para o crachá de texto, use os
   cabeçalhos **`Nome`**, **`Empresa`** e **`Cargo`** (o app reconhece e mapeia
   sozinho; outros nomes você ajusta no mapeamento).
2. No Google Sheets: **Compartilhar → Acesso geral → "Qualquer pessoa com o link"
   → Leitor**.
3. Copie o link da barra de endereços e cole no campo **"Link do Google Sheets"**,
   depois clique em **Carregar do Google Sheets**.
4. Se o navegador bloquear (ou a planilha não abrir os dados), use a via mais
   garantida: **Arquivo → Compartilhar → Publicar na web → (a aba) → CSV**,
   copie esse link e cole no mesmo campo.

> Tudo roda no seu navegador — nada é enviado para outro servidor. A planilha
> precisa estar acessível por link justamente para o navegador conseguir lê-la.

### Nome no crachá (encurtado e sem repetir)
O nome é reduzido para **primeiro nome + primeiro sobrenome** e impresso **grande
e em negrito**. Se dois ficariam iguais, o segundo troca de sobrenome
automaticamente:

| Planilha                 | Sai no crachá |
|--------------------------|---------------|
| Maria Alves da Silva     | Maria Alves   |
| Maria Alves da Cunha     | Maria Cunha   |

A coluna **"Nome (no crachá)"** na tabela mostra exatamente o que será impresso.

### Impressão em lote / grande escala
- Pode importar **centenas de linhas** (ex.: 200) sem problema.
- A confirmação aparece **uma vez para o lote inteiro** — não é a cada etiqueta.
  Para imprimir direto, **desmarque "Confirmar antes de lotes grandes"** (seção 1).
- Durante a impressão aparece o botão **⛔ Cancelar impressão** e o progresso
  (`Imprimindo… 37/200`).
- O envio é **pausado em ~0,2s entre etiquetas** para não estourar a memória da
  ZD220 em lotes grandes.

### Modo simulação
Marque **"Modo simulação"** para validar a lógica sem imprimir: em vez de enviar,
o ZPL aparece no painel da direita e no **Console** do navegador (F12). Ideal para
testar antes de ter o Browser Print instalado.

---

## 4. Inscrição por QR Code (fluxo do evento)

Esta parte usa um banco **Supabase** (plano gratuito) para ligar o celular do
participante ao computador da recepção. Só isso: nada é instalado em servidor.

### 4.1 Antes do evento (uma vez)

1. **Entrar no painel** — abra `admin.html` e faça login. O e-mail precisa estar
   na lista de administradores (veja 4.4).
2. **Configurações** — preencha o **nome do evento**, a **cidade**, o **link do
   grupo do WhatsApp** (`https://chat.whatsapp.com/…`) e a mensagem de
   confirmação. O formulário do celular e o cartaz passam a usar esses textos na
   hora — dá para mudar a cidade a cada edição do evento sem tocar em código.
3. **Cartaz QR** — aba **Cartaz QR** → **Imprimir cartaz A4**. O cartaz sai na
   identidade da marca (fundo Ash com a luz de brasa, nome e cidade do evento e a
   logo Gestão Life), e o QR fica sempre num cartão claro para a câmera ler sem
   erro. Se a impressora for comum, marque **Fundo claro** antes de imprimir:
   mesma identidade, muito menos tinta.
4. **Teste de verdade** — com a impressora ligada, faça uma inscrição pelo seu
   celular e confira se o crachá sai sozinho.

### 4.2 No dia do evento (recepção)

1. No PC ligado à ZD220, abra o **Zebra Browser Print** e depois o `admin.html`.
2. Faça login e vá em **Estação de impressão**.
3. Confira a pilha verde **"Impressora: conectada"** no topo.
4. Marque **"Impressão automática ativada"**.
5. Pronto: cada inscrição imprime sozinha. Deixe a aba aberta e evite que o
   computador durma.

> **Use uma estação por evento.** Se duas telas ficarem com a impressão
> automática ligada, o sistema garante que o crachá **não sai duas vezes**
> (a primeira tela "reserva" o cadastro antes de imprimir), mas os crachás se
> dividiriam entre as duas impressoras.

**Se a impressora falhar** (papel acabou, cabo solto), a fila **pausa**, o
participante volta para "pendente" e aparece o botão **Retomar impressão**.
Resolva o problema e clique em Retomar — nada se perde.

### 4.3 O que sai no crachá

Só **Nome**, **Empresa** e **Função** — grande e legível de longe. O nome é
encurtado para primeiro nome + primeiro sobrenome (ver a tabela da seção 3).
Faturamento, segmento e sistema ficam apenas na planilha.

### 4.4 Banco de dados (Supabase)

O projeto usa três tabelas, criadas pelo SQL em
[`supabase/migrations/`](supabase/migrations/):

| Tabela | Para quê |
|---|---|
| `cracha_participantes` | um registro por inscrição, incluindo quando o crachá foi impresso |
| `cracha_config` | nome do evento, link do WhatsApp, mensagem de confirmação |
| `cracha_admins` | e-mails que podem abrir o painel |

**Permissões (RLS) já configuradas:**
- Qualquer visitante pode **se inscrever** — e só isso.
- **Ler, editar e exportar** exige login com e-mail cadastrado em `cracha_admins`.
- A chave `anonKey` em `js/supabase-config.js` é **pública por natureza**; quem
  protege os dados são as permissões acima.

**Dar acesso a outra pessoa da equipe:** painel → **Configurações →
Administradores → Adicionar**. Depois ela abre o `admin.html`, clica em
*"Primeiro acesso? Criar conta"* e define a senha dela.

**Trocar de projeto Supabase:** edite `url` e `anonKey` em
`js/supabase-config.js` e rode o SQL de `supabase/migrations/` no novo projeto.

> ⚠️ **Véspera do evento:** projetos gratuitos do Supabase são **pausados após
> alguns dias sem uso**. Abra o painel do Supabase e confirme que o projeto está
> ativo — se estiver pausado, clique em *Restore*.

### 4.5 Mudar as opções dos campos

As listas de **faturamento**, **segmento** e **função** ficam no fim de
`js/supabase-config.js`, em `CRACHA_OPCOES`. Edite, salve e publique — as duas
telas passam a usar as novas opções.

### 4.6 Se a internet cair no meio do evento

- O formulário avisa o participante e **mantém os dados preenchidos** para tentar
  de novo.
- O painel mostra "Tempo real: reconectando…" e continua recarregando a lista
  sozinho a cada minuto; ao voltar, imprime os pendentes.
- **Plano B total:** o `index.html` funciona 100% offline — cadastre na mão e
  imprima.

---

## 5. Identidade visual

As telas usam o **Design System v1.0 da Gestão Life** — o mesmo da Escola de
Gerentes. `assets/css/estilo.css` é uma **cópia fiel** desse arquivo: para
atualizar a identidade, basta substituí-lo pela versão nova.

- Tema escuro e quente: **Ash** (fundos), **Ember** (marca) e **Bone** (texto).
- Tipografia Instrument Sans + Instrument Serif (itálico) nos acentos da marca.
- O que existe só aqui — cartaz do QR, linhas-card dos participantes, abas e as
  regras de impressão — fica em `assets/css/crachas.css`, sempre usando os
  tokens do sistema (nenhuma cor solta).

As quatro regras do design system valem nestas telas:
cards lado a lado com a mesma altura; corpo de texto nunca abaixo de 16px;
**nunca tabela crua** (a lista de participantes são linhas-card); e conteúdo
preenchendo a tela.

> O `index.html` (console de impressão manual) segue com o visual claro
> original — ele é a ferramenta interna de lote e não passou pelo redesenho.

---

## 6. Detalhes técnicos (ZD220, 203 dpi)

- 203 dpi = **8 dots/mm** (ex.: 90 mm → 720 dots).
- Toda etiqueta começa com `^XA` e termina com `^XZ`.
- `^CI28` ativa acentuação (UTF-8).
- Comandos usados: `^FO` (posição), `^A0N` (fonte), `^FB` (centralizar texto),
  `^GB` (borda), `^BC` (Code128), `^BE` (EAN-13), `^BQ` (QR), `^PQ` (cópias).

---

## 7. Solução de problemas

**A impressora não aparece (status vermelho)**
- O **Zebra Browser Print** está aberto/rodando? (ícone na bandeja)
- A ZD220 está ligada e conectada no USB?
- Os arquivos `libs/BrowserPrint-*.min.js` existem e estão com os nomes certos?
  (veja [`libs/README.md`](libs/README.md)). Clique em **Reconectar**.

**Acentos saem errados (Ã, Â, símbolos)**
- O app já envia `^CI28`. Confirme que o arquivo importado está em **UTF-8**.
  No Excel, salve como **"CSV UTF-8 (delimitado por vírgula)"**.

**Etiqueta cortada / fora de posição**
- A largura/altura em mm precisa bater com a etiqueta física carregada.
- Calibre a mídia na ZD220 (segure o botão de avanço com a impressora ligada até
  ela medir a etiqueta) e confira as medidas no app.

**Imprime em branco ou não imprime**
- Verifique se a mídia é **térmica direta** (a ZD220 padrão não usa ribbon).
- Faça o **autoteste** da impressora para confirmar que o hardware está OK.

**EAN-13 não imprime**
- EAN-13 exige **12 ou 13 dígitos numéricos**. Para texto/letras, use **Code 128**.

**No Mac, a impressora não conecta (pílula vermelha)**
- Está usando **Safari**? Troque para o **Chrome**: o Safari exige o certificado
  do Browser Print instalado no Chaveiro.
- No Chrome, abra `https://localhost:9101` e aceite o certificado uma vez.
- O programa Zebra Browser Print está aberto (ícone na barra superior)?
- Último recurso: abra o `admin.html` local (`file://`), que dispensa o certificado.

**O crachá não sai sozinho**
- A aba **Estação de impressão** está aberta e com **"Impressão automática
  ativada"** marcada?
- A pilha da impressora no topo está verde? Se não, abra o Browser Print e clique
  em **Reconectar**.
- Apareceu o botão **Retomar impressão**? A fila pausou por uma falha — resolva e
  clique nele.
- Em último caso, use o botão **Imprimir** na linha da pessoa (aba Participantes).

**O painel diz "Conta sem permissão"**
- O e-mail usado no login não está em `cracha_admins`. Peça a um administrador
  para adicioná-lo em **Configurações → Administradores**.

**"Tempo real: reconectando…" não sai**
- Internet instável ou o projeto Supabase pausado. O painel continua funcionando
  (recarrega sozinho a cada minuto); confira o projeto no painel do Supabase.

**O QR do cartaz abre uma página em branco**
- O cartaz precisa ser gerado **a partir do site publicado** (não do arquivo
  local): abra o `admin.html` pela URL do GitHub Pages antes de imprimir.

**O Google Sheets não carrega**
- A planilha precisa estar como **"Qualquer pessoa com o link → Leitor"**.
- Se mesmo assim falhar, use **Arquivo → Compartilhar → Publicar na web → CSV**
  e cole esse link.
- Alternativa infalível: **Arquivo → Fazer download → CSV** e use "carregar
  arquivo".

---

## 8. Publicar no GitHub Pages (abrir em outro PC)

O projeto é um site estático (sem build), então dá pra publicar no **GitHub
Pages** e abrir em qualquer PC pela URL. O repositório já está iniciado e
commitado (branch `main`). Falta enviar para o GitHub:

1. Crie um repositório **vazio** em https://github.com/new (ex.: nome `cracha`,
   **Public**, sem README).
2. No terminal, dentro desta pasta, rode (troque `SEU-USUARIO`):
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/cracha.git
   git push -u origin main
   ```
   O GitHub vai pedir login. Use seu usuário e um **token** no lugar da senha
   (Settings → Developer settings → Personal access tokens). Em Mac/Windows é mais
   fácil instalar o **GitHub Desktop** e usar *Add → Publish repository*.
3. No GitHub: **Settings → Pages → Branch `main` / `/root` → Save**.
4. Em ~1 min a URL fica pronta: `https://SEU-USUARIO.github.io/cracha/`. Abra
   essa URL em qualquer PC.

### Estação de impressão no Mac

O Browser Print tem versão para macOS, então a estação pode ser um Mac ligado à
ZD220 por USB. Duas coisas mudam em relação ao Windows e as duas já derrubaram
teste de gente experiente:

**1. Use o Chrome, não o Safari.** A página fica em `https://` (GitHub Pages) e
precisa falar com o Browser Print em `https://localhost:9101`. O Chrome resolve
isso com um clique; o Safari exige instalar o certificado no Chaveirocom e marcar
como confiável, e falha calado quando isso não é feito. No Chrome:

1. Instale o **Zebra Browser Print** para Mac e deixe o programa aberto (ícone na
   barra superior).
2. Ligue a ZD220 no USB.
3. Abra `https://localhost:9101` numa aba. Vai aparecer aviso de certificado:
   clique em **Avançado** e depois em **Prosseguir para localhost**. É uma vez só,
   por Mac.
4. Abra `https://crachas.gestaolife.com/admin.html`, entre e vá em **Estação**. A
   pílula da impressora no topo tem que ficar verde com o nome da ZD220.
5. Clique em **Testar**. Saiu etiqueta, está pronto.

**2. O Mac não pode dormir.** Em **Ajustes do Sistema → Tela bloqueada**, deixe
"Desligar a tela quando inativo" em *Nunca* enquanto durar o evento, ou rode
`caffeinate -d` no Terminal. Deixe a aba do painel **aberta e visível**: em aba
escondida o macOS segura os temporizadores, e a fila só anda pelo tempo real.

> **Se o certificado der trabalho:** copie a pasta do projeto para o Mac e abra o
> `admin.html` com dois cliques (`file://`). Aí o Browser Print funciona sem
> certificado nenhum, e o painel continua conversando com o banco normalmente.
> Nesse caso **imprima o cartaz pelo site publicado**, não pelo arquivo local: o
> QR guarda o endereço da página onde foi gerado, e um QR com `file://` não abre
> em celular nenhum.

### Para imprimir de verdade em cada PC (Windows)
O Browser Print é por máquina, então **em cada PC** que for imprimir:
1. Instale o **Zebra Browser Print** e adicione a ZD220 (seção 1).
2. **Importante (GitHub Pages é HTTPS):** abra uma vez
   `https://localhost:9101` (ou `https://127.0.0.1:9101`) no navegador e
   **aceite/confie no certificado** do Browser Print. Sem isso, um site `https://`
   não consegue falar com a impressora local.
3. Os arquivos do SDK (`libs/BrowserPrint-*.min.js`) precisam estar **commitados**
   no repositório para o Pages carregá-los. Enquanto não estiverem, o site abre em
   **Modo simulação** (gera o ZPL, mas não imprime). Veja [`libs/README.md`](libs/README.md).

> **Sem complicação de HTTPS:** se preferir, copie a pasta para o outro PC
> (USB/Google Drive) e abra o `index.html` direto (`file://`). Aí o Browser Print
> funciona em `http://localhost` sem precisar confiar em certificado.

---

## Estrutura do projeto

```
cracha/
├── inscricao.html             ← formulário do participante (abre pelo QR)
├── admin.html                 ← painel: cadastros, planilha, impressão automática
├── index.html                 ← console de impressão manual / em lote
├── README.md                  ← este arquivo
├── exemplo-participantes.csv  ← planilha de exemplo (5 pessoas)
├── assets/
│   ├── css/estilo.css         ← Design System v1.0 da Gestão Life (cópia fiel)
│   ├── css/crachas.css        ← só o que existe neste sistema (cartaz, linhas-card)
│   └── img/logo-gestao-life.svg
├── js/
│   ├── cracha-core.js         ← layout do crachá + ZPL (usado pelas duas telas)
│   └── supabase-config.js     ← endereço do banco + opções dos campos
├── supabase/migrations/       ← SQL das tabelas e permissões
└── libs/
    ├── README.md              ← como obter o BrowserPrint SDK
    ├── BrowserPrint-3.1.250.min.js
    ├── BrowserPrint-Zebra-1.1.250.min.js
    ├── supabase-js-2.112.4.min.js   ← cópias locais: o evento não depende de CDN
    ├── qrcode-generator-1.4.4.js
    └── xlsx-0.18.5.full.min.js
```
