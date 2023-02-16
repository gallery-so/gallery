import { useEffect, useMemo, useState } from 'react';

import { MINT_END, MINT_START } from './config';

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
