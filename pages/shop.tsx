import MerchStorePage from 'scenes/MerchStorePage/MerchStorePage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Privacy() {
  return <GalleryRoute element={<MerchStorePage />} navbar={false} />;
}
