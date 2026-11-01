import type { ScheduleRepository } from '../application/ScheduleRepository';
import type { Game, Schedule, ScheduleStatus, Team } from '../domain/game';
import { isPlatformId } from '../domain/platform';

interface GameDto {
  id: string;
  startsAt: string;
  timeConfirmed: boolean;
  status: ScheduleStatus;
  away: Team;
  home: Team;
  platforms: string[];
}

interface ScheduleDto {
  updatedAt: string;
  broadcastsConfirmedThrough: string;
  games: GameDto[];
}

function toGame(dto: GameDto): Game {
  return { ...dto, startsAt: new Date(dto.startsAt), platforms: dto.platforms.filter(isPlatformId) };
}

export class JsonScheduleRepository implements ScheduleRepository {
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async load(): Promise<Schedule> {
    const response = await fetch(this.url);
    if (!response.ok) throw new Error(`Falha ao carregar os jogos (${response.status})`);
    const dto = (await response.json()) as ScheduleDto;
    return {
      updatedAt: new Date(dto.updatedAt),
      broadcastsConfirmedThrough: dto.broadcastsConfirmedThrough,
      games: dto.games.map(toGame),
    };
  }
}
