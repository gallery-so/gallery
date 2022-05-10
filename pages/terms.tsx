import TermsPage from 'scenes/BasicTextPage/TermsPage';
import GalleryV2Route from 'scenes/_Router/GalleryV2Route';

export default function Terms() {
  return <GalleryV2Route element={<TermsPage />} navbar={false} />;
}
