import { useEffect, useState } from 'react';

export default function useTimer(date: string) {
  const currentTime = Date.now();
  const mintDate = new Date(date);

  const [countDown, setCountDown] = useState(mintDate.getTime() - currentTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(mintDate.getTime() - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [countDown, mintDate]);

  const days = Math.floor(countDown / (1000 * 60 * 60 * 24))
    .toString()
    .padStart(2, '0');
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60))
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000)
    .toString()
    .padStart(2, '0');

  const hasEnded = countDown <= 0;

  return {
    timestamp: `${days}:${hours}:${minutes}:${seconds}`,
    hasEnded,
  };
}
