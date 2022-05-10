import GoldMembershipMintPage from 'scenes/MembershipMintPage/GoldMembershipMintPage';
import GalleryV2Route from 'scenes/_Router/GalleryV2Route';

export default function SilverMembership() {
  return <GalleryV2Route element={<GoldMembershipMintPage />} navbar={false} />;
}
