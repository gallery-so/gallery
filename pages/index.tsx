import HomeScene from 'scenes/Home/Home';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Index() {
  return <GalleryRoute element={<HomeScene />} navbar={false} footerVisibleOutOfView />;
}
