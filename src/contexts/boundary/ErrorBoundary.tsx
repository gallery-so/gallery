import { Component } from 'react';
import { Subdisplay } from 'components/core/Text/Text';
import Page from 'components/core/Page/Page';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Page centered withRoomForFooter={false}>
          <Subdisplay>
            {
              // @ts-ignore
              this.state.error?.message ?? 'There was an error'
            }
          </Subdisplay>
        </Page>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
