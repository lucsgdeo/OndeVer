import type { ScheduleRepository } from '../application/ScheduleRepository';
import { Agenda } from './components/Agenda';
import { useSchedule } from './hooks/useSchedule';

export function App({ repository }: { repository: ScheduleRepository }) {
  const state = useSchedule(repository);

  return (
    <div className="page">
      <header className="site-header">
        <h1 className="brand">OndeVer</h1>
        <p className="tagline">Onde assistir à NBA no Brasil</p>
      </header>
      {state.kind === 'loading' && <p className="message">Carregando jogos…</p>}
      {state.kind === 'error' && (
        <p className="message" role="alert">
          Não foi possível carregar os jogos. Recarregue a página para tentar de novo.
        </p>
      )}
      {state.kind === 'ready' && <Agenda schedule={state.schedule} />}
    </div>
  );
}
