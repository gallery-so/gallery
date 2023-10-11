import { ReactNode } from 'react';
import styled from 'styled-components';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseXL } from '~/components/core/Text/Text';
import formatError from '~/shared/errors/formatError';
import {
  ReportingErrorBoundary,
  ReportingErrorBoundaryFallbackProps,
} from '~/shared/errors/ReportingErrorBoundary';

function DefaultFallback({ error }: ReportingErrorBoundaryFallbackProps) {
  const errorMessage = formatError(error);

  return (
    <StyledErrorBoundary gap={16} justify="center" align="center">
      <VStack gap={48}>
        <BaseXL>{errorMessage}</BaseXL>
        <StyledReachOut>
          If you&apos;re continuing to see this error, reach out to us on{' '}
          <GalleryLink href="https://discord.gg/QcJjCDucwK">Discord</GalleryLink>.
        </StyledReachOut>
      </VStack>
    </StyledErrorBoundary>
  );
}

type Props = {
  fallback?: ReactNode;
  children: ReactNode;
};

function ErrorBoundary({ fallback, children }: Props) {
  return (
    <ReportingErrorBoundary fallback={fallback ?? DefaultFallback}>
      {children}
    </ReportingErrorBoundary>
  );
}

const StyledErrorBoundary = styled(VStack)`
  height: 100vh;
  padding-bottom: 16px;
`;

const StyledReachOut = styled(BaseM)`
  font-style: italic;
`;

export default ErrorBoundary;
