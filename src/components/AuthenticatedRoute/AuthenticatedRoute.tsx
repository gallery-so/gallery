import { ComponentType } from 'react';
import { Redirect, RouteComponentProps } from '@reach/router';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';

type Props = {
  Component: ComponentType<RouteComponentProps>;
} & RouteComponentProps;

// TODO: may want to remember where the user was going and redirect them
// to their desired route upon authentication
export default function AuthenticatedRoute({
  Component,
  ...routeProps
}: Props) {
  // const isAuthenticated = useIsAuthenticated();
  // if (!isAuthenticated) {
  //   return <Redirect to="/" />;
  // }
  return <Component {...routeProps} />;
}
