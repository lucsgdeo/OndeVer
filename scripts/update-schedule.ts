/**
 * Regenera public/data/games.json:
 * calendário da ESPN + grade brasileira curada em data/broadcasts-br.json.
 * Uso: npm run data:update
 */
import { readFile, writeFile } from 'node:fs/promises';

const SCOREBOARD_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
const SEASON_FIRST_DAY = '2026-10-20';
const SEASON_LAST_DAY = '2027-06-30';
const CONCURRENT_REQUESTS = 8;
const OUTPUT_PATH = new URL('../public/data/games.json', import.meta.url);
const BROADCASTS_PATH = new URL('../data/broadcasts-br.json', import.meta.url);

interface EspnTeam {
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  location: string;
}

interface EspnEvent {
  id: string;
  date: string;
  status: { type: { name: string } };
  competitions: {
    timeValid?: boolean;
    competitors: { homeAway: 'home' | 'away'; team: EspnTeam }[];
  }[];
}

interface BroadcastsFile {
  confirmedThrough: string;
  source: string;
  games: Record<string, string[]>;
}

function listDays(firstDay: string, lastDay: string): string[] {
  const days: string[] = [];
  const cursor = new Date(`${firstDay}T00:00:00Z`);
  const end = new Date(`${lastDay}T00:00:00Z`);
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10).replaceAll('-', ''));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

async function fetchDay(day: string): Promise<EspnEvent[]> {
  const response = await fetch(`${SCOREBOARD_URL}?dates=${day}`);
  if (!response.ok) throw new Error(`ESPN respondeu ${response.status} para ${day}`);
  const body = (await response.json()) as { events?: EspnEvent[] };
  return body.events ?? [];
}

async function fetchSeason(days: string[]): Promise<EspnEvent[]> {
  const eventsById = new Map<string, EspnEvent>();
  for (let start = 0; start < days.length; start += CONCURRENT_REQUESTS) {
    const batch = days.slice(start, start + CONCURRENT_REQUESTS);
    const results = await Promise.all(batch.map(fetchDay));
    results.flat().forEach((event) => eventsById.set(event.id, event));
  }
  return [...eventsById.values()];
}

function toTeam(team: EspnTeam) {
  const code = team.abbreviation.toLowerCase();
  // Mata-mata da Copa NBA: a ESPN publica o jogo antes de saber quem joga.
  const isDefined = team.abbreviation !== 'TBD';
  return {
    abbreviation: team.abbreviation,
    name: isDefined ? team.displayName : 'A definir',
    shortName: isDefined ? team.shortDisplayName : 'A definir',
    logo: `https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/${code}.png`,
    logoDark: `https://a.espncdn.com/i/teamlogos/nba/500-dark/scoreboard/${code}.png`,
  };
}

function toStatus(espnStatus: string): 'scheduled' | 'postponed' | 'canceled' {
  if (espnStatus === 'STATUS_POSTPONED') return 'postponed';
  if (espnStatus === 'STATUS_CANCELED') return 'canceled';
  return 'scheduled';
}

function toGame(event: EspnEvent, broadcasts: BroadcastsFile) {
  const competition = event.competitions[0];
  const home = competition.competitors.find((c) => c.homeAway === 'home');
  const away = competition.competitors.find((c) => c.homeAway === 'away');
  if (!home || !away) throw new Error(`Jogo ${event.id} sem os dois times`);
  return {
    id: event.id,
    startsAt: new Date(event.date).toISOString(),
    timeConfirmed: competition.timeValid !== false,
    status: toStatus(event.status.type.name),
    away: toTeam(away.team),
    home: toTeam(home.team),
    // O League Pass exibe toda a temporada no Brasil; os demais vêm da grade curada.
    platforms: ['league-pass', ...(broadcasts.games[event.id] ?? [])],
  };
}

const broadcasts = JSON.parse(await readFile(BROADCASTS_PATH, 'utf8')) as BroadcastsFile;
const events = await fetchSeason(listDays(SEASON_FIRST_DAY, SEASON_LAST_DAY));
if (events.length === 0) throw new Error('A ESPN não retornou jogos; o arquivo atual foi mantido.');

const games = events
  .filter((event) => event.competitions[0].competitors.length === 2)
  .map((event) => toGame(event, broadcasts))
  .sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.id.localeCompare(b.id));

const output = {
  updatedAt: new Date().toISOString(),
  broadcastsConfirmedThrough: broadcasts.confirmedThrough,
  games,
};
await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 1)}\n`);
console.log(`${games.length} jogos salvos em public/data/games.json`);
