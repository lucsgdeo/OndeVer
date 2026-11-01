import { useMemo, useState } from 'react';
import {
  findNextGameId,
  gamesOnDay,
  groupRemainingGamesByDay,
  listGameDays,
  pickInitialDay,
  sortByCurrentRelevance,
} from '../../application/agenda';
import { formatDay, toDayKey } from '../../domain/brasiliaTime';
import { isTeamDefined, type Schedule } from '../../domain/game';
import { matchesPlatforms, matchesTeamQuery } from '../../domain/gameFilters';
import type { PlatformId } from '../../domain/platform';
import { useNow } from '../hooks/useNow';
import { DayNavigator } from './DayNavigator';
import { Filters } from './Filters';
import { GameTable } from './GameTable';

const DAY_TITLE: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };

export function Agenda({ schedule }: { schedule: Schedule }) {
  const now = useNow();
  const { games, broadcastsConfirmedThrough } = schedule;
  const gameDays = useMemo(() => listGameDays(games), [games]);
  const today = toDayKey(now);

  const [selectedDay, setSelectedDay] = useState(() => pickInitialDay(gameDays, new Date()));
  const [query, setQuery] = useState('');
  const [platforms, setPlatforms] = useState<ReadonlySet<PlatformId>>(new Set());

  const teams = useMemo(
    () =>
      [...new Set(games.flatMap((game) => [game.away, game.home]).filter(isTeamDefined).map((team) => team.name))].sort(),
    [games],
  );
  const platformGames = useMemo(
    () => games.filter((game) => matchesPlatforms(game, platforms)),
    [games, platforms],
  );

  if (!selectedDay) return <p className="message">Nenhum jogo disponível no momento.</p>;

  const isSearching = query.trim() !== '';
  const footer = (
    <footer className="site-footer">
      Horários de Brasília. Calendário atualizado em{' '}
      {schedule.updatedAt.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}; a
      programação pode mudar, confirme na plataforma. Status estimado pelo horário do jogo. Site
      não oficial, sem vínculo com a NBA.
    </footer>
  );

  const filters = (
    <Filters
      query={query}
      onQueryChange={setQuery}
      teams={teams}
      selected={platforms}
      onSelectedChange={setPlatforms}
    />
  );

  if (isSearching) {
    const groups = groupRemainingGamesByDay(
      platformGames.filter((game) => matchesTeamQuery(game, query)),
      now,
    );
    return (
      <main>
        {filters}
        {groups.length === 0 && (
          <p className="message">Nenhum jogo futuro encontrado para “{query.trim()}”.</p>
        )}
        {groups.map((group) => (
          <section key={group.dayKey} className="day-section">
            <h2 className="day-title">{formatDay(group.dayKey, DAY_TITLE)}</h2>
            <GameTable games={group.games} now={now} />
          </section>
        ))}
        {footer}
      </main>
    );
  }

  const dayGames = gamesOnDay(platformGames, selectedDay);
  const nextDayWithGames = listGameDays(platformGames).find((day) => day > selectedDay);
  const isBeyondConfirmedGrid = selectedDay > broadcastsConfirmedThrough;

  return (
    <main>
      {filters}
      <DayNavigator
        days={gameDays}
        selectedDay={selectedDay}
        today={today}
        onSelect={setSelectedDay}
      />
      <section className="day-section">
        <h2 className="day-title">
          {selectedDay === today && <span className="today-mark">Hoje · </span>}
          {formatDay(selectedDay, DAY_TITLE)}
        </h2>
        {isBeyondConfirmedGrid && (
          <p className="notice">
            ESPN, Disney+ e Prime Video ainda não têm grade cadastrada para esta data. Por enquanto,
            aparece só o League Pass, que transmite todos os jogos.
          </p>
        )}
        {dayGames.length > 0 ? (
          <GameTable
            games={sortByCurrentRelevance(dayGames, now)}
            now={now}
            nextGameId={findNextGameId(dayGames, now)}
          />
        ) : (
          <div className="message">
            <p>Nenhum jogo nesta plataforma neste dia.</p>
            {nextDayWithGames && (
              <button
                type="button"
                className="link-button"
                onClick={() => setSelectedDay(nextDayWithGames)}
              >
                Ir para o próximo: {formatDay(nextDayWithGames, { day: '2-digit', month: '2-digit' })}
              </button>
            )}
          </div>
        )}
      </section>
      {footer}
    </main>
  );
}
