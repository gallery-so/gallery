import HomeScene from 'scenes/Home/Home';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Home() {
  return <GalleryRoute element={<HomeScene />} navbar={true} />;
}
