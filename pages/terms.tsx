import TermsPage from 'scenes/BasicTextPage/TermsPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Terms() {
  return <GalleryRoute element={<TermsPage />} navbar={false} />;
}
