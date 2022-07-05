import { captureException } from '@sentry/nextjs';
import { Component } from 'react';

export default class FeedEventErrorBoundary extends Component {
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  state: { error: null | Error } = { error: null };

  componentDidCatch(error: Error) {
    console.error('Error loading feed event', error.message);
    captureException(error, {
      tags: {
        context: 'FeedEventErrorBoundary',
      },
    });
  }

  render() {
    if (this.state.error) {
      return null;
    }

    return this.props.children;
  }
}
