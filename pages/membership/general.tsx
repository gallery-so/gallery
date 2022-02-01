import GalleryRoute from 'scenes/_Router/GalleryRoute';
import GeneralMembershipMintPage from 'scenes/MembershipMintPage/GeneralMembershipMintPage';

import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { FeatureFlag } from 'components/core/enums';
import { isFeatureEnabled } from 'utils/featureFlag';

export default function General() {
  if (!isFeatureEnabled(FeatureFlag.GENERAL_MEMBERSHIP_MINT)) {
    return <GalleryRedirect to="/" />;
  }

  return <GalleryRoute element={<GeneralMembershipMintPage />} navbar={false} />;
}
