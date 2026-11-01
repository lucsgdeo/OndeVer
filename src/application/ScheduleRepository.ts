import type { Schedule } from '../domain/game';

export interface ScheduleRepository {
  load(): Promise<Schedule>;
}
