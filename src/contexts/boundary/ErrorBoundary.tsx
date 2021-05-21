import { Subdisplay } from 'components/core/Text/Text';
import React from 'react';
import styled from 'styled-components';

class ErrorBoundary extends React.Component {
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
        <StyledErrorView>
          <Subdisplay>
            {
              // @ts-ignore
              this.state.error?.message ?? 'There was an error'
            }
          </Subdisplay>
        </StyledErrorView>
      );
    }
    return this.props.children;
  }
}

const StyledErrorView = styled.div`
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;
`;

export default ErrorBoundary;
