import { ApiError } from 'errors/types';
import { Component } from 'react';
import NotFound from 'scenes/NotFound/NotFound';

class UserGalleryPageErrorBoundary extends Component {
  state: { error: null | Error | ApiError } = { error: null };
  static getDerivedStateFromError(error: Error | ApiError) {
    return { error };
  }

  render() {
    if (this.state.error instanceof ApiError && this.state.error.code === 404) {
      return <NotFound/>;
    }

    return this.props.children;
  }
}

export default UserGalleryPageErrorBoundary;
