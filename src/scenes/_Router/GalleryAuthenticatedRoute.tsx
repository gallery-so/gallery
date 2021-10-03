import { Redirect } from '@reach/router';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import Route, { GalleryRouteProps } from './GalleryRoute';

// TODO: may want to remember where the user was going and redirect them
// to their desired route upon authentication
export default function GalleryAuthenticatedRoute(props: GalleryRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  if (!isAuthenticated) {
    return <Redirect to="/" noThrow />;
  }

  return <Route {...props} />;
}
