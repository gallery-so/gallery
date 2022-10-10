import LandingPageScene from 'scenes/LandingPage/LandingPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Index() {
  return <GalleryRoute element={<LandingPageScene />} navbar={false} />;
}
