import type { Game, Team } from './game';
import type { PlatformId } from './platform';

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function teamMatches(team: Team, query: string): boolean {
  return [team.name, team.abbreviation].some((text) => normalize(text).includes(query));
}

export function matchesTeamQuery(game: Game, query: string): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;
  return teamMatches(game.away, normalizedQuery) || teamMatches(game.home, normalizedQuery);
}

/** Sem plataforma selecionada, nada é filtrado; com várias, basta o jogo estar em uma delas. */
export function matchesPlatforms(game: Game, selected: ReadonlySet<PlatformId>): boolean {
  return selected.size === 0 || game.platforms.some((platform) => selected.has(platform));
}
