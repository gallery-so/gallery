import PosterPage from 'scenes/PosterPage/PosterPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { isFeatureEnabled } from 'utils/featureFlag';
import { FeatureFlag } from 'components/core/enums';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { object006Query } from '__generated__/object006Query.graphql';

export default function Poster() {
  if (!isFeatureEnabled(FeatureFlag.POSTER_PAGE)) {
    return <GalleryRedirect to="/" />;
  }

  const query = useLazyLoadQuery<object006Query>(
    graphql`
      query object006Query {
        ...GalleryRouteFragment
      }
    `,
    {}
  );

  return <GalleryRoute queryRef={query} element={<PosterPage />} />;
}
