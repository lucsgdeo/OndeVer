import type { PlatformId } from './platform';

export interface Team {
  abbreviation: string;
  name: string;
  shortName: string;
  logo: string;
  logoDark: string;
}

export function isTeamDefined(team: Team): boolean {
  return team.abbreviation !== 'TBD';
}

export type ScheduleStatus = 'scheduled' | 'postponed' | 'canceled';

export interface Game {
  id: string;
  startsAt: Date;
  timeConfirmed: boolean;
  status: ScheduleStatus;
  away: Team;
  home: Team;
  platforms: PlatformId[];
}

export interface Schedule {
  updatedAt: Date;
  /** Último dia (AAAA-MM-DD) com a grade de TV e streaming publicada. */
  broadcastsConfirmedThrough: string;
  games: Game[];
}

export type GameProgress = 'upcoming' | 'live' | 'finished' | 'postponed' | 'canceled';

/** Duração estimada de um jogo: o JSON não traz placar ao vivo. */
const ESTIMATED_GAME_DURATION_MS = 3 * 60 * 60 * 1000;

export function getGameProgress(game: Game, now: Date): GameProgress {
  if (game.status !== 'scheduled') return game.status;
  const elapsed = now.getTime() - game.startsAt.getTime();
  if (elapsed < 0) return 'upcoming';
  return elapsed < ESTIMATED_GAME_DURATION_MS ? 'live' : 'finished';
}
