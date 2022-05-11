import { renderHook } from '@testing-library/react-hooks';
import useTimer from './useTimer';

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
    const currentDate = new Date('2022-05-18T23:00:00').toString();
    const mintDate = '2022-05-19T00:00:00';
    const { result } = renderHook(() => useTimer(mintDate, currentDate));
    const { timestamp, hasEnded } = result.current;

    expect(timestamp).toEqual('00:01:00:00');
    expect(hasEnded).toBe(false);
  });

  test('if one minute left, it should return timestamp and not ended', () => {
    const currentDate = new Date('2022-05-18T23:59:00').toString();
    const mintDate = '2022-05-19T00:00:00';
    const { result } = renderHook(() => useTimer(mintDate, currentDate));
    const { timestamp, hasEnded } = result.current;

    expect(timestamp).toEqual('00:00:01:00');
    expect(hasEnded).toBe(false);
  });

  test('if 10 second left, it should return timestamp and not ended', () => {
    const currentDate = new Date('2022-05-18T23:59:50').toString();
    const mintDate = '2022-05-19T00:00:00';
    const { result } = renderHook(() => useTimer(mintDate, currentDate));
    const { timestamp, hasEnded } = result.current;

    expect(timestamp).toEqual('00:00:00:10');
    expect(hasEnded).toBe(false);
  });
});
