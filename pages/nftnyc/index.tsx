import NftNycEventPage from 'scenes/NftNycEventPage/NftNycEventPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function NftNycEvent() {
  return <GalleryRoute navbar={false} footer={false} element={<NftNycEventPage />} />;
}
