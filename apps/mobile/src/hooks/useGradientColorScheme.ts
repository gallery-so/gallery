import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';

export function useGradientColorScheme() {
  const { colorScheme } = useColorScheme();
  return useMemo(
    () =>
      colorScheme === 'dark'
        ? ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']
        : ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'],
    [colorScheme]
  );
}
