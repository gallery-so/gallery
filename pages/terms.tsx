import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import TermsPage from '~/scenes/BasicTextPage/TermsPage';

export default function Terms() {
  return <GalleryRoute element={<TermsPage />} navbar={false} />;
}
