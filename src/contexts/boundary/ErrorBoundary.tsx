import { Component } from 'react';
import styled from 'styled-components';
import { BaseXL, BaseM } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import formatError from 'errors/formatError';
import { captureException } from '@sentry/nextjs';

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
        <StyledErrorBoundary>
          <BaseXL>{errorMessage}</BaseXL>
          <Spacer height={48} />
          <StyledReachOut>
            If you&apos;re continuing to see this error, reach out to us on{' '}
            <GalleryLink href="https://discord.gg/QcJjCDucwK">Discord</GalleryLink>.
          </StyledReachOut>
          <Spacer height={16} />
        </StyledErrorBoundary>
      );
    }

    return this.props.children;
  }
}

const StyledErrorBoundary = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
`;

const StyledReachOut = styled(BaseM)`
  font-style: italic;
`;

export default ErrorBoundary;
