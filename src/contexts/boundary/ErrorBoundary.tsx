import { Component } from 'react';
import styled from 'styled-components';
import { Heading, BodyRegular } from 'components/core/Text/Text';
import Page from 'components/core/Page/Page';
import Spacer from 'components/core/Spacer/Spacer';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import { formatDetailedError } from 'errors/formatError';
import colors from 'components/core/colors';

class ErrorBoundary extends Component {
  state: { error: null | Error } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error !== null) {
      const { header, description } = formatDetailedError(this.state.error);

      return (
        <Page centered topPadding>
          <Heading>{header}</Heading>
          <Spacer height={8} />
          <BodyRegular>{description}</BodyRegular>
          <Spacer height={48} />
          <StyledReachOut color={colors.gray50}>If you're continuing to see this error, reach out to us on <GalleryLink href="https://discord.gg/QcJjCDucwK">Discord</GalleryLink>.</StyledReachOut>
          <Spacer height={16} />
        </Page>
      );
    }

    return this.props.children;
  }
}

const StyledReachOut = styled(BodyRegular)`
  font-style: italic;
`;

export default ErrorBoundary;
