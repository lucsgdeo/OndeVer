import { PLATFORMS, type PlatformId } from '../../domain/platform';

interface FiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  teams: string[];
  selected: ReadonlySet<PlatformId>;
  onSelectedChange: (selected: ReadonlySet<PlatformId>) => void;
}

export function Filters({ query, onQueryChange, teams, selected, onSelectedChange }: FiltersProps) {
  function toggle(id: PlatformId) {
    const next = new Set(selected);
    if (!next.delete(id)) next.add(id);
    onSelectedChange(next);
  }

  return (
    <div className="filters">
      <label className="search">
        <span className="visually-hidden">Pesquisar por time</span>
        <input
          type="search"
          placeholder="Pesquisar time"
          list="team-names"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <datalist id="team-names">
          {teams.map((team) => (
            <option key={team} value={team} />
          ))}
        </datalist>
      </label>
      <div className="platform-filter" role="group" aria-label="Filtrar por plataforma">
        {PLATFORMS.map((platform) => (
          <button
            key={platform.id}
            type="button"
            className={`chip platform-${platform.id}`}
            aria-pressed={selected.has(platform.id)}
            onClick={() => toggle(platform.id)}
          >
            {platform.label}
          </button>
        ))}
      </div>
    </div>
  );
}
