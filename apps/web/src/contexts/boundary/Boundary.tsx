import { useRouter } from 'next/router';
import { memo, PropsWithChildren, Suspense, useMemo } from 'react';

import FullPageLoader from '~/components/core/Loader/FullPageLoader';

import ErrorBoundary from './ErrorBoundary';

const NO_FULL_PAGE_LOADER_PATHS = ['/features'];

const isPathExcluded = (pathname: string) => {
  return NO_FULL_PAGE_LOADER_PATHS.some((path) => pathname.startsWith(path));
};

const Boundary = memo(({ children }: PropsWithChildren) => {
  const { pathname } = useRouter();

  const isFullPageLoaderExcluded = useMemo(() => isPathExcluded(pathname), [pathname]);

  if (isFullPageLoaderExcluded) {
    return (
      <Suspense>
        <ErrorBoundary>{children}</ErrorBoundary>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<FullPageLoader />}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </Suspense>
  );
});

Boundary.displayName = 'Boundary';

export default Boundary;
