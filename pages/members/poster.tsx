import PosterPage from 'scenes/PosterPage/PosterPage';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { posterQuery } from '__generated__/posterQuery.graphql';
import GalleryAuthenticatedRoute from 'scenes/_Router/GalleryAuthenticatedRoute';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';

export default function Poster() {
  const query = useLazyLoadQuery<posterQuery>(
    graphql`
      query posterQuery {
        ...GalleryAuthenticatedRouteFragment
        ...PosterPageFragment
      }
    `,
    {}
  );

  const isMobile = useIsMobileWindowWidth();

  return (
    <GalleryAuthenticatedRoute
      authenticatedRouteQueryRef={query}
      element={<PosterPage queryRef={query} />}
      navbar={false}
      banner={false}
      footer={!isMobile}
    />
  );
}
