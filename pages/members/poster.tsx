import { graphql, useLazyLoadQuery } from 'react-relay';

import { posterQuery } from '~/generated/posterQuery.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import GalleryAuthenticatedRoute from '~/scenes/_Router/GalleryAuthenticatedRoute';
import PosterPage from '~/scenes/MintPages/PosterPage';

export default function Poster() {
  const query = useLazyLoadQuery<posterQuery>(
    graphql`
      query posterQuery {
        ...GalleryAuthenticatedRouteFragment
      }
    `,
    {}
  );

  const isMobile = useIsMobileWindowWidth();

  return (
    <GalleryAuthenticatedRoute
      authenticatedRouteQueryRef={query}
      element={<PosterPage />}
      navbar={false}
      banner={false}
      footer={!isMobile}
    />
  );
}
