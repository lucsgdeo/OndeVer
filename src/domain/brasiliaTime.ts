/** A agenda é sempre exibida no horário de Brasília, onde quer que o usuário esteja. */
const TIME_ZONE = 'America/Sao_Paulo';

const dayKeyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const timeFormat = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});

/** Dia civil em Brasília, no formato AAAA-MM-DD. */
export function toDayKey(date: Date): string {
  return dayKeyFormat.format(date);
}

export function formatTime(date: Date): string {
  return timeFormat.format(date);
}

function dayKeyToDate(dayKey: string): Date {
  // Meio-dia em UTC cai no mesmo dia civil em Brasília.
  return new Date(`${dayKey}T12:00:00Z`);
}

export function formatDay(dayKey: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: TIME_ZONE, ...options })
    .format(dayKeyToDate(dayKey))
    .replace('.', '');
}
