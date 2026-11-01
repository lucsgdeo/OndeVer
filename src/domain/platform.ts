export const PLATFORMS = [
  { id: 'league-pass', label: 'NBA League Pass' },
  { id: 'espn-2', label: 'ESPN 2' },
  { id: 'disney-plus', label: 'Disney+ Premium' },
  { id: 'prime-video', label: 'Prime Video' },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]['id'];

export function isPlatformId(value: string): value is PlatformId {
  return PLATFORMS.some((platform) => platform.id === value);
}

export function getPlatformLabel(id: PlatformId): string {
  return PLATFORMS.find((platform) => platform.id === id)?.label ?? id;
}
