import { graphql, useFragment } from 'react-relay';
import { GalleryAuthenticatedRouteFragment$key } from '__generated__/GalleryAuthenticatedRouteFragment.graphql';
import GalleryRedirect from './GalleryRedirect';
import GalleryRoute, { Props as GalleryRouteProps } from './GalleryRoute';

// TODO: may want to remember where the user was going and redirect them
// to their desired route upon authentication
export default function GalleryAuthenticatedRoute(
  props: GalleryRouteProps & { authenticatedRouteQueryRef: GalleryAuthenticatedRouteFragment$key }
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

  return <GalleryRoute {...props} />;
}
