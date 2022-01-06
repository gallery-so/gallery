import AuthScene from 'scenes/Auth/Auth';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Auth() {
  return <GalleryRoute element={<AuthScene />} navbar={false} footerVisibleOutOfView />;
}
