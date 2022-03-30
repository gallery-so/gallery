import { Component } from 'react';
import styled from 'styled-components';
import { Heading, BaseM } from 'components/core/Text/Text';
import Page from 'components/core/Page/Page';
import Spacer from 'components/core/Spacer/Spacer';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import { formatDetailedError } from 'errors/formatError';
import colors from 'components/core/colors';
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
      const { header, description } = formatDetailedError(this.state.error);

      return (
        <Page centered topPadding>
          <Heading>{header}</Heading>
          <Spacer height={8} />
          <BaseM>{description}</BaseM>
          <Spacer height={48} />
          <StyledReachOut color={colors.gray50}>
            If you&apos;re continuing to see this error, reach out to us on{' '}
            <GalleryLink href="https://discord.gg/QcJjCDucwK">Discord</GalleryLink>.
          </StyledReachOut>
          <Spacer height={16} />
        </Page>
      );
    }

    return this.props.children;
  }
}

const StyledReachOut = styled(BaseM)`
  font-style: italic;
`;

export default ErrorBoundary;
