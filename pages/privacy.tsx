import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import PrivacyPolicyPage from '~/scenes/BasicTextPage/PrivacyPolicyPage';

export default function Privacy() {
  return <GalleryRoute element={<PrivacyPolicyPage />} navbar={false} />;
}
