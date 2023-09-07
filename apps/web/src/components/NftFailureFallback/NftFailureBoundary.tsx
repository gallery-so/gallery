import { createElement, useMemo } from 'react';

import { useNftErrorContext } from '~/contexts/NftErrorContext';
import { useNftRetry } from '~/hooks/useNftRetry';
import {
  ReportingErrorBoundary,
  ReportingErrorBoundaryProps,
} from '~/shared/errors/ReportingErrorBoundary';

import { NftFailureFallback } from './NftFailureFallback';

type Props = {
  tokenId: string;
  fallback?: ReportingErrorBoundaryProps['fallback'];
} & Omit<ReportingErrorBoundaryProps, 'fallback'>;

export function NftFailureBoundary({
  tokenId,
  fallback = <NftFailureFallback tokenId={tokenId} />,
  ...rest
}: Props) {
  const { handleNftError, retryKey } = useNftRetry({
    tokenId,
  });

  const { tokens } = useNftErrorContext();

  const additionalTags = useMemo(() => ({ tokenId }), [tokenId]);

  if (tokens[tokenId]?.isFailed) {
    if (typeof fallback === 'function') {
      return createElement(fallback, { error: new Error() });
    } else {
      return <>{fallback}</>;
    }
  }

  return (
    <ReportingErrorBoundary
      key={retryKey}
      onError={handleNftError}
      additionalTags={additionalTags}
      fallback={fallback}
      {...rest}
    />
  );
}
