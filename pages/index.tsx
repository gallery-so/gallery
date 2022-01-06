import HomeScene from 'scenes/Home/Home';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Index() {
  return <GalleryRoute path="/" component={HomeScene} navbar={false} footerVisibleOutOfView />;
}
