import { renderHook } from '@testing-library/react-hooks';
import useTimer from './useTimer';

function convertToSeconds(timestamp: string): number {
  const [days, hours, minutes, seconds] = timestamp.split(':');

  return (
    Number(days) * 24 * 60 * 60 + Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds)
  );
}

describe('useTimer hooks', () => {
  test('render timestamp', () => {
    const now = new Date();
    const date = now.setDate(now.getDate() + 1).toString();
    const { result } = renderHook(() => useTimer(date));
    const { timestamp, hasEnded } = result.current;

    expect(timestamp).toContain(':');
    expect(hasEnded).toBe(false);
  });

  test('if its previous date, it should ended', () => {
    const pastDate = '2021-05-23T00:00:00';
    const { result } = renderHook(() => useTimer(pastDate));
    const { hasEnded } = result.current;

    expect(hasEnded).toBe(true);
  });

  test('if one hour left, it should return timestamp and not ended', () => {
    const hour = 60 * 60;
    const now = new Date();
    const date = new Date(now.setHours(now.getHours() + 1)).toString();
    const { result } = renderHook(() => useTimer(date));
    const { timestamp, hasEnded } = result.current;

    const totalSeconds = convertToSeconds(timestamp);

    expect(totalSeconds).toBeLessThanOrEqual(hour * 60);
    expect(hasEnded).toBe(false);
  });

  test('if one minute left it should return timestamp and not ended', () => {
    const minute = 1;
    const date = new Date(new Date().getTime() + minute * 60000).toString();
    const { result } = renderHook(() => useTimer(date));
    const { timestamp, hasEnded } = result.current;

    const totalSeconds = convertToSeconds(timestamp);

    expect(totalSeconds).toBeLessThanOrEqual(minute * 60);
    expect(hasEnded).toBe(false);
  });
});
