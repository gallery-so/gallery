import PrivacyPolicyPage from 'scenes/BasicTextPage/PrivacyPolicyPage';
import GalleryV2Route from 'scenes/_Router/GalleryV2Route';

export default function Privacy() {
  return <GalleryV2Route element={<PrivacyPolicyPage />} navbar={false} />;
}
