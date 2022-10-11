import GalleryAuthenticatedRoute from 'scenes/_Router/GalleryAuthenticatedRoute';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { galleriesQuery } from '../__generated__/galleriesQuery.graphql';
import { GalleryNavbar } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';

export default function GalleriesPage() {
  const query = useLazyLoadQuery<galleriesQuery>(
    graphql`
      query galleriesQuery {
        ...GalleryAuthenticatedRouteFragment
        ...GalleryNavbarFragment
      }
    `,
    {}
  );

  return (
    <GalleryAuthenticatedRoute
      authenticatedRouteQueryRef={query}
      element={
        <>
          <GalleryNavbar queryRef={query} />
          <div>Hello, Galleries</div>
        </>
      }
    />
  );
}
