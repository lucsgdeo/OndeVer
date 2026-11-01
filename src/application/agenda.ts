import { toDayKey } from '../domain/brasiliaTime';
import { getGameProgress, type Game } from '../domain/game';

export interface DayGroup {
  dayKey: string;
  games: Game[];
}

export function listGameDays(games: Game[]): string[] {
  return [...new Set(games.map((game) => toDayKey(game.startsAt)))].sort();
}

/** Hoje, se houver jogos; senão o próximo dia com jogos; fora de temporada, o último. */
export function pickInitialDay(gameDays: string[], now: Date): string | undefined {
  const today = toDayKey(now);
  return gameDays.find((day) => day >= today) ?? gameDays.at(-1);
}

export function gamesOnDay(games: Game[], dayKey: string): Game[] {
  return games.filter((game) => toDayKey(game.startsAt) === dayKey);
}

const PROGRESS_ORDER = { live: 0, upcoming: 1, postponed: 2, canceled: 2, finished: 3 };

/** Põe primeiro o que está passando e o que vem a seguir; os encerrados ficam no fim. */
export function sortByCurrentRelevance(games: Game[], now: Date): Game[] {
  return [...games].sort(
    (a, b) =>
      PROGRESS_ORDER[getGameProgress(a, now)] - PROGRESS_ORDER[getGameProgress(b, now)] ||
      a.startsAt.getTime() - b.startsAt.getTime(),
  );
}

/** O primeiro jogo ainda por começar: é o destaque da lista. */
export function findNextGameId(games: Game[], now: Date): string | undefined {
  return games
    .filter((game) => getGameProgress(game, now) === 'upcoming')
    .reduce<Game | undefined>(
      (next, game) => (!next || game.startsAt < next.startsAt ? game : next),
      undefined,
    )?.id;
}

/** Jogos que ainda interessam (em andamento ou futuros), agrupados por dia. */
export function groupRemainingGamesByDay(games: Game[], now: Date): DayGroup[] {
  const groups = new Map<string, Game[]>();
  games
    .filter((game) => {
      const progress = getGameProgress(game, now);
      return progress === 'live' || progress === 'upcoming';
    })
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .forEach((game) => {
      const dayKey = toDayKey(game.startsAt);
      groups.set(dayKey, [...(groups.get(dayKey) ?? []), game]);
    });
  return [...groups].map(([dayKey, dayGames]) => ({ dayKey, games: dayGames }));
}
