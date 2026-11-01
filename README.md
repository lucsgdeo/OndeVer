# OndeVer

Lista os jogos da NBA com horário de Brasília e onde assistir no Brasil, em um layout de planilha para desktop e celular.

## Funcionalidades

- Abre no dia atual, ou no próximo dia com jogos.
- Mostra primeiro os jogos em andamento e os próximos, com destaque para o próximo jogo. Os encerrados ficam no fim.
- Pesquisa por time, listando todos os jogos futuros do time.
- Filtra por plataforma: NBA League Pass, ESPN 2, Disney+ Premium e Prime Video.

## Como rodar

É preciso ter o Node.js 24 ou mais recente.

```bash
npm install
npm run dev          # ambiente de desenvolvimento
npm test             # testes
npm run build        # gera a versão de produção em dist/
npm run data:update  # atualiza o calendário
```

## Dados

| Arquivo | Conteúdo | Origem |
| --- | --- | --- |
| `public/data/games.json` | Arquivo lido pelo site, gerado por `npm run data:update` | API pública e não documentada da ESPN, mais o arquivo abaixo |
| `data/broadcasts-br.json` | Transmissões além do League Pass, por ID do jogo da ESPN | Curadoria manual |

Todos os jogos recebem o League Pass, que transmite a temporada inteira no Brasil. Nenhuma API pública informa as transmissões brasileiras jogo a jogo, por isso a grade de ESPN, Disney+ e Prime Video é mantida à mão.

### Atualizar a grade brasileira

1. Em `data/broadcasts-br.json`, adicione os jogos em `games`: `"<id do jogo>": ["espn-2", "disney-plus"]`. Os valores aceitos são `espn-2`, `disney-plus` e `prime-video`.
2. Altere `confirmedThrough` para o último dia coberto. Depois dessa data, o site avisa que a grade ainda não foi cadastrada.
3. Rode `npm run data:update`.

O status do jogo é estimado pelo horário, considerando 3 horas de duração. O site não mostra placar nem situação ao vivo real.

## Arquitetura

As dependências apontam para dentro, seguindo a Clean Architecture:

```
src/
├── domain/          Regras de negócio: jogos, plataformas, filtros e horário de Brasília
├── application/     Montagem da agenda e a porta ScheduleRepository
├── infrastructure/  Leitura do JSON (implementa a porta)
├── presentation/    Componentes React, hooks e estilos
└── main.tsx         Ponto de composição
scripts/             Geração do JSON
```

## Publicação no GitHub Pages

1. Envie o projeto para a branch `main` de um repositório no GitHub.
2. Em **Settings → Pages → Source**, escolha **GitHub Actions**.

O workflow `.github/workflows/deploy.yml` testa e publica o site a cada push. Ele também roda todo dia às 6h de Brasília para atualizar o calendário.
