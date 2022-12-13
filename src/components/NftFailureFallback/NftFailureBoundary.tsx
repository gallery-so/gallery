import { useMemo } from 'react';

import {
  ReportingErrorBoundary,
  ReportingErrorBoundaryProps,
} from '~/contexts/boundary/ReportingErrorBoundary';

type Props = {
  tokenId: string;
} & ReportingErrorBoundaryProps;

export function NftFailureBoundary({ tokenId, additionalTags, ...rest }: Props) {
  const tagsToSendThrough = useMemo(() => {
    return {
      ...additionalTags,
      tokenId,
    };
  }, [additionalTags, tokenId]);

  return <ReportingErrorBoundary {...rest} additionalTags={tagsToSendThrough} />;
}
