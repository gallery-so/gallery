// logs millisecond-level timestamps for granular debugging
export function getMicroTimestamp() {
  const date = new Date();
  const min: any = date.getMinutes();
  const sec: any = date.getSeconds();
  const ms: any = date.getMilliseconds();

  return `${min}:${sec}:${ms}`;
}
