# Endereço do sistema

## Situação atual: temporário, no github.io

O sistema está publicado em:

- Painel: https://gestao-life.github.io/Cracha-eventos/admin.html
- Inscrição: https://gestao-life.github.io/Cracha-eventos/inscricao.html

O arquivo `CNAME` foi removido de propósito. Enquanto ele existia, o GitHub
redirecionava o github.io para `crachas.gestaolife.com`, e esse domínio **não
aponta para o GitHub Pages**: tem um registro A para `179.198.109.17`, uma
máquina que serve uma cópia antiga do site. Por isso a raiz abria e as páginas
novas davam 404.

---

## Passo a passo para voltar ao crachas.gestaolife.com

O DNS do `gestaolife.com` é administrado na **Hostinger** (os servidores de nome
são `ns1.dns-parking.com` e `ns2.dns-parking.com`).

### 1. Abrir o editor de DNS

1. Entre em <https://hpanel.hostinger.com>.
2. Menu **Domínios** e escolha **gestaolife.com**.
3. Abra **DNS / Servidores de nomes** (em alguns temas: **Zona DNS**).

### 2. Apagar o registro errado

Na lista, ache a linha:

| Tipo | Nome | Aponta para |
|---|---|---|
| A | `crachas` | `179.198.109.17` |

Clique em **Excluir**. Esse é o registro que está mandando o domínio para a
máquina errada. Ele precisa sair antes do próximo passo: a Hostinger não aceita
um CNAME com o mesmo nome de um A já existente.

> Confira antes se alguém da equipe usa alguma coisa nesse endereço. Hoje ele
> responde só com uma cópia antiga deste mesmo sistema, então é resíduo.

### 3. Criar o registro certo

Clique em **Adicionar registro** e preencha:

| Campo | Valor |
|---|---|
| Tipo | `CNAME` |
| Nome | `crachas` |
| Aponta para (Target) | `gestao-life.github.io` |
| TTL | deixe o padrão, ou `300` para propagar mais rápido |

Salve.

Se por algum motivo o painel não aceitar CNAME nesse nome, dá para usar quatro
registros **A** no lugar, todos com o nome `crachas`:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### 4. Esperar a propagação

O registro antigo está com TTL de 4 horas, então quem já consultou o domínio
hoje pode continuar vendo o endereço velho por até esse tempo. Normalmente é
bem mais rápido.

Para conferir, no Terminal do Mac:

```bash
nslookup crachas.gestaolife.com
```

Tem que responder um IP `185.199.10x.153` (ou o nome `gestao-life.github.io`),
e não mais o `179.198.109.17`.

Pelo navegador, dá para acompanhar em <https://dnschecker.org>, buscando
`crachas.gestaolife.com`.

### 5. Devolver o domínio ao sistema

Quando o passo 4 confirmar, recrie o arquivo `CNAME` na raiz do repositório com
uma única linha:

```
crachas.gestaolife.com
```

Ou, pelo GitHub: **Settings → Pages → Custom domain**, escrever
`crachas.gestaolife.com` e salvar (o GitHub cria o arquivo sozinho). Marque
**Enforce HTTPS** assim que o certificado for emitido, o que leva alguns
minutos.

---

## Cuidado com o cartaz

O QR Code guarda o endereço da página onde foi gerado.

- Cartaz gerado **agora** aponta para o github.io.
- Cartaz gerado **depois do passo 5** aponta para o crachas.gestaolife.com.

Para testar hoje, imprima à vontade. **O cartaz definitivo do evento só depois
do passo 5**, senão os participantes vão apontar a câmera para um endereço que
deixou de existir.
