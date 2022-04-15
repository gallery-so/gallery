import PosterPage from 'scenes/PosterPage/PosterPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Poster() {
  return <GalleryRoute element={<PosterPage />} />;
}
