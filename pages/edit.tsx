import GalleryAuthenticatedRoute from 'scenes/_Router/GalleryAuthenticatedRoute';
import EditGalleryFlow from 'flows/EditGalleryFlow/EditGalleryFlow';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { editQuery } from '__generated__/editQuery.graphql';

export default function Edit() {
  const query = useLazyLoadQuery<editQuery>(
    graphql`
      query editQuery {
        ...GalleryAuthenticatedRouteFragment
        ...GalleryRouteFragment
      }
    `,
    {}
  );

  return (
    <GalleryAuthenticatedRoute
      queryRef={query}
      authenticatedRouteQueryRef={query}
      element={<EditGalleryFlow />}
      freshLayout
    />
  );
}
