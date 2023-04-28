import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import colors from '~/shared/theme/colors';

// The types here are not great from the Skeleton library
// Idiomatically, the type of children would ReactNode so
// we could use PropsWithChildren, but this is fine.
export function GallerySkeleton({ children }: { children: JSX.Element }) {
  const speed = useMemo(() => {
    return 800 + Math.random() * 800;
  }, []);

  const colorScheme = useColorScheme();

  return (
    <SkeletonPlaceholder
      speed={speed}
      borderRadius={4}
      highlightColor={colorScheme === 'dark' ? colors.graphite : colors.faint}
      backgroundColor={colorScheme === 'dark' ? colors.offBlack : colors.porcelain}
    >
      {children}
    </SkeletonPlaceholder>
  );
}
