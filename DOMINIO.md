# Endereço do sistema

O sistema atende em **https://crachas.gestaolife.com**:

- Painel da recepção: <https://crachas.gestaolife.com/admin.html>
- Inscrição do participante: <https://crachas.gestaolife.com/inscricao.html>
- Console de impressão em lote: <https://crachas.gestaolife.com>

O arquivo `CNAME` na raiz do repositório é o que diz ao GitHub Pages para
atender nesse domínio. Se ele for removido, o site passa a atender em
`gestao-life.github.io/Cracha-eventos/`.

> **O QR Code do cartaz guarda o endereço da página onde foi gerado.** Gere e
> imprima o cartaz sempre a partir do endereço definitivo. Um cartaz gerado num
> endereço temporário leva os participantes para um lugar que pode deixar de
> existir.

---

## Como o domínio está configurado

O DNS do `gestaolife.com` é administrado na **Hostinger** (servidores de nome
`ns1.dns-parking.com` e `ns2.dns-parking.com`).

| Tipo | Nome | Aponta para |
|---|---|---|
| CNAME | `crachas` | `gestao-life.github.io` |

Esse CNAME resolve para os quatro endereços do GitHub Pages: `185.199.108.153`,
`185.199.109.153`, `185.199.110.153` e `185.199.111.153`.

### Conferir

```bash
nslookup crachas.gestaolife.com
```

Tem que responder `canonical name = gestao-life.github.io` e os IPs acima.

---

## Histórico: o 404 de 30/08/2026

Durante a primeira publicação, `crachas.gestaolife.com` tinha um registro **A**
apontando para `179.198.109.17`, uma máquina que servia uma cópia antiga do
site. O resultado era confuso: a raiz abria normalmente (o `index.html` velho
estava lá) e `/admin.html` e `/inscricao.html` davam 404, mesmo com a publicação
do GitHub Pages tendo funcionado.

Como o `CNAME` fazia o GitHub redirecionar o github.io para esse domínio, não
sobrava nenhum endereço acessível. A saída foi remover o `CNAME` temporariamente
para liberar o github.io, corrigir o DNS na Hostinger e devolver o arquivo.

**Se o sintoma voltar** (raiz abre, páginas internas dão 404), a primeira coisa a
checar é o `nslookup` acima: quase sempre é o domínio apontando para outro lugar,
não problema no código nem na publicação.
