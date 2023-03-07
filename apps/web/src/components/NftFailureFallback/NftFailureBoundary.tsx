import { createElement, useMemo } from 'react';

import { useNftErrorContext } from '~/contexts/NftErrorContext';
import {
  ReportingErrorBoundary,
  ReportingErrorBoundaryProps,
} from '~/shared/errors/ReportingErrorBoundary';

type Props = {
  tokenId: string;
} & ReportingErrorBoundaryProps;

export function NftFailureBoundary({ tokenId, additionalTags, ...rest }: Props) {
  const { tokens } = useNftErrorContext();

  const tagsToSendThrough = useMemo(() => {
    return {
      ...additionalTags,
      tokenId,
    };
  }, [additionalTags, tokenId]);

  if (tokens[tokenId]?.isFailed) {
    const fallback = rest.fallback;

    if (typeof fallback === 'function') {
      return createElement(fallback, { error: new Error() });
    } else {
      return <>{fallback}</>;
    }
  }

  return <ReportingErrorBoundary {...rest} additionalTags={tagsToSendThrough} />;
}
