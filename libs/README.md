# Biblioteca Zebra Browser Print SDK (JavaScript)

Esta pasta deve conter os arquivos do **BrowserPrint SDK** da Zebra, que fazem
a página conversar com a impressora. A Zebra **não** distribui por CDN público,
então você precisa baixar e copiar os arquivos para cá manualmente.

> Sem esses arquivos o app **ainda abre e funciona** no **Modo simulação**
> (ele só mostra o ZPL que seria enviado). Você só precisa deles para imprimir
> de verdade.

## Arquivos esperados

```
libs/
├── BrowserPrint-3.1.250.min.js          ← núcleo do SDK
└── BrowserPrint-Zebra-1.1.250.min.js    ← extensão Zebra (ZPL/impressoras)
```

Os números de versão podem variar conforme o pacote que você baixar
(ex.: `BrowserPrint-3.1.x.min.js`). Se os nomes forem diferentes, **renomeie
para os nomes acima** OU ajuste os dois `<script src="libs/...">` no topo do
`index.html` para casar com os nomes reais.

## Onde baixar

1. Acesse a página oficial do **Zebra Browser Print**:
   https://www.zebra.com/us/en/support-downloads/printer-software/browser-print.html
2. Baixe e instale o **Zebra Browser Print** (Windows ou macOS). É ele que roda
   em segundo plano e fala com a impressora USB.
3. Os arquivos `.js` do SDK acompanham o pacote de desenvolvedor / a instalação.
   Procure por uma pasta tipo `BrowserPrint SDK` / `JavaScript` com os arquivos
   `BrowserPrint-*.min.js` e `BrowserPrint-Zebra-*.min.js`.
   - No Windows costuma ficar em algo como
     `C:\Program Files\Zebra Technologies\Zebra Browser Print\` ou no pacote SDK baixado.
4. Copie os dois arquivos `.min.js` para dentro desta pasta `libs/`.

## Como saber se deu certo

- Abra o `index.html`.
- Se o indicador no topo ficar **verde** ("Conectado a …"), o SDK carregou e
  encontrou a impressora.
- Se ficar **vermelho** ("Browser Print não encontrado"):
  - confirme que o programa **Zebra Browser Print** está rodando (ícone na bandeja);
  - confirme que os arquivos `.js` estão nesta pasta com os nomes certos;
  - clique em **Reconectar**.

---

## Outras bibliotecas nesta pasta

Ficam versionadas aqui (em vez de virem de um CDN) para o evento **não depender
de internet boa** no momento da impressão:

| Arquivo | Para quê | Origem |
|---|---|---|
| `supabase-js-2.112.4.min.js` | conexão com o banco dos cadastros | npm `@supabase/supabase-js@2.112.4` (`dist/umd/supabase.js`) |
| `qrcode-generator-1.4.4.js` | gera o QR Code do cartaz (SVG) | npm `qrcode-generator@1.4.4` (`qrcode.js`) |
| `xlsx-0.18.5.full.min.js` | lê e exporta planilhas | npm `xlsx@0.18.5` (`dist/xlsx.full.min.js`) |

Para atualizar alguma delas, baixe a versão nova do npm, substitua o arquivo e
ajuste a tag `<script>` nas páginas que a usam.
