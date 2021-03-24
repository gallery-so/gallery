import { Suspense, memo } from 'react';
import ErrorBoundary from './ErrorBoundary';

export const Boundary = memo(({ children }) => {
  return (
    <Suspense fallback="Loading...">
      <ErrorBoundary>{children}</ErrorBoundary>
    </Suspense>
  );
});
export default Boundary;
