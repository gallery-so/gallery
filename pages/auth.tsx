import AuthScene from 'scenes/Auth/Auth';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Auth() {
  return <GalleryRoute path="/auth" component={AuthScene} navbar={false} footerVisibleOutOfView />;
}
