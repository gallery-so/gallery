import { useMemo } from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// The types here are not great from the Skeleton library
// Idiomatically, the type of children would ReactNode so
// we could use PropsWithChildren, but this is fine.
export function GallerySkeleton({ children }: { children: JSX.Element }) {
  const speed = useMemo(() => {
    return 800 + Math.random() * 800;
  }, []);

  return (
    <SkeletonPlaceholder
      speed={speed}
      borderRadius={4}
      highlightColor="#f2f2f2"
      backgroundColor="#e2e2e2"
    >
      {children}
    </SkeletonPlaceholder>
  );
}
