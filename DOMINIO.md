# Endereço do sistema

## Situação atual: temporário, no github.io

O sistema está publicado em:

- Painel: https://gestao-life.github.io/Cracha-eventos/admin.html
- Inscrição: https://gestao-life.github.io/Cracha-eventos/inscricao.html

O arquivo `CNAME` foi removido de propósito. Enquanto ele existia, o GitHub
redirecionava o github.io para `crachas.gestaolife.com`, e esse domínio **não
aponta para o GitHub Pages**: ele tem um registro A para `179.198.109.17`, uma
máquina que serve uma cópia antiga do site. Por isso a raiz abria e as páginas
novas davam 404.

## Como voltar para crachas.gestaolife.com

**1. Corrigir o DNS**, no painel do provedor do domínio `gestaolife.com`:

| Ação | Tipo | Nome | Valor |
|---|---|---|---|
| apagar | A | `crachas` | `179.198.109.17` |
| criar | CNAME | `crachas` | `gestao-life.github.io` |

Se o provedor não aceitar CNAME nesse nome, use quatro registros A no lugar:
`185.199.108.153`, `185.199.109.153`, `185.199.110.153` e `185.199.111.153`.

**2. Conferir a propagação.** No terminal, `nslookup crachas.gestaolife.com`
tem que responder um dos IPs do GitHub acima, e não mais o `179.198.109.17`.

**3. Devolver o arquivo CNAME** com o conteúdo `crachas.gestaolife.com` e dar
push. Em Settings → Pages o domínio volta a aparecer e o GitHub emite o
certificado HTTPS em alguns minutos.

> **Antes de imprimir o cartaz definitivo**, faça o passo 3. O QR Code guarda o
> endereço da página onde foi gerado: um cartaz impresso agora ficaria com o
> endereço do github.io e precisaria ser reimpresso depois da troca.
