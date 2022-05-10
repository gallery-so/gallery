import { graphql, useFragment } from 'react-relay';
import { GalleryAuthenticatedRouteFragment$key } from '__generated__/GalleryAuthenticatedRouteFragment.graphql';
import GalleryRedirect from './GalleryRedirect';
import GalleryV2Route, { Props as GalleryV2RouteProps } from './GalleryV2Route';

// TODO: may want to remember where the user was going and redirect them
// to their desired route upon authentication
export default function GalleryAuthenticatedRoute(
  props: GalleryV2RouteProps & { authenticatedRouteQueryRef: GalleryAuthenticatedRouteFragment$key }
) {
  const { viewer } = useFragment(
    graphql`
      fragment GalleryAuthenticatedRouteFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
            }
          }
        }
      }
    `,
    props.authenticatedRouteQueryRef
  );

  const isAuthenticated = Boolean(viewer?.user?.id);

  if (!isAuthenticated) {
    return <GalleryRedirect to="/" />;
  }

  return <GalleryV2Route {...props} />;
}
