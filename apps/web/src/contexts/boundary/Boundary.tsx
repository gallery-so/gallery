import { memo, PropsWithChildren, Suspense } from 'react';

import FullPageLoader from '~/components/core/Loader/FullPageLoader';

import ErrorBoundary from './ErrorBoundary';

const Boundary = memo(({ children }: PropsWithChildren) => (
  <Suspense fallback={<FullPageLoader />}>
    <ErrorBoundary>{children}</ErrorBoundary>
  </Suspense>
));

Boundary.displayName = 'Boundary';

export default Boundary;
