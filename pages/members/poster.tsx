import PosterPage from 'scenes/PosterPage/PosterPage';
import { isFeatureEnabled } from 'utils/featureFlag';
import { FeatureFlag } from 'components/core/enums';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { posterQuery } from '__generated__/posterQuery.graphql';
import GalleryAuthenticatedRoute from 'scenes/_Router/GalleryAuthenticatedRoute';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';

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

  if (!isFeatureEnabled(FeatureFlag.POSTER_PAGE)) {
    return <GalleryRedirect to="/" />;
  }

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
