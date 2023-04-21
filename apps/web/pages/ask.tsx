import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import BrainPage from '~/scenes/BrainPage/BrainPage';

export default function Brain() {
  return <GalleryRoute element={<BrainPage />} navbar={false} />;
}
