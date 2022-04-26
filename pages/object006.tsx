import PosterPage from 'scenes/PosterPage/PosterPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { isFeatureEnabled } from 'utils/featureFlag';
import { FeatureFlag } from 'components/core/enums';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';

export default function Poster() {
  if (!isFeatureEnabled(FeatureFlag.POSTER_PAGE)) {
    return <GalleryRedirect to="/" />;
  }

  return <GalleryRoute element={<PosterPage />} />;
}
