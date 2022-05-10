import SilverMembershipMintPage from 'scenes/MembershipMintPage/SilverMembershipMintPage';
import GalleryV2Route from 'scenes/_Router/GalleryV2Route';

export default function SilverMembership() {
  return <GalleryV2Route element={<SilverMembershipMintPage />} navbar={false} />;
}
