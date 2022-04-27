import { useEffect, useState } from 'react';

// TODO: Abstract this as a props
const mintDate = new Date('2024-01-01T00:00:00');

export default function useTimer() {
  const currentTime = Date.now();

  const [countDown, setCountDown] = useState(mintDate.getTime() - currentTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(mintDate.getTime() - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [countDown]);

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
    days,
    hours,
    minutes,
    seconds,
    hasEnded,
  };
}
