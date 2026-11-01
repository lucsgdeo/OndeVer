import { describe, expect, it } from 'vitest';
import { toDayKey } from '../domain/brasiliaTime';
import { getGameProgress, type Game, type Team } from '../domain/game';
import { matchesPlatforms, matchesTeamQuery } from '../domain/gameFilters';
import {
  findNextGameId,
  groupRemainingGamesByDay,
  pickInitialDay,
  sortByCurrentRelevance,
} from './agenda';

function team(name: string, abbreviation: string): Team {
  return { name, abbreviation, shortName: name, logo: '', logoDark: '' };
}

function game(id: string, startsAt: string, overrides: Partial<Game> = {}): Game {
  return {
    id,
    startsAt: new Date(startsAt),
    timeConfirmed: true,
    status: 'scheduled',
    away: team('Los Angeles Lakers', 'LAL'),
    home: team('Boston Celtics', 'BOS'),
    platforms: ['league-pass'],
    ...overrides,
  };
}

const NOW = new Date('2026-11-02T01:00:00Z'); // 22h de 01/11 em Brasília

describe('toDayKey', () => {
  it('usa o dia de Brasília, não o de UTC', () => {
    expect(toDayKey(new Date('2026-11-02T02:30:00Z'))).toBe('2026-11-01');
    expect(toDayKey(new Date('2026-11-02T03:00:00Z'))).toBe('2026-11-02');
  });
});

describe('getGameProgress', () => {
  it('classifica o jogo pelo horário', () => {
    expect(getGameProgress(game('a', '2026-11-02T02:00:00Z'), NOW)).toBe('upcoming');
    expect(getGameProgress(game('b', '2026-11-02T00:00:00Z'), NOW)).toBe('live');
    expect(getGameProgress(game('c', '2026-11-01T20:00:00Z'), NOW)).toBe('finished');
  });

  it('respeita jogo adiado mesmo depois do horário', () => {
    const postponed = game('a', '2026-11-01T20:00:00Z', { status: 'postponed' });
    expect(getGameProgress(postponed, NOW)).toBe('postponed');
  });
});

describe('pickInitialDay', () => {
  const days = ['2026-10-31', '2026-11-03', '2026-11-04'];

  it('prefere hoje e, sem jogos hoje, o próximo dia', () => {
    expect(pickInitialDay(['2026-11-01', ...days], NOW)).toBe('2026-11-01');
    expect(pickInitialDay(days, NOW)).toBe('2026-11-03');
  });

  it('cai no último dia quando a temporada acabou', () => {
    expect(pickInitialDay(['2026-10-30', '2026-10-31'], NOW)).toBe('2026-10-31');
    expect(pickInitialDay([], NOW)).toBeUndefined();
  });
});

describe('ordenação pelo momento atual', () => {
  const finished = game('finished', '2026-11-01T20:00:00Z');
  const live = game('live', '2026-11-02T00:00:00Z');
  const later = game('later', '2026-11-02T02:30:00Z');
  const next = game('next', '2026-11-02T02:00:00Z');

  it('coloca ao vivo, depois próximos e por fim encerrados', () => {
    const ids = sortByCurrentRelevance([finished, later, next, live], NOW).map((g) => g.id);
    expect(ids).toEqual(['live', 'next', 'later', 'finished']);
  });

  it('identifica o próximo jogo', () => {
    expect(findNextGameId([finished, later, next, live], NOW)).toBe('next');
  });

  it('agrupa só o que ainda vai acontecer', () => {
    const tomorrow = game('tomorrow', '2026-11-03T00:00:00Z');
    const groups = groupRemainingGamesByDay([finished, tomorrow, next], NOW);
    expect(groups.map((g) => [g.dayKey, g.games.map((x) => x.id)])).toEqual([
      ['2026-11-01', ['next']],
      ['2026-11-02', ['tomorrow']],
    ]);
  });
});

describe('filtros', () => {
  const lakersGame = game('a', '2026-11-02T02:00:00Z', { platforms: ['league-pass', 'espn-2'] });

  it('busca time por nome, cidade ou sigla, sem diferenciar maiúsculas', () => {
    expect(matchesTeamQuery(lakersGame, 'lakers')).toBe(true);
    expect(matchesTeamQuery(lakersGame, 'BOSTON')).toBe(true);
    expect(matchesTeamQuery(lakersGame, 'lal')).toBe(true);
    expect(matchesTeamQuery(lakersGame, 'knicks')).toBe(false);
  });

  it('aceita o jogo presente em qualquer plataforma selecionada', () => {
    expect(matchesPlatforms(lakersGame, new Set())).toBe(true);
    expect(matchesPlatforms(lakersGame, new Set(['espn-2', 'prime-video']))).toBe(true);
    expect(matchesPlatforms(lakersGame, new Set(['prime-video']))).toBe(false);
  });
});
