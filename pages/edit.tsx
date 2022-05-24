import GalleryAuthenticatedRoute from 'scenes/_Router/GalleryAuthenticatedRoute';
import EditGalleryFlow from 'flows/EditGalleryFlow/EditGalleryFlow';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { editQuery } from '__generated__/editQuery.graphql';

export default function Edit() {
  const query = useLazyLoadQuery<editQuery>(
    graphql`
      query editQuery {
        ...GalleryAuthenticatedRouteFragment
        ...EditGalleryFlowFragment
      }
    `,
    {}
  );

  return (
    <GalleryAuthenticatedRoute
      authenticatedRouteQueryRef={query}
      element={<EditGalleryFlow queryRef={query} />}
      navbar={false}
      footer={false}
    />
  );
}
