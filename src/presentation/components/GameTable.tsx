import { useState } from 'react';
import { formatTime } from '../../domain/brasiliaTime';
import {
  getGameProgress,
  isTeamDefined,
  type Game,
  type GameProgress,
  type Team,
} from '../../domain/game';
import { getPlatformLabel } from '../../domain/platform';

const PROGRESS_LABEL: Record<GameProgress, string> = {
  upcoming: '',
  live: 'Em andamento',
  finished: 'Encerrado',
  postponed: 'Adiado',
  canceled: 'Cancelado',
};

function TeamLogo({ team }: { team: Team }) {
  const [failed, setFailed] = useState(false);
  if (!isTeamDefined(team)) return <span className="team-logo team-logo-fallback">?</span>;
  if (failed) return <span className="team-logo team-logo-fallback">{team.abbreviation}</span>;
  return (
    <picture>
      <source srcSet={team.logoDark} media="(prefers-color-scheme: dark)" />
      <img
        className="team-logo"
        src={team.logo}
        alt=""
        width={28}
        height={28}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </picture>
  );
}

function TeamCell({ team, className }: { team: Team; className: string }) {
  return (
    <td className={`team-cell ${className}`}>
      <span className="team">
        <TeamLogo team={team} />
        <span className="team-name" title={team.name}>
          {team.shortName}
        </span>
      </span>
    </td>
  );
}

interface GameRowProps {
  game: Game;
  now: Date;
  isNext: boolean;
}

function GameRow({ game, now, isNext }: GameRowProps) {
  const progress = getGameProgress(game, now);
  const status = isNext ? 'Próximo' : PROGRESS_LABEL[progress];

  return (
    <tr className={`game-row is-${progress}${isNext ? ' is-next' : ''}`}>
      <td className="time-cell">{game.timeConfirmed ? formatTime(game.startsAt) : 'A definir'}</td>
      <td className="status-cell">{status}</td>
      <TeamCell team={game.away} className="away-cell" />
      <TeamCell team={game.home} className="home-cell" />
      <td className="platforms-cell">
        <ul className="platforms">
          {game.platforms.map((platform) => (
            <li key={platform} className={`chip chip-static platform-${platform}`}>
              {getPlatformLabel(platform)}
            </li>
          ))}
        </ul>
      </td>
    </tr>
  );
}

interface GameTableProps {
  games: Game[];
  now: Date;
  nextGameId?: string;
}

export function GameTable({ games, now, nextGameId }: GameTableProps) {
  return (
    <table className="game-table">
      <thead>
        <tr>
          <th scope="col">Horário</th>
          <th scope="col">Status</th>
          <th scope="col">Visitante</th>
          <th scope="col">Mandante</th>
          <th scope="col">Onde assistir</th>
        </tr>
      </thead>
      <tbody>
        {games.map((game) => (
          <GameRow key={game.id} game={game} now={now} isNext={game.id === nextGameId} />
        ))}
      </tbody>
    </table>
  );
}
