import HomeScene from 'scenes/Home/Home';
import GalleryV2Route from 'scenes/_Router/GalleryV2Route';

export default function Index() {
  return <GalleryV2Route element={<HomeScene />} navbar={false} />;
}
