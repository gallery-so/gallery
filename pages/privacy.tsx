import PrivacyPolicyPage from 'scenes/BasicTextPage/PrivacyPolicyPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Privacy() {
  return <GalleryRoute element={<PrivacyPolicyPage />} navbar={false} />;
}
