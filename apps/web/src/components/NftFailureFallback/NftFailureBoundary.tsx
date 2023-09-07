import { createElement, useMemo } from 'react';
import styled from 'styled-components';

import { useNftErrorContext } from '~/contexts/NftErrorContext';
import { useNftRetry } from '~/hooks/useNftRetry';
import {
  ReportingErrorBoundary,
  ReportingErrorBoundaryProps,
} from '~/shared/errors/ReportingErrorBoundary';
import colors from '~/shared/theme/colors';

import { VStack } from '../core/Spacer/Stack';
import { NftFailureFallback, NftFallbackLabel } from './NftFailureFallback';

type Props = {
  tokenId: string;
  fallback?: ReportingErrorBoundaryProps['fallback'];
  loadingFallback?: ReportingErrorBoundaryProps['fallback'];
} & Omit<ReportingErrorBoundaryProps, 'fallback'>;

export function NftFailureBoundary({
  tokenId,
  fallback = <NftFailureFallback tokenId={tokenId} />,
  loadingFallback = <NftLoadingFallback size="medium" />,
  ...rest
}: Props) {
  const { handleNftError, retryKey } = useNftRetry({
    tokenId,
  });

  const { tokens } = useNftErrorContext();

  console.log({ tokens });

  const additionalTags = useMemo(() => ({ tokenId }), [tokenId]);

  if (tokens[tokenId]?.isLoading) {
    return <>{loadingFallback}</>;
  }

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
      // fallback={fallback}
      {...rest}
    />
  );
}

type NftLoadingFallbackProps = {
  size?: 'tiny' | 'medium';
};

export function NftLoadingFallback({ size = 'medium' }: NftLoadingFallbackProps) {
  return (
    <Container justify="center" align="center">
      <NftFallbackLabel size={size}>Loading...</NftFallbackLabel>
    </Container>
  );
}

const Container = styled(VStack)`
  width: 100%;
  height: 100%;

  background-color: ${colors.offWhite};
`;
