# Sicoob Centro Games

PWA em Next.js com TypeScript e CSS Modules para totem/evento, com dois jogos: `Jogo da Memoria` e `Caca-Palavras`.

## Stack

- Next.js App Router
- TypeScript
- CSS Modules
- `next-pwa`
- persistencia local em `data/storage.json`

## Rotas

- `/` home com modal do jogo do dia
- `/form` formulario obrigatorio antes do jogo
- `/game/memory` jogo da memoria
- `/game/wordsearch` caca-palavras
- `/resultado?id=...` tela final
- `/relatorio` mini dashboard + exportacao Excel

## Como funciona

1. Na primeira abertura do dia, o modal define o `jogo do dia`.
2. A escolha fica persistida em `data/storage.json`.
3. A home passa a mostrar apenas logo, identidade visual e botao `Iniciar jogo`.
4. O formulario valida nome completo, CPF, telefone e e-mail.
5. O jogo dura `60s`.
6. Ao terminar, o sistema salva o participante no JSON local e mostra o resultado.
7. Se fizer `5` ou mais acertos, ganha brinde.

## Persistencia

Os dados ficam em `data/storage.json`:

- `dailyGame`
- `participants`
- `lastWordSetKey`

### Producao na Vercel

Em ambiente local, o projeto usa `data/storage.json`.

Na Vercel, para persistencia real entre acessos e dispositivos, configure `Vercel KV` e adicione estas variaveis de ambiente:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_STORAGE_KEY` opcional, para trocar o nome da chave principal

Sem essas envs, a Vercel nao consegue persistir o arquivo local entre execucoes. Nesse caso o app ainda funciona com fallback no navegador do totem, mas os dados nao ficam centralizados no servidor.

O Excel e gerado sob demanda em `/api/export` e contem apenas:

- Nome completo
- CPF
- Telefone
- E-mail

## Rodar localmente

```bash
npm install
npm run dev
```

Build de producao:

```bash
npm run build
npm start
```

## Assets

- Cartas do Memory: `public/im1.jpg` ate `public/im10.jpg`
- Logo da marca: `public/logo-mark.svg`

## Observacoes

- O caca-palavras usa 10 palavras por rodada, apenas horizontal e vertical.
- A combinacao da rodada nao se repete exatamente em relacao a rodada anterior.
- O relatorio mostra indicadores e os ultimos participantes.
