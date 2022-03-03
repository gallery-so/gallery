import { captureException } from '@sentry/nextjs';
import { ApiError } from 'errors/types';
import { Component } from 'react';
import NotFound from 'scenes/NotFound/NotFound';

class UserGalleryPageErrorBoundary extends Component {
  static getDerivedStateFromError(error: Error | ApiError) {
    return { error };
  }

  state: { error: null | Error | ApiError } = { error: null };

  componentDidCatch(error: Error) {
    captureException(error, {
      tags: {
        context: 'UserGalleryPageErrorBoundary',
      },
    });
  }

  render() {
    if (
      (this.state.error instanceof ApiError && this.state.error.code === 404) ||
      this.state.error?.message.toLowerCase().includes('not found')
    ) {
      return <NotFound />;
    }

    return this.props.children;
  }
}

export default UserGalleryPageErrorBoundary;
