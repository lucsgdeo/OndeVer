import { useEffect, useState } from 'react';

const REFRESH_INTERVAL_MS = 60_000;

/** Hora atual, renovada a cada minuto para os status dos jogos não ficarem parados. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return now;
}
