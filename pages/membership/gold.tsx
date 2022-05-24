import GoldMembershipMintPage from 'scenes/MembershipMintPage/GoldMembershipMintPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function SilverMembership() {
  return <GalleryRoute element={<GoldMembershipMintPage />} navbar={false} />;
}
