# Crachás de Evento — Impressão na Zebra ZD220 (ZPL)

Aplicação web simples (um único `index.html`, **sem servidor e sem build**) para
imprimir **crachás de evento** numa **Zebra ZD220** (203 dpi, ZPL II, USB).

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

## 4. Detalhes técnicos (ZD220, 203 dpi)

- 203 dpi = **8 dots/mm** (ex.: 90 mm → 720 dots).
- Toda etiqueta começa com `^XA` e termina com `^XZ`.
- `^CI28` ativa acentuação (UTF-8).
- Comandos usados: `^FO` (posição), `^A0N` (fonte), `^FB` (centralizar texto),
  `^GB` (borda), `^BC` (Code128), `^BE` (EAN-13), `^BQ` (QR), `^PQ` (cópias).

---

## 5. Solução de problemas

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

**O Google Sheets não carrega**
- A planilha precisa estar como **"Qualquer pessoa com o link → Leitor"**.
- Se mesmo assim falhar, use **Arquivo → Compartilhar → Publicar na web → CSV**
  e cole esse link.
- Alternativa infalível: **Arquivo → Fazer download → CSV** e use "carregar
  arquivo".

---

## 6. Publicar no GitHub Pages (abrir em outro PC)

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
├── index.html                 ← a aplicação (abra este arquivo)
├── README.md                  ← este arquivo
├── .gitignore
├── exemplo-participantes.csv  ← planilha de exemplo (5 pessoas)
└── libs/
    ├── README.md              ← como obter o BrowserPrint SDK
    ├── BrowserPrint-3.1.250.min.js          (você adiciona)
    └── BrowserPrint-Zebra-1.1.250.min.js    (você adiciona)
```
