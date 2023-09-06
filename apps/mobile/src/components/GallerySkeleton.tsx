import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import colors from '~/shared/theme/colors';

// The types here are not great from the Skeleton library
// Idiomatically, the type of children would ReactNode so
// we could use PropsWithChildren, but this is fine.
export function GallerySkeleton({
  children,
  borderRadius = 4,
}: {
  children: JSX.Element;
  borderRadius?: number;
}) {
  const speed = useMemo(() => {
    return 800 + Math.random() * 800;
  }, []);

  const { colorScheme } = useColorScheme();

  return (
    <SkeletonPlaceholder
      speed={speed}
      borderRadius={borderRadius}
      highlightColor={colorScheme === 'dark' ? colors.black['500'] : colors.faint}
      backgroundColor={colorScheme === 'dark' ? colors.black['800'] : colors.porcelain}
    >
      {children}
    </SkeletonPlaceholder>
  );
}
