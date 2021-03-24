import React from 'react';

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
      // @ts-ignore
      return <h1>{this.state.error.message}</h1>;
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
