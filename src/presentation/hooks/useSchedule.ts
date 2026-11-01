import { useEffect, useState } from 'react';
import type { ScheduleRepository } from '../../application/ScheduleRepository';
import type { Schedule } from '../../domain/game';

type ScheduleState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; schedule: Schedule };

export function useSchedule(repository: ScheduleRepository): ScheduleState {
  const [state, setState] = useState<ScheduleState>({ kind: 'loading' });

  useEffect(() => {
    let active = true;
    repository
      .load()
      .then((schedule) => active && setState({ kind: 'ready', schedule }))
      .catch(() => active && setState({ kind: 'error' }));
    return () => {
      active = false;
    };
  }, [repository]);

  return state;
}
