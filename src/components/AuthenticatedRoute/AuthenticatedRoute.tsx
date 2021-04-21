import { ComponentType } from 'react';
import { Redirect, RouteComponentProps } from '@reach/router';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';

type Props = {
  Component: ComponentType<RouteComponentProps>;
} & RouteComponentProps;

export default function AuthenticatedRoute({
  Component,
  ...routeProps
}: Props) {
  const isAuthenticated = useIsAuthenticated();
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }
  return <Component {...routeProps} />;
}
