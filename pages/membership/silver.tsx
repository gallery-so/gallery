import SilverMembershipMintPage from 'scenes/MembershipMintPage/SilverMembershipMintPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function SilverMembership() {
  return <GalleryRoute element={<SilverMembershipMintPage />} navbar={false} />;
}
