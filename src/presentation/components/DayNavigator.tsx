import { formatDay } from '../../domain/brasiliaTime';

const DAYS_AROUND_SELECTED = 3;

interface DayNavigatorProps {
  days: string[];
  selectedDay: string;
  today: string;
  onSelect: (day: string) => void;
}

export function DayNavigator({ days, selectedDay, today, onSelect }: DayNavigatorProps) {
  const selectedIndex = days.indexOf(selectedDay);
  const lastStart = Math.max(0, days.length - (DAYS_AROUND_SELECTED * 2 + 1));
  const start = Math.min(Math.max(0, selectedIndex - DAYS_AROUND_SELECTED), lastStart);
  const visibleDays = days.slice(start, start + DAYS_AROUND_SELECTED * 2 + 1);
  const todayOrNext = days.find((day) => day >= today) ?? days.at(-1)!;

  return (
    <nav className="day-nav" aria-label="Escolher dia">
      <button
        type="button"
        className="day-arrow"
        aria-label="Dia anterior"
        disabled={selectedIndex <= 0}
        onClick={() => onSelect(days[selectedIndex - 1])}
      >
        ‹
      </button>
      <div className="day-strip">
        {visibleDays.map((day) => (
          <button
            key={day}
            type="button"
            className="day-button"
            aria-current={day === selectedDay ? 'date' : undefined}
            onClick={() => onSelect(day)}
          >
            <span className="day-weekday">
              {day === today ? 'Hoje' : formatDay(day, { weekday: 'short' })}
            </span>
            <span className="day-date">{formatDay(day, { day: '2-digit', month: '2-digit' })}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="day-arrow"
        aria-label="Próximo dia"
        disabled={selectedIndex >= days.length - 1}
        onClick={() => onSelect(days[selectedIndex + 1])}
      >
        ›
      </button>
      {selectedDay !== todayOrNext && (
        <button type="button" className="link-button" onClick={() => onSelect(todayOrNext)}>
          Voltar para hoje
        </button>
      )}
    </nav>
  );
}
