import { memo, PropsWithChildren, Suspense } from 'react';

import ErrorBoundary from './ErrorBoundary';

const Boundary = memo(({ children }: PropsWithChildren) => (
  <Suspense>
    <ErrorBoundary>{children}</ErrorBoundary>
  </Suspense>
));

Boundary.displayName = 'Boundary';

export default Boundary;
