export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const MONTH = DAY * 30;
const YEAR = MONTH * 12; // TODO account for leapyear

const _appendLeadingZero = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

export const pause = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// given a timestamp, returns an abbreviated string of how long it has been since. ie "12s", "4d", etc
export const getTimeSince = (time: string) => {
  const interval = Math.floor(Date.now() - new Date(time).getTime());

  if (interval < MINUTE) {
    return `just now`;
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
