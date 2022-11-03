import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import MerchStorePage from '~/scenes/MerchStorePage/MerchStorePage';

export default function Privacy() {
  return <GalleryRoute element={<MerchStorePage />} navbar={false} />;
}
