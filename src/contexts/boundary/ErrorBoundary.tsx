import { Component } from 'react';
import styled from 'styled-components';
import { BaseXL, BaseM } from 'components/core/Text/Text';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import formatError from 'errors/formatError';
import { captureException } from '@sentry/nextjs';
import { Spacer, VStack } from 'components/core/Spacer/Stack';

class ErrorBoundary extends Component {
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  state: { error: null | Error } = { error: null };

  componentDidCatch(error: Error) {
    captureException(error, {
      tags: {
        context: 'AppErrorBoundary',
      },
    });
  }

  render() {
    if (this.state.error !== null) {
      const errorMessage = formatError(this.state.error);

      return (
        <StyledErrorBoundary gap={16} justify="center" align="center">
          <VStack gap={48}>
            <BaseXL>{errorMessage}</BaseXL>
            <StyledReachOut>
              If you&apos;re continuing to see this error, reach out to us on{' '}
              <GalleryLink href="https://discord.gg/QcJjCDucwK">Discord</GalleryLink>.
            </StyledReachOut>
          </VStack>
          <Spacer />
        </StyledErrorBoundary>
      );
    }

    return this.props.children;
  }
}

const StyledErrorBoundary = styled(VStack)`
  height: 100vh;
`;

const StyledReachOut = styled(BaseM)`
  font-style: italic;
`;

export default ErrorBoundary;
