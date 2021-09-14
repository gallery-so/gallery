import { Component } from 'react';
import { Subdisplay } from 'components/core/Text/Text';
import Page from 'components/core/Page/Page';
import { formatDetailedError } from 'errors/formatError';

class ErrorBoundary extends Component {
  state: { error: null | Error } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error !== null) {
      const { header, description } = formatDetailedError(this.state.error);
      return (
        <Page centered withRoomForFooter={false}>
          <Subdisplay>{header}</Subdisplay>
          <Subdisplay>{description}</Subdisplay>
        </Page>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
