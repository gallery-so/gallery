import GalleryAuthenticatedRoute from 'scenes/_Router/GalleryAuthenticatedRoute';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { galleriesQuery } from '../__generated__/galleriesQuery.graphql';

export default function GalleriesPage() {
  const query = useLazyLoadQuery<galleriesQuery>(
    graphql`
      query galleriesQuery {
        ...GalleryAuthenticatedRouteFragment
      }
    `,
    {}
  );

  return (
    <GalleryAuthenticatedRoute
      authenticatedRouteQueryRef={query}
      element={<div>Hello, Galleries</div>}
    />
  );
}
