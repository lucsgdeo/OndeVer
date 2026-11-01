# OndeVer

Site estático que lista os jogos da NBA com horário de Brasília e onde assistir no Brasil, em layout de planilha responsivo. Não tem backend: o React lê um JSON gerado no repositório e o site é publicado no GitHub Pages.

O `README.md` traz as instruções para pessoas, e `Script1.md` traz o briefing original do produto.

## Comandos

Requer Node.js 24 ou mais recente, porque `data:update` executa TypeScript direto no Node.

```bash
npm run dev          # servidor de desenvolvimento
npm test             # testes (Vitest)
npx tsc --noEmit     # só a checagem de tipos
npm run build        # checa os tipos e gera dist/
npm run data:update  # regenera public/data/games.json (requer internet)
```

## Arquitetura

Clean Architecture: as dependências apontam para dentro (`presentation`/`infrastructure` → `application` → `domain`).

| Caminho | Responsabilidade |
| --- | --- |
| `src/domain/` | Regras puras: `game.ts` (tipos e status), `platform.ts`, `gameFilters.ts`, `brasiliaTime.ts`. Não depende de React nem de I/O. |
| `src/application/` | `agenda.ts` (dia inicial, ordenação, próximo jogo, agrupamento) e a porta `ScheduleRepository`. |
| `src/infrastructure/` | `JsonScheduleRepository`: busca o JSON e converte o DTO em entidades do domínio. |
| `src/presentation/` | Componentes, hooks e `styles.css`. `Agenda.tsx` concentra o estado da tela: dia, busca e plataformas. |
| `src/main.tsx` | Ponto de composição: cria o repositório e o injeta em `App`. |
| `scripts/update-schedule.ts` | Gera o JSON. Fica fora de `src/` e não importa de lá. |

## Fluxo de dados

```
API da ESPN (não documentada) ─┐
                               ├─ npm run data:update ─> public/data/games.json ─> site
data/broadcasts-br.json ───────┘
```

- `public/data/games.json` é gerado: não edite à mão.
- `data/broadcasts-br.json` é curado à mão e associa o ID do jogo na ESPN às transmissões. `confirmedThrough` é o último dia coberto; depois dele, o site avisa que a grade não foi cadastrada.
- Todo jogo recebe `league-pass` automaticamente, então ele não entra no arquivo curado.

## Regras que não são óbvias

- **Fuso horário:** dia e hora são sempre os de Brasília, onde quer que o usuário esteja. Use as funções de `brasiliaTime.ts` (`toDayKey`, `formatTime`, `formatDay`), e não os métodos locais de `Date`.
- **Status estimado:** `getGameProgress` deduz "em andamento" e "encerrado" pelo horário, supondo 3 horas de jogo. Não há placar nem situação ao vivo real.
- **Busca e dia são modos distintos:** com texto na busca, a tela lista os jogos futuros do time, agrupados por dia, e ignora o dia selecionado. Sem texto, mostra só o dia selecionado.
- **Sem plataforma selecionada, nada é filtrado.** Com várias, basta o jogo estar em uma delas.
- **Times a definir:** a ESPN publica jogos da Copa NBA com a abreviação `TBD`. Use `isTeamDefined`.
- **IDs de plataforma desconhecidos somem sem erro:** o script não valida `broadcasts-br.json`, e o repositório descarta o que `isPlatformId` não reconhece. Uma plataforma nova precisa entrar em `PLATFORMS` (`platform.ts`).
- **Temporada fixa no código:** `SEASON_FIRST_DAY` e `SEASON_LAST_DAY` em `update-schedule.ts` precisam ser atualizados a cada temporada.
- **Caminhos relativos:** `base: './'` no Vite faz o site funcionar em `/<repositório>/`. Monte URLs de arquivos públicos com `import.meta.env.BASE_URL`, nunca com `/` no início.

## Convenções

- Textos da interface e comentários em português do Brasil; identificadores em inglês.
- `erasableSyntaxOnly` está ativo, e o Node executa o script sem compilar. Não use `enum`, `namespace` nem parameter properties.
- Mantenha as regras de negócio em `domain`/`application`, testáveis sem React. Os testes ficam ao lado do código (`*.test.ts`); hoje só `src/application/agenda.test.ts` existe.

## Publicação

`.github/workflows/deploy.yml` roda em push na `main`, todo dia às 9h UTC (6h em Brasília) e sob demanda.

- **Push:** testa e publica, mas **não** roda `data:update`. Ao alterar `broadcasts-br.json`, rode `npm run data:update` e faça commit do `games.json` junto, ou a mudança só aparece na próxima execução diária.
- **Agendado ou manual:** também atualiza o calendário e faz commit do `games.json` pelo bot. Faça `git pull` antes de trabalhar, pois a `main` recebe esses commits automáticos.
