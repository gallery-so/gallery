import GalleryRoute from 'scenes/_Router/GalleryRoute';
import GeneralMembershipMintPage from 'scenes/MembershipMintPage/GeneralMembershipMintPage';
import { PARTNER_MINT_ENABLED } from 'utils/featureFlag';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';

export default function General() {
  if (!PARTNER_MINT_ENABLED) {
    return <GalleryRedirect to="/" />;
  }

  return <GalleryRoute element={<GeneralMembershipMintPage />} navbar={false} />;
}
