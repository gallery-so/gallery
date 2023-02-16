import { useEffect, useMemo, useState } from 'react';

export const MINT_START = '2023-02-23T14:00:00-05:00'; // time is in EST (GMT-05:00)
export const MINT_END = '2023-03-02T23:59:00-05:00';

export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return currentTime;
}

type MintPhase = 'pre-mint' | 'active-mint' | 'post-mint';

export default function useMintPhase(): MintPhase {
  const now = useCurrentTime();

  return useMemo(() => {
    if (now < new Date(MINT_START)) return 'pre-mint';
    if (now < new Date(MINT_END)) return 'active-mint';
    return 'post-mint';
  }, [now]);
}
