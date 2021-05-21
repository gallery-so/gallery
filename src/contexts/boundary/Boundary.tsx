import { Suspense, memo } from 'react';
import FullPageLoader from 'components/core/Loader/FullPageLoader';
import ErrorBoundary from './ErrorBoundary';

export const Boundary = memo(({ children }) => {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </Suspense>
  );
});
export default Boundary;
