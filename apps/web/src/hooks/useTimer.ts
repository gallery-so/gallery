import { useEffect, useMemo, useState } from 'react';

export default function useTimer(date: string, currentTime?: string) {
  const endDate = useMemo(() => new Date(date), [date]);

  const now = useMemo(() => {
    return currentTime ? new Date(currentTime) : new Date();
  }, [currentTime]);

  const [countDown, setCountDown] = useState(endDate.getTime() - now.getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(endDate.getTime() - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [countDown, endDate, now]);

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
    days,
    hours,
    minutes,
    seconds,
    hasEnded,
  };
}
