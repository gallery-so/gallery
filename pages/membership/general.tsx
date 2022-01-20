import GalleryRoute from 'scenes/_Router/GalleryRoute';
import PartnerMembershipMintPage from 'scenes/MembershipMintPage/PartnerMembershipMintPage';
import { PARTNER_MINT_ENABLED } from 'utils/featureFlag';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';

export default function General() {
  if (!PARTNER_MINT_ENABLED) {
    return <GalleryRedirect to="/" />;
  }

  return <GalleryRoute element={<PartnerMembershipMintPage />} navbar={false} />;
}
