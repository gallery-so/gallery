export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const MONTH = DAY * 30;
const YEAR = MONTH * 12; // TODO account for leapyear

export const pause = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// given a timestamp, returns an abbreviated string of how long it has been since. ie "12s", "4d", etc
export const getTimeSince = (time: string) => {
  const interval = Math.floor(Date.now() - new Date(time).getTime());

  if (interval < MINUTE) {
    return `<1m`;
  }
  if (interval < HOUR) {
    return `${Math.floor(interval / MINUTE)}m`;
  }
  if (interval < DAY) {
    return `${Math.floor(interval / HOUR)}h`;
  }
  if (interval < MONTH) {
    return `${Math.floor(interval / DAY)}d`;
  }
  if (interval < YEAR) {
    return `${Math.floor(interval / MONTH)}mo`;
  }

  return `${Math.floor(interval / YEAR)}y`;
};

export const getDaysSince = (time: string) => {
  return Math.floor((Date.now() - new Date(time).getTime()) / (1000 * 60 * 60 * 24));
};

export const getTimestamp = () => {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};
